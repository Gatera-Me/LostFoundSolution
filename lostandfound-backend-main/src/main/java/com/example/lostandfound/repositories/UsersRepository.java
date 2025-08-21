package com.example.lostandfound.repositories;

import com.example.lostandfound.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM Users u WHERE u.email = ?1 AND u.id != ?2")
    boolean existsByEmailAndIdNot(String email, Long id);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM Users u WHERE u.username = ?1 AND u.id != ?2")
    boolean existsByUsernameAndIdNot(String username, Long id);

    Optional<Users> findByEmail(String email);

    @Query("SELECT u FROM Users u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Users> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(@Param("query") String query);
}