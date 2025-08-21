package com.example.lostandfound.services;

import com.example.lostandfound.models.LostItem;
import com.example.lostandfound.repositories.LostItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LostItemService {
    @Autowired
    private LostItemRepository lostItemRepository;

    public List<LostItem> getAllLostItems() {
        return lostItemRepository.findAll();
    }

    public LostItem getLostItemById(Long id) {
        return lostItemRepository.findById(id).orElse(null);
    }

    public LostItem createLostItem(LostItem lostItem) {
        return lostItemRepository.save(lostItem);
    }
    
    public LostItem updateLostItem(Long id, LostItem lostItemDetails) {
        LostItem lostItem = lostItemRepository.findById(id).orElse(null);
        if (lostItem != null) {
            lostItem.setItemName(lostItemDetails.getItemName());
            lostItem.setDescription(lostItemDetails.getDescription());
            lostItem.setLostLocation(lostItemDetails.getLostLocation());
            lostItem.setLostDate(lostItemDetails.getLostDate());
            lostItem.setStatus(lostItemDetails.getStatus());
            lostItem.setCategory(lostItemDetails.getCategory());
            return lostItemRepository.save(lostItem);
        }
        return null;
    }

    public void deleteLostItem(Long id) {
        lostItemRepository.deleteById(id);
    }
}