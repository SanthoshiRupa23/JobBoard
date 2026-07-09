package com.example.jobboard.repository;

import com.example.jobboard.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    boolean existsByName(String name);
}
