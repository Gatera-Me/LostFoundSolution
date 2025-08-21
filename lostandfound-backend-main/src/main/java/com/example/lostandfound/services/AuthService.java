// src/main/java/com/example/lostandfound/services/AuthService.java
package com.example.lostandfound.services;

import com.example.lostandfound.models.Otp;
import com.example.lostandfound.models.PasswordResetToken;
import com.example.lostandfound.models.Users;
import com.example.lostandfound.repositories.OtpRepository;
import com.example.lostandfound.repositories.PasswordResetTokenRepository;
import com.example.lostandfound.repositories.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private OtpRepository otpRepository;

    @Autowired(required = false)
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender mailSender;

    @Transactional
    public Users authenticateUser(String email, String password) {
        System.out.println("Authenticating user: " + email);
        Users user = usersRepository.findByEmail(email).orElse(null);
        if (user == null) {
            System.out.println("User not found for email: " + email);
            throw new IllegalArgumentException("Invalid email or password");
        }
        if (password != null && !passwordEncoder.matches(password, user.getPassword())) {
            System.out.println("Password mismatch for email: " + email + ", provided: [hidden], stored: " + user.getPassword());
            throw new IllegalArgumentException("Invalid email or password");
        }
        System.out.println("User authenticated: " + email);
        return user;
    }

    @Transactional
    public String generateOtp(String email, String tempToken) {
        System.out.println("Generating OTP for email: " + email + ", tempToken: " + tempToken);
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        String otpString = String.valueOf(otp);
        Otp otpEntity = new Otp();
        otpEntity.setTempToken(tempToken);
        otpEntity.setEmail(email);
        otpEntity.setOtp(otpString);
        otpEntity.setExpiry(LocalDateTime.now().plusMinutes(10));
        System.out.println("Saving OTP to database: tempToken=" + tempToken + ", email=" + email + ", otp=" + otpString);
        try {
            Otp savedOtp = otpRepository.saveAndFlush(otpEntity);
            System.out.println("Saved OTP - id=" + savedOtp.getId() + ", tempToken=" + savedOtp.getTempToken() + ", email=" + savedOtp.getEmail() + ", otp=" + savedOtp.getOtp());
        } catch (DataIntegrityViolationException e) {
            System.err.println("Failed to save OTP due to data integrity issue: tempToken=" + tempToken + ", error=" + e.getMessage());
            throw new RuntimeException("Failed to save OTP: " + e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("Failed to save OTP: tempToken=" + tempToken + ", error=" + e.getMessage());
            throw new RuntimeException("Failed to save OTP: " + e.getMessage(), e);
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("AUCA Lost and Found - Your OTP");
            message.setText("Your OTP is: " + otpString + "\nValid for 10 minutes.");
            mailSender.send(message);
            System.out.println("Sent OTP email to " + email + ": " + otpString);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email to " + email + ": " + e.getMessage());
        }

        return otpString;
    }

    @Transactional
    public String verifyOtp(String tempToken, String otp) {
        System.out.println("Verifying OTP - tempToken: " + tempToken + ", provided OTP: " + otp);
        Optional<Otp> otpEntity = otpRepository.findByTempToken(tempToken);
        System.out.println("Database query for tempToken: " + tempToken + ", found: " + otpEntity.isPresent());
        if (otpEntity.isEmpty() || LocalDateTime.now().isAfter(otpEntity.get().getExpiry())) {
            System.out.println("No OTP data or expired for tempToken: " + tempToken);
            if (otpEntity.isPresent()) {
                System.out.println("Deleting expired OTP: tempToken=" + tempToken);
                otpRepository.deleteByTempToken(tempToken);
            }
            return null;
        }
        boolean isValid = otpEntity.get().getOtp().equals(otp);
        System.out.println("OTP valid: " + isValid + " for tempToken: " + tempToken);
        if (isValid) {
            String email = otpEntity.get().getEmail();
            System.out.println("Deleting OTP: tempToken=" + tempToken);
            otpRepository.deleteByTempToken(tempToken);
            System.out.println("OTP deleted for tempToken: " + tempToken);
            return email;
        }
        return null;
    }

    @Transactional
    public String getEmailByTempToken(String tempToken) {
        System.out.println("Looking up email for tempToken: " + tempToken);
        Optional<Otp> otpEntity = otpRepository.findByTempToken(tempToken);
        System.out.println("Database query for tempToken: " + tempToken + ", found email: " + (otpEntity.isPresent() ? otpEntity.get().getEmail() : "null"));
        return otpEntity.isPresent() ? otpEntity.get().getEmail() : null;
    }

    @Transactional
    public void createPasswordResetToken(String email) {
        System.out.println("Creating password reset token for email: " + email);
        Users user = usersRepository.findByEmail(email).orElse(null);
        if (user == null) {
            System.out.println("User not found for email: " + email);
            throw new IllegalArgumentException("User not found");
        }
        if (tokenRepository == null || mailSender == null) {
            throw new IllegalStateException("Password reset dependencies are not configured");
        }

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(
                token,
                user,
                LocalDateTime.now().plusHours(24)
        );
        tokenRepository.save(resetToken);

        sendResetEmail(user.getEmail(), token);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        System.out.println("Resetting password for token: " + token);
        if (tokenRepository == null) {
            throw new IllegalStateException("Password reset dependencies are not configured");
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(token);
        if (resetToken == null || resetToken.isExpired()) {
            throw new IllegalArgumentException("Invalid or expired token");
        }

        Users user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        usersRepository.save(user);

        tokenRepository.delete(resetToken);
    }

    private void sendResetEmail(String to, String token) {
        if (mailSender == null) {
            throw new IllegalStateException("Mail sender is not configured");
        }

        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset Request");
        message.setText("To reset your password, click the link below:\n" + resetUrl +
                "\nThis link will expire in 24 hours.");
        mailSender.send(message);
    }
}