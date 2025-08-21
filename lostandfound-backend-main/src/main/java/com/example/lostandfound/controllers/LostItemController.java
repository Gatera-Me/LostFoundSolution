package com.example.lostandfound.controllers;

import com.example.lostandfound.models.LostItem;
import com.example.lostandfound.services.LostItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RequestMapping("/lost-items")
public class LostItemController {
    @Autowired
    private LostItemService lostItemService;

    @GetMapping
    public List<LostItem> getAllLostItems() {
        return lostItemService.getAllLostItems();
    }

    @GetMapping("/{id}")
    public LostItem getLostItemById(@PathVariable Long id) {
        return lostItemService.getLostItemById(id);
    }

    @PostMapping
    public LostItem createLostItem(@RequestBody LostItem lostItem) {
        return lostItemService.createLostItem(lostItem);
    }

    @PutMapping("/{id}")
    public LostItem updateLostItem(@PathVariable Long id, @RequestBody LostItem lostItemDetails) {
        return lostItemService.updateLostItem(id, lostItemDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteLostItem(@PathVariable Long id) {
        lostItemService.deleteLostItem(id);
    }
}