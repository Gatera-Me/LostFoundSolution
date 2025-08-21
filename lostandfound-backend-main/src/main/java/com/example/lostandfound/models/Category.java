package com.example.lostandfound.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.*;
import java.util.Set;

@Entity
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

    private String name;

    @JsonManagedReference("category-lost-items")
    @OneToMany(mappedBy = "category", fetch = FetchType.EAGER)
    private Set<LostItem> lostItems;

    @JsonManagedReference("category-found-items")
    @OneToMany(mappedBy = "category", fetch = FetchType.EAGER)
    private Set<FoundItem> foundItems;

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<LostItem> getLostItems() {
        return lostItems;
    }

    public void setLostItems(Set<LostItem> lostItems) {
        this.lostItems = lostItems;
    }

    public Set<FoundItem> getFoundItems() {
        return foundItems;
    }

    public void setFoundItems(Set<FoundItem> foundItems) {
        this.foundItems = foundItems;
    }
}