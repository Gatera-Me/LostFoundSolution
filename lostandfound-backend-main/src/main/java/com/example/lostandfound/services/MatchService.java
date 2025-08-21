package com.example.lostandfound.services;

import com.example.lostandfound.models.Match;
import com.example.lostandfound.models.ItemStatus;
import com.example.lostandfound.repositories.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MatchService {

    @Autowired
    private MatchRepository matchRepository;

    public List<Match> getAllMatches() {
        System.out.println("Fetching all open matches with details");
        return matchRepository.findAllOpenMatchesWithDetails();
    }

    public Match createMatch(Match match) {
        System.out.println("Creating match: " + match);
        if (match.getStatus() == null) {
            match.setStatus(ItemStatus.OPEN);
        }
        if (match.getLostItem() == null || match.getFoundItem() == null) {
            System.err.println("Cannot create match: lostItem or foundItem is null");
            throw new IllegalArgumentException("lostItem and foundItem are required");
        }
        return matchRepository.save(match);
    }

    public Match updateMatchStatus(Long id, ItemStatus status) {
        System.out.println("Updating match ID " + id + " to status: " + status);
        Match match = matchRepository.findById(id)
            .orElseThrow(() -> {
                System.err.println("Match not found with id: " + id);
                return new IllegalArgumentException("Match not found with id: " + id);
            });
        System.out.println("Found match: ID=" + match.getMatchId() + ", lostItem=" + (match.getLostItem() != null ? match.getLostItem().getLostId() : null) + ", foundItem=" + (match.getFoundItem() != null ? match.getFoundItem().getFoundId() : null) + ", currentStatus=" + match.getStatus());
        if (match.getLostItem() == null || match.getFoundItem() == null) {
            System.err.println("Match ID " + id + " has invalid lostItem or foundItem: lostItem=" + match.getLostItem() + ", foundItem=" + match.getFoundItem());
            throw new IllegalArgumentException("Match has invalid lostItem or foundItem");
        }
        if (match.getStatus() != ItemStatus.OPEN) {
            System.err.println("Invalid status transition for match ID " + id + ": current status " + match.getStatus() + " cannot transition to " + status);
            throw new IllegalArgumentException("Only OPEN matches can be approved or rejected");
        }
        if (status != ItemStatus.APPROVE && status != ItemStatus.REJECT) {
            System.err.println("Invalid status value for match ID " + id + ": " + status + " is not APPROVE or REJECT");
            throw new IllegalArgumentException("Status must be APPROVE or REJECT for OPEN matches");
        }
        // Update only the status, preserving existing relationships
        match.setStatus(status);
        Match savedMatch = matchRepository.save(match);
        System.out.println("Match ID " + id + " updated to status: " + status);
        return savedMatch;
    }
}