package com.example.lostandfound.repositories;

import com.example.lostandfound.models.FoundItem;
import com.example.lostandfound.models.ItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface FoundItemRepository extends JpaRepository<FoundItem, Long> {
    @Query("SELECT f FROM FoundItem f WHERE f.category.categoryId = :categoryId")
    List<FoundItem> findByCategoryId(@Param("categoryId") Long categoryId);

    List<FoundItem> findByStatus(ItemStatus status);

    @Modifying
    @Transactional
    @Query("UPDATE FoundItem fi SET fi.status = :status WHERE fi.foundId = :foundId")
    void updateStatus(@Param("foundId") Long foundId, @Param("status") ItemStatus status);

    @Query("SELECT fi FROM FoundItem fi WHERE LOWER(fi.itemName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(fi.foundLocation) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<FoundItem> findByItemNameContainingIgnoreCaseOrFoundLocationContainingIgnoreCase(@Param("query") String query);
}