package com.example.lostandfound.controllers;

import com.example.lostandfound.models.Match;
import com.example.lostandfound.models.ItemStatus;
import com.example.lostandfound.services.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.OPTIONS}, allowedHeaders = "*")
@RequestMapping("/matches")
public class MatchController {
    @Autowired
    private MatchService matchService;

    @GetMapping
    public ResponseEntity<List<Match>> getAllMatches(@RequestHeader("Authorization") String token) {
        try {
            System.out.println("Received GET /matches request with token: " + token);
            List<Match> matches = matchService.getAllMatches();
            return ResponseEntity.ok(matches);
        } catch (Exception e) {
            System.err.println("Failed to fetch matches: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<Match> createMatch(@RequestBody Match match, @RequestHeader("Authorization") String token) {
        try {
            System.out.println("Received POST /matches request: " + match + " with token: " + token);
            Match createdMatch = matchService.createMatch(match);
            return ResponseEntity.ok(createdMatch);
        } catch (IllegalArgumentException e) {
            System.err.println("Failed to create match: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            System.err.println("Error creating match: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMatchStatus(@PathVariable Long id, @RequestBody Map<String, String> requestBody, @RequestHeader("Authorization") String token) {
        try {
            System.out.println("Received PUT /matches/" + id + " with body: " + requestBody + " and token: " + token);
            String statusStr = requestBody.get("status");
            if (statusStr == null) {
                System.out.println("Missing status in request body");
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }
            ItemStatus status;
            try {
                status = ItemStatus.valueOf(statusStr);
            } catch (IllegalArgumentException e) {
                System.out.println("Invalid status value: " + statusStr);
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid status value: " + statusStr));
            }
            Match updatedMatch = matchService.updateMatchStatus(id, status);
            System.out.println("Updated match ID " + id + " to status: " + status);
            return ResponseEntity.ok(updatedMatch);
        } catch (IllegalArgumentException e) {
            System.err.println("Failed to update match ID " + id + ": " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Error updating match ID " + id + ": " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }
}