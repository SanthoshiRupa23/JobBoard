package com.example.jobboard.controller;

import com.example.jobboard.dto.DashboardStats;
import com.example.jobboard.dto.JobResponse;
import com.example.jobboard.security.CustomUserDetails;
import com.example.jobboard.service.SavedJobService;
import com.example.jobboard.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Saved jobs (bookmarks) and employer dashboard endpoints.
 */
@RestController
@RequiredArgsConstructor
public class SeekerEmployerController {

    private final SavedJobService savedJobService;
    private final UserService userService;

    // ---- Saved Jobs (SEEKER) ----

    @GetMapping("/api/saved-jobs")
    public ResponseEntity<List<JobResponse>> getSavedJobs(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(savedJobService.getSavedJobs(userDetails.getId()));
    }

    @PostMapping("/api/saved-jobs/{jobId}")
    public ResponseEntity<Map<String, String>> saveJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        savedJobService.saveJob(userDetails.getId(), jobId);
        return ResponseEntity.ok(Map.of("message", "Job saved successfully"));
    }

    @DeleteMapping("/api/saved-jobs/{jobId}")
    public ResponseEntity<Void> unsaveJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        savedJobService.unsaveJob(userDetails.getId(), jobId);
        return ResponseEntity.noContent().build();
    }

    // ---- Employer Dashboard Stats ----

    @GetMapping("/api/employer/stats")
    public ResponseEntity<DashboardStats> getEmployerStats(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getEmployerStats(userDetails.getId()));
    }
}
