package com.example.jobboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobResponse {
    private Long id;
    private String title;
    private String description;
    private String location;
    private Double salaryMin;
    private Double salaryMax;
    private String type;
    private String category;
    private String status;
    private String requirements;
    private LocalDateTime postedAt;
    private LocalDateTime updatedAt;

    // Company info (flattened for convenience)
    private Long companyId;
    private String companyName;
    private String companyLogoUrl;
    private String companyLocation;
    private String companyIndustry;

    // Computed fields
    private Long applicationCount;
    private Boolean isSaved; // For seeker context
}
