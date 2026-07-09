package com.example.jobboard.controller;

import com.example.jobboard.dto.JobRequest;
import com.example.jobboard.dto.JobResponse;
import com.example.jobboard.security.CustomUserDetails;
import com.example.jobboard.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Job listing endpoints. GET endpoints are public; POST/PUT/DELETE require EMPLOYER role.
 */
@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    /** Get all open jobs with pagination (public). */
    @GetMapping
    public ResponseEntity<Page<JobResponse>> getOpenJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(jobService.getOpenJobs(page, size));
    }

    /** Search/filter open jobs (public). */
    @GetMapping("/search")
    public ResponseEntity<Page<JobResponse>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long seekerId = (userDetails != null) ? userDetails.getId() : null;
        return ResponseEntity.ok(jobService.searchJobs(keyword, type, category, location, page, size, seekerId));
    }

    /** Get a single job by ID (public). */
    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long seekerId = (userDetails != null) ? userDetails.getId() : null;
        return ResponseEntity.ok(jobService.getJobById(id, seekerId));
    }

    /** Get all jobs posted by the current employer. */
    @GetMapping("/my-jobs")
    public ResponseEntity<List<JobResponse>> getMyJobs(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(jobService.getJobsByEmployer(userDetails.getId()));
    }

    /** Create a new job (EMPLOYER only). */
    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            @Valid @RequestBody JobRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(jobService.createJob(userDetails.getId(), request));
    }

    /** Update an existing job (EMPLOYER only, own jobs). */
    @PutMapping("/{id}")
    public ResponseEntity<JobResponse> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(jobService.updateJob(id, userDetails.getId(), request));
    }

    /** Close a job (EMPLOYER only, own jobs). */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> closeJob(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        jobService.closeJob(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }
}
