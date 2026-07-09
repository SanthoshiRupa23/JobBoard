package com.example.jobboard.controller;

import com.example.jobboard.dto.CompanyRequest;
import com.example.jobboard.dto.CompanyResponse;
import com.example.jobboard.security.CustomUserDetails;
import com.example.jobboard.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Company profile endpoints. Public GET for browsing; EMPLOYER role for CUD.
 */
@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<List<CompanyResponse>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    /** Get the current employer's company profile. */
    @GetMapping("/my-company")
    public ResponseEntity<CompanyResponse> getMyCompany(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(companyService.getCompanyByEmployerUserId(userDetails.getId()));
    }

    @PostMapping
    public ResponseEntity<CompanyResponse> createCompany(
            @RequestBody CompanyRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(companyService.createCompany(userDetails.getId(), request));
    }

    @PutMapping
    public ResponseEntity<CompanyResponse> updateCompany(
            @RequestBody CompanyRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(companyService.updateCompany(userDetails.getId(), request));
    }
}
