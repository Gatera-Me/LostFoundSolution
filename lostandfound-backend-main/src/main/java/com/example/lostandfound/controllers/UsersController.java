package com.example.lostandfound.controllers;

import com.example.lostandfound.models.Users;
import com.example.lostandfound.services.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RequestMapping("/users")
public class UsersController {
    @Autowired
    private UsersService usersService;

    @GetMapping
    public List<Users> getAllUsers() {
        return usersService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            Users user = usersService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * This POST endpoint accepts both Map<String, String> and Users object as input for user creation.
     * If the incoming request is a JSON object with username, email, password, role fields, it will use the map-based logic.
     * Otherwise, it falls back to the default Users object logic with duplicate checks.
     */
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> request) {
        // Try to parse as String fields (for frontend forms sending JSON as {username, email, password, role})
        if (request.containsKey("username") && request.containsKey("email") && request.containsKey("password") && request.containsKey("role")) {
            try {
                String username = String.valueOf(request.get("username"));
                String email = String.valueOf(request.get("email"));
                String password = String.valueOf(request.get("password"));
                String role = String.valueOf(request.get("role"));
                if (username == null || email == null || password == null || role == null) {
                    return ResponseEntity.badRequest().body(Map.of("error", "All fields are required"));
                }
                // Check for duplicates
                if (usersService.userExistsByEmail(email)) {
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email already registered"));
                }
                if (usersService.userExistsByUsername(username)) {
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Username already taken"));
                }
                Users user = usersService.createUser(username, email, password, role);
                return ResponseEntity.ok(Map.of(
                    "id", user.getUserId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "role", user.getRole()
                ));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            } catch (Exception e) {
                return ResponseEntity.status(500).body(Map.of("error", "Failed to create user: " + e.getMessage()));
            }
        } else {
            // Fallback: try to convert to Users (for backend-to-backend or manual API calls)
            try {
                String email = String.valueOf(request.get("email"));
                String username = String.valueOf(request.get("username"));
                Users user = new Users();
                user.setEmail(email);
                user.setUsername(username);
                user.setPassword(String.valueOf(request.get("password")));
                user.setRole(String.valueOf(request.get("role")));

                // Check for duplicates
                if (usersService.userExistsByEmail(user.getEmail())) {
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email already registered"));
                }
                if (usersService.userExistsByUsername(user.getUsername())) {
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Username already taken"));
                }

                Users createdUser = usersService.createUser(user);
                return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
            } catch (Exception e) {
                return ResponseEntity.status(500).body(Map.of("error", "Failed to create user: " + e.getMessage()));
            }
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Users userDetails) {
        try {
            Map<String, String> response = new HashMap<>();
            
            // Check if another user has this email
            if (usersService.userExistsByEmailExcludingId(userDetails.getEmail(), id)) {
                response.put("error", "Email already used by another user");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }
            
            // Check if another user has this username
            if (usersService.userExistsByUsernameExcludingId(userDetails.getUsername(), id)) {
                response.put("error", "Username already used by another user");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }
            
            Users updatedUser = usersService.updateUser(id, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // @DeleteMapping("/{id}")
    // public ResponseEntity<?> deleteUser(@PathVariable Long id) {
    //     try {
    //         usersService.deleteUser(id);
    //         Map<String, String> response = new HashMap<>();
    //         response.put("message", "User deleted successfully");
    //         return ResponseEntity.ok(response);
    //     } catch (Exception e) {
    //         Map<String, String> response = new HashMap<>();
    //         response.put("error", e.getMessage());
    //         return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    //     }
    // }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @RequestHeader("User-Id") Long requesterId) {
        if (!usersService.isAdmin(requesterId)) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Only admins can delete users");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
        usersService.deleteUser(id);
        return ResponseEntity.ok().body(Map.of("message", "User deleted"));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        try {
            Users user = usersService.findByEmail(email); // Add this method to UsersService
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
            }
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}