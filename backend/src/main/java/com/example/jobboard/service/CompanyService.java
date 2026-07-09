package com.example.jobboard.service;

import com.example.jobboard.dto.CompanyRequest;
import com.example.jobboard.dto.CompanyResponse;
import com.example.jobboard.exception.BadRequestException;
import com.example.jobboard.exception.ResourceNotFoundException;
import com.example.jobboard.model.Company;
import com.example.jobboard.model.User;
import com.example.jobboard.repository.CompanyRepository;
import com.example.jobboard.repository.JobRepository;
import com.example.jobboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    @Transactional
    public CompanyResponse createCompany(Long employerUserId, CompanyRequest request) {
        if (companyRepository.existsByUserId(employerUserId)) {
            throw new BadRequestException("You already have a company profile");
        }

        User employer = userRepository.findById(employerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Company company = Company.builder()
                .user(employer)
                .name(request.getName())
                .description(request.getDescription())
                .website(request.getWebsite())
                .location(request.getLocation())
                .logoUrl(request.getLogoUrl())
                .industry(request.getIndustry())
                .size(request.getSize())
                .build();

        company = companyRepository.save(company);
        return toResponse(company);
    }

    @Transactional
    public CompanyResponse updateCompany(Long employerUserId, CompanyRequest request) {
        Company company = companyRepository.findByUserId(employerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not found"));

        company.setName(request.getName());
        company.setDescription(request.getDescription());
        company.setWebsite(request.getWebsite());
        company.setLocation(request.getLocation());
        company.setLogoUrl(request.getLogoUrl());
        company.setIndustry(request.getIndustry());
        company.setSize(request.getSize());

        company = companyRepository.save(company);
        return toResponse(company);
    }

    public CompanyResponse getCompanyByEmployerUserId(Long employerUserId) {
        Company company = companyRepository.findByUserId(employerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not found"));
        return toResponse(company);
    }

    public CompanyResponse getCompanyById(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        return toResponse(company);
    }

    public List<CompanyResponse> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private CompanyResponse toResponse(Company company) {
        long jobCount = jobRepository.countByCompanyUserId(company.getUser().getId());
        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .description(company.getDescription())
                .website(company.getWebsite())
                .location(company.getLocation())
                .logoUrl(company.getLogoUrl())
                .industry(company.getIndustry())
                .size(company.getSize())
                .employerUserId(company.getUser().getId())
                .employerName(company.getUser().getFullName())
                .createdAt(company.getCreatedAt())
                .jobCount(jobCount)
                .build();
    }
}
