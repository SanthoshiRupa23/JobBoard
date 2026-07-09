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
public class ApplicationResponse {
    private Long id;
    private String status;
    private String coverLetter;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;

    // Job info
    private Long jobId;
    private String jobTitle;
    private String jobLocation;
    private String jobType;
    private String companyName;
    private String companyLogoUrl;

    // Seeker info (for employer view)
    private Long seekerId;
    private String seekerName;
    private String seekerEmail;
    private String seekerPhone;
    private String seekerHeadline;
    private String seekerSkills;
    private String seekerExperience;
    private String seekerEducation;
}
