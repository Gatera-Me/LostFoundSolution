package com.example.lostandfound.repositories;

import com.example.lostandfound.models.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {

    @Query("SELECT m FROM Match m " +
           "JOIN FETCH m.lostItem li " +
           "JOIN FETCH m.foundItem fi " +
           "JOIN FETCH m.matchedBy u " +
           "WHERE m.status = 'OPEN'")
    List<Match> findAllOpenMatchesWithDetails();
}