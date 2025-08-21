package com.example.lostandfound.repositories;

import com.example.lostandfound.models.Otp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByTempToken(String tempToken);
    void deleteByTempToken(String tempToken);
}