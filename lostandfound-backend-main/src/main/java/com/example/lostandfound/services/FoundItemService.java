package com.example.lostandfound.services;

import com.example.lostandfound.models.FoundItem;
import com.example.lostandfound.models.ItemStatus;
import com.example.lostandfound.repositories.FoundItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FoundItemService {
    @Autowired
    private FoundItemRepository foundItemRepository;

    public List<FoundItem> getAllFoundItems() {
        return foundItemRepository.findAll();
    }

    public FoundItem getFoundItemById(Long id) {
        return foundItemRepository.findById(id).orElse(null);
    }

    public FoundItem createFoundItem(FoundItem foundItem) {
        return foundItemRepository.save(foundItem);
    }

    public FoundItem updateFoundItem(Long id, FoundItem foundItemDetails) {
        FoundItem foundItem = foundItemRepository.findById(id).orElse(null);
        if (foundItem != null) {
            foundItem.setItemName(foundItemDetails.getItemName());
            foundItem.setDescription(foundItemDetails.getDescription());
            foundItem.setFoundLocation(foundItemDetails.getFoundLocation());
            foundItem.setFoundDate(foundItemDetails.getFoundDate());
            foundItem.setStatus(foundItemDetails.getStatus());
            foundItem.setCategory(foundItemDetails.getCategory());
            return foundItemRepository.save(foundItem);
        }
        return null;
    }

    public void deleteFoundItem(Long id) {
        foundItemRepository.deleteById(id);
    }

    public List<FoundItem> getFoundItemsByStatus(ItemStatus status) {
        return foundItemRepository.findByStatus(status);
    }

    public List<FoundItem> getFoundItemsByCategory(Long categoryId) {
        return foundItemRepository.findByCategoryId(categoryId); // Fixed method name
    }
}