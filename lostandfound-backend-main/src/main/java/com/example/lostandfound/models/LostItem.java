package com.example.lostandfound.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class LostItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long lostId;

    private String itemName;
    private String description;
    private String lostLocation;
    private LocalDateTime lostDate;

    @Enumerated(EnumType.STRING)
    private ItemStatus status;

    @ManyToOne
    @JoinColumn(name = "category_id")
    @JsonBackReference(value = "category-lost-items")
    private Category category;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "verification_details_id")
    private ItemVerificationDetails verificationDetails;

    public Long getLostId() {
        return lostId;
    }

    public void setLostId(Long lostId) {
        this.lostId = lostId;
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

    public String getLostLocation() {
        return lostLocation;
    }

    public void setLostLocation(String lostLocation) {
        this.lostLocation = lostLocation;
    }

    public LocalDateTime getLostDate() {
        return lostDate;
    }

    public void setLostDate(LocalDateTime lostDate) {
        this.lostDate = lostDate;
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