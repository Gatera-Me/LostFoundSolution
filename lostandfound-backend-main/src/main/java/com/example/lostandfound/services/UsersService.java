package com.example.lostandfound.services;

import com.example.lostandfound.models.Users;
import com.example.lostandfound.repositories.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsersService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired(required = false)
    private BCryptPasswordEncoder passwordEncoder;

    // For registration via fields (with password hashing)
    public Users createUser(String username, String email, String password, String role) {
        if (usersRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (usersRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists");
        }
        Users user = new Users();
        user.setUsername(username);
        user.setEmail(email);
        if (passwordEncoder != null) {
            user.setPassword(passwordEncoder.encode(password)); // Hash password
        } else {
            user.setPassword(password); // fallback, but should not happen
        }
        user.setRole(role.toUpperCase());
        return usersRepository.save(user);
    }

    // For registration via Users object (e.g. admin or backend)
    public Users createUser(Users user) {
        if (user.getPassword() != null && passwordEncoder != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return usersRepository.save(user);
    }

    public boolean userExistsByEmail(String email) {
        return usersRepository.existsByEmail(email);
    }

    public boolean userExistsByUsername(String username) {
        return usersRepository.existsByUsername(username);
    }

    public boolean userExistsByEmailExcludingId(String email, Long id) {
        return usersRepository.existsByEmailAndIdNot(email, id);
    }

    public boolean userExistsByUsernameExcludingId(String username, Long id) {
        return usersRepository.existsByUsernameAndIdNot(username, id);
    }

    public List<Users> getAllUsers() {
        return usersRepository.findAll();
    }

    public Users getUserById(Long id) {
        return usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public Users updateUser(Long id, Users userDetails) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        // Only encode password if non-empty and not already hashed
        if (userDetails.getPassword() != null && !userDetails.getPassword().isBlank()) {
            if (passwordEncoder != null && !userDetails.getPassword().startsWith("$2a$")) {
                user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
            } else {
                user.setPassword(userDetails.getPassword());
            }
        }
        user.setRole(userDetails.getRole());
        return usersRepository.save(user);
    }

    public void deleteUser(Long id) {
        if (!usersRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        usersRepository.deleteById(id);
    }

    public boolean isAdmin(Long userId) {
        Users user = getUserById(userId);
        return "ADMIN".equalsIgnoreCase(user.getRole());
    }

    public Users findByEmail(String email) {
        return usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
}