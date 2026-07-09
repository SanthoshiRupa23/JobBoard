package com.example.jobboard.controller;

import com.example.jobboard.dto.ApplicationRequest;
import com.example.jobboard.dto.ApplicationResponse;
import com.example.jobboard.security.CustomUserDetails;
import com.example.jobboard.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Application endpoints for seekers to apply and employers to manage applications.
 */
@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    /** Seeker applies to a job. */
    @PostMapping
    public ResponseEntity<ApplicationResponse> apply(
            @RequestBody ApplicationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(applicationService.applyToJob(userDetails.getId(), request));
    }

    /** Get all applications by the current seeker. */
    @GetMapping("/seeker")
    public ResponseEntity<List<ApplicationResponse>> getSeekerApplications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(applicationService.getSeekerApplications(userDetails.getId()));
    }

    /** Get all applications for a specific job (employer view). */
    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<ApplicationResponse>> getJobApplications(
            @PathVariable Long jobId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(applicationService.getApplicationsByJob(jobId, userDetails.getId()));
    }

    /** Employer updates an application's status. */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, status, userDetails.getId()));
    }
}
