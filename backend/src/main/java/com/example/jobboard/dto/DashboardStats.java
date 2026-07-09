package com.example.jobboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Dashboard statistics DTO for admin and employer dashboards. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private long totalJobs;
    private long totalSeekers;
    private long totalEmployers;
    private long totalApplications;
    private long pendingEmployers;
    private long openJobs;

    // Employer-specific stats
    private long myJobs;
    private long myApplications;
}
