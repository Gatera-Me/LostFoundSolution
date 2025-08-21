package com.example.lostandfound.models;

import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long matchId;

    @JsonBackReference("lost-item-matches")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lost_id", referencedColumnName = "lostId")
    private LostItem lostItem;

    @JsonBackReference("found-item-matches")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "found_id", referencedColumnName = "foundId")
    private FoundItem foundItem;

    @JsonBackReference("user-matches")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "matched_by", referencedColumnName = "userId")
    private Users matchedBy;

    private Date matchDate;

    @Enumerated(EnumType.STRING)
    private ItemStatus status;

    public Long getMatchId() {
        return matchId;
    }

    public void setMatchId(Long matchId) {
        this.matchId = matchId;
    }

    public LostItem getLostItem() {
        return lostItem;
    }

    public void setLostItem(LostItem lostItem) {
        this.lostItem = lostItem;
    }

    public FoundItem getFoundItem() {
        return foundItem;
    }

    public void setFoundItem(FoundItem foundItem) {
        this.foundItem = foundItem;
    }

    public Users getMatchedBy() {
        return matchedBy;
    }

    public void setMatchedBy(Users matchedBy) {
        this.matchedBy = matchedBy;
    }

    public Date getMatchDate() {
        return matchDate;
    }

    public void setMatchDate(Date matchDate) {
        this.matchDate = matchDate;
    }

    public ItemStatus getStatus() {
        return status;
    }

    public void setStatus(ItemStatus status) {
        this.status = status;
    }
}