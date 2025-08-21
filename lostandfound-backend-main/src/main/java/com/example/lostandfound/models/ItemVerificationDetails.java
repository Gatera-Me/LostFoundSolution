package com.example.lostandfound.models;

import jakarta.persistence.*;

@Entity
public class ItemVerificationDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String uniqueMark;
    private String serialNumber;
    private String photoUrl;
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getUniqueMark() {
        return uniqueMark;
    }
    public void setUniqueMark(String uniqueMark) {
        this.uniqueMark = uniqueMark;
    }
    public String getSerialNumber() {
        return serialNumber;
    }
    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }
    public String getPhotoUrl() {
        return photoUrl;
    }
    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    
}