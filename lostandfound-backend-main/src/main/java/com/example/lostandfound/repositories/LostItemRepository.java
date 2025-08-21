package com.example.lostandfound.repositories;

import com.example.lostandfound.models.LostItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LostItemRepository extends JpaRepository<LostItem, Long> {
    @Query("SELECT li FROM LostItem li WHERE LOWER(li.itemName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(li.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<LostItem> findByItemNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(@Param("query") String query);
}