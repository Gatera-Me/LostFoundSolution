package com.example.lostandfound.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class FoundItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long foundId;

    private String itemName;
    private String description;
    private String foundLocation;
    private LocalDateTime foundDate;

    @Enumerated(EnumType.STRING)
    private ItemStatus status;

    @ManyToOne
    @JoinColumn(name = "category_id")
    @JsonBackReference(value = "category-found-items")
    private Category category;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "verification_details_id")
    private ItemVerificationDetails verificationDetails;

    public Long getFoundId() {
        return foundId;
    }

    public void setFoundId(Long foundId) {
        this.foundId = foundId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFoundLocation() {
        return foundLocation;
    }

    public void setFoundLocation(String foundLocation) {
        this.foundLocation = foundLocation;
    }

    public LocalDateTime getFoundDate() {
        return foundDate;
    }

    public void setFoundDate(LocalDateTime foundDate) {
        this.foundDate = foundDate;
    }

    public ItemStatus getStatus() {
        return status;
    }

    public void setStatus(ItemStatus status) {
        this.status = status;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public ItemVerificationDetails getVerificationDetails() {
        return verificationDetails;
    }

    public void setVerificationDetails(ItemVerificationDetails verificationDetails) {
        this.verificationDetails = verificationDetails;
    }

    
}