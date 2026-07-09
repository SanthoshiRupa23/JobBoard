package com.example.jobboard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JobRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String location;
    private Double salaryMin;
    private Double salaryMax;

    @NotBlank(message = "Job type is required")
    private String type; // FULL_TIME, PART_TIME, CONTRACT, REMOTE, INTERNSHIP

    private String category;
    private String requirements;
}
