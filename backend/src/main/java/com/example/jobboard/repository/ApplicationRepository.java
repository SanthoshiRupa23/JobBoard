package com.example.jobboard.repository;

import com.example.jobboard.model.Application;
import com.example.jobboard.model.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findBySeekerId(Long seekerId);
    List<Application> findByJobId(Long jobId);
    List<Application> findByJobIdAndStatus(Long jobId, ApplicationStatus status);
    Optional<Application> findBySeekerIdAndJobId(Long seekerId, Long jobId);
    boolean existsBySeekerIdAndJobId(Long seekerId, Long jobId);
    long countByJobId(Long jobId);
    long countBySeekerId(Long seekerId);
    long countByJobCompanyUserId(Long employerUserId);
}
