package com.example.jobboard.model;

import com.example.jobboard.model.enums.JobStatus;
import com.example.jobboard.model.enums.JobType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Job listing entity. Posted by employers under a company.
 * Supports full-text search by title, location, type, and category.
 */
@Entity
@Table(name = "jobs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @NotBlank(message = "Job title is required")
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    private String location;

    private Double salaryMin;

    private Double salaryMax;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobType type;

    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime postedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
