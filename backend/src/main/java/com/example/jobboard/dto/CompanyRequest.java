package com.example.jobboard.dto;

import lombok.Data;

@Data
public class CompanyRequest {
    private String name;
    private String description;
    private String website;
    private String location;
    private String logoUrl;
    private String industry;
    private String size;
}
