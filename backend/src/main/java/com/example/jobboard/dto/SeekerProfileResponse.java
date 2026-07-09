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
public class SeekerProfileResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String headline;
    private String summary;
    private String skills;
    private String experience;
    private String education;
    private String resumePath;
    private String location;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
