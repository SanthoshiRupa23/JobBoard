package com.example.jobboard.repository;

import com.example.jobboard.model.SavedJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    List<SavedJob> findBySeekerId(Long seekerId);
    Optional<SavedJob> findBySeekerIdAndJobId(Long seekerId, Long jobId);
    boolean existsBySeekerIdAndJobId(Long seekerId, Long jobId);
    void deleteBySeekerIdAndJobId(Long seekerId, Long jobId);
}
