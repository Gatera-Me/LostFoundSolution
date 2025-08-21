// src/main/java/com/example/lostandfound/controllers/AuthController.java
package com.example.lostandfound.controllers;

import com.example.lostandfound.models.Users;
import com.example.lostandfound.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "http://localhost:5173", methods = {RequestMethod.POST, RequestMethod.GET, RequestMethod.OPTIONS}, allowedHeaders = "*")
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            System.out.println("Received /auth/login request: " + request);
            String email = request.get("email");
            String password = request.get("password");
            if (email == null || password == null) {
                System.out.println("Missing email or password in /auth/login");
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
            }
            Users user = authService.authenticateUser(email, password);
            String tempToken = UUID.randomUUID().toString();
            authService.generateOtp(email, tempToken);
            System.out.println("Returning tempToken: " + tempToken);
            return ResponseEntity.ok(Map.of(
                "status", "2fa_required",
                "tempToken", tempToken
            ));
        } catch (IllegalArgumentException e) {
            System.out.println("Login failed: " + e.getMessage());
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.out.println("Login error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        try {
            System.out.println("Received /auth/verify-otp request: " + request);
            String tempToken = request.get("tempToken");
            String otp = request.get("otp");
            if (tempToken == null || otp == null) {
                System.out.println("Missing tempToken or otp in /auth/verify-otp");
                return ResponseEntity.badRequest().body(Map.of("error", "Temp token and OTP are required"));
            }
            String email = authService.verifyOtp(tempToken, otp);
            if (email == null) {
                System.out.println("Invalid OTP or tempToken: " + tempToken);
                return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired OTP"));
            }
            Users user = authService.authenticateUser(email, null);
            String token = "jwt-token-" + user.getUserId();
            Map<String, Object> response = Map.of(
                "token", token,
                "user", Map.of(
                    "id", user.getUserId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "role", user.getRole()
                )
            );
            System.out.println("OTP verified, returning token for user: " + user.getEmail());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            System.out.println("Verify OTP failed: " + e.getMessage());
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.out.println("Verify OTP error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "OTP verification failed: " + e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            System.out.println("Received /auth/forgot-password request: " + request);
            String email = request.get("email");
            if (email == null || email.isEmpty()) {
                System.out.println("Missing email in /auth/forgot-password");
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            authService.createPasswordResetToken(email);
            return ResponseEntity.ok(Map.of("message", "Password reset link sent to email"));
        } catch (IllegalArgumentException e) {
            System.out.println("Forgot password failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.out.println("Forgot password error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Failed to send reset email"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            System.out.println("Received /auth/reset-password request: " + request);
            String token = request.get("token");
            String newPassword = request.get("newPassword");
            if (token == null || newPassword == null) {
                System.out.println("Missing token or newPassword in /auth/reset-password");
                return ResponseEntity.badRequest().body(Map.of("error", "Token and new password are required"));
            }
            authService.resetPassword(token, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (IllegalArgumentException e) {
            System.out.println("Reset password failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.out.println("Reset password error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Failed to reset password"));
        }
    }
}