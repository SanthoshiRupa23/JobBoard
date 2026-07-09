package com.example.jobboard.dto;

import lombok.Data;

@Data
public class SeekerProfileRequest {
    private String phone;
    private String headline;
    private String summary;
    private String skills;
    private String experience;
    private String education;
    private String location;
}
