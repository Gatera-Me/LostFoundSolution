package com.example.lostandfound.controllers;

import com.example.lostandfound.models.FoundItem;
import com.example.lostandfound.models.LostItem;
import com.example.lostandfound.models.Match;
import com.example.lostandfound.models.Users;
import com.example.lostandfound.repositories.FoundItemRepository;
import com.example.lostandfound.repositories.LostItemRepository;
import com.example.lostandfound.repositories.MatchRepository;
import com.example.lostandfound.repositories.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/search")
public class SearchController {

    @Autowired
    private LostItemRepository lostItemRepository;

    @Autowired
    private FoundItemRepository foundItemRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private MatchRepository matchRepository;

    @GetMapping
    public List<Map<String, Object>> search(@RequestParam String q) {
        List<Map<String, Object>> results = new ArrayList<>();

        // Search Lost Items
        List<LostItem> lostItems = lostItemRepository.findByItemNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(q);
        for (LostItem item : lostItems) {
            Map<String, Object> result = new HashMap<>();
            result.put("type", "LostItem");
            result.put("id", item.getLostId());
            result.put("itemName", item.getItemName());
            result.put("description", item.getDescription());
            results.add(result);
        }

        // Search Found Items
        List<FoundItem> foundItems = foundItemRepository.findByItemNameContainingIgnoreCaseOrFoundLocationContainingIgnoreCase(q);
        for (FoundItem item : foundItems) {
            Map<String, Object> result = new HashMap<>();
            result.put("type", "FoundItem");
            result.put("id", item.getFoundId());
            result.put("itemName", item.getItemName());
            result.put("foundLocation", item.getFoundLocation());
            results.add(result);
        }

        // Search Users (No role check for now)
        List<Users> users = usersRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(q);
        for (Users user : users) {
            Map<String, Object> result = new HashMap<>();
            result.put("type", "User");
            result.put("id", user.getUserId());
            result.put("username", user.getUsername());
            result.put("email", user.getEmail());
            results.add(result);
        }

        // Search Matches
        List<Match> matches = matchRepository.findAll();
        for (Match match : matches) {
            if (match.getLostItem().getItemName().toLowerCase().contains(q.toLowerCase()) ||
                match.getFoundItem().getItemName().toLowerCase().contains(q.toLowerCase())) {
                Map<String, Object> result = new HashMap<>();
                result.put("type", "Match");
                result.put("id", match.getMatchId());
                result.put("lostItemName", match.getLostItem().getItemName());
                result.put("foundItemName", match.getFoundItem().getItemName());
                results.add(result);
            }
        }

        return results;
    }
}