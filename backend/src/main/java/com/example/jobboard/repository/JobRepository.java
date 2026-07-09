package com.example.jobboard.repository;

import com.example.jobboard.model.Job;
import com.example.jobboard.model.enums.JobStatus;
import com.example.jobboard.model.enums.JobType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByCompanyId(Long companyId);

    List<Job> findByCompanyUserId(Long userId);

    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    /** Multi-criteria search: title/location keyword match with optional type and category filters. */
    @Query("SELECT j FROM Job j WHERE j.status = :status " +
           "AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(j.location) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:type IS NULL OR j.type = :type) " +
           "AND (:category IS NULL OR LOWER(j.category) = LOWER(:category)) " +
           "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))")
    Page<Job> searchJobs(
        @Param("status") JobStatus status,
        @Param("keyword") String keyword,
        @Param("type") JobType type,
        @Param("category") String category,
        @Param("location") String location,
        Pageable pageable
    );

    long countByStatus(JobStatus status);

    long countByCompanyUserId(Long userId);
}
