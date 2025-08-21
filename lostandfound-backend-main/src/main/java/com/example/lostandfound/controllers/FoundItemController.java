package com.example.lostandfound.controllers;

import com.example.lostandfound.models.FoundItem;
import com.example.lostandfound.models.ItemStatus;
import com.example.lostandfound.repositories.FoundItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.logging.Logger;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RequestMapping("/found-items")
public class FoundItemController {

    private static final Logger LOGGER = Logger.getLogger(FoundItemController.class.getName());

    @Autowired
    private FoundItemRepository foundItemRepository;

    @GetMapping
    public ResponseEntity<List<FoundItem>> getAllFoundItems() {
        try {
            List<FoundItem> items = foundItemRepository.findAll();
            items.forEach(item -> {
                if (item.getStatus() == null) {
                    try {
                        item.setStatus(ItemStatus.AVAILABLE);
                        foundItemRepository.updateStatus(item.getFoundId(), ItemStatus.AVAILABLE);
                    } catch (Exception e) {
                        LOGGER.warning("Failed to update status for foundId " + item.getFoundId() + ": " + e.getMessage());
                    }
                }
            });
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            LOGGER.severe("Error fetching found items: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoundItem> getFoundItemById(@PathVariable Long id) {
        try {
            return foundItemRepository.findById(id)
                .map(item -> {
                    if (item.getStatus() == null) {
                        try {
                            item.setStatus(ItemStatus.AVAILABLE);
                            foundItemRepository.updateStatus(id, ItemStatus.AVAILABLE);
                        } catch (Exception e) {
                            LOGGER.warning("Failed to update status for foundId " + id + ": " + e.getMessage());
                        }
                    }
                    return ResponseEntity.ok(item);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            LOGGER.severe("Error fetching found item " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<FoundItem> createFoundItem(@RequestBody FoundItem foundItem) {
        try {
            if (foundItem.getStatus() == null) {
                foundItem.setStatus(ItemStatus.AVAILABLE);
            }
            if (foundItem.getItemName() == null || foundItem.getFoundLocation() == null || foundItem.getFoundDate() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
            }
            FoundItem savedItem = foundItemRepository.save(foundItem);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedItem);
        } catch (Exception e) {
            LOGGER.severe("Error creating found item: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}