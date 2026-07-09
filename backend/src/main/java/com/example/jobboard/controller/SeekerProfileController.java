package com.example.jobboard.controller;

import com.example.jobboard.dto.SeekerProfileRequest;
import com.example.jobboard.dto.SeekerProfileResponse;
import com.example.jobboard.security.CustomUserDetails;
import com.example.jobboard.service.SeekerProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Seeker profile endpoints — profile CRUD and PDF resume upload.
 * All endpoints require SEEKER role.
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class SeekerProfileController {

    private final SeekerProfileService profileService;

    @GetMapping
    public ResponseEntity<SeekerProfileResponse> getProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(profileService.getProfile(userDetails.getId()));
    }

    @PutMapping
    public ResponseEntity<SeekerProfileResponse> updateProfile(
            @RequestBody SeekerProfileRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(profileService.createOrUpdateProfile(userDetails.getId(), request));
    }

    @PostMapping("/resume")
    public ResponseEntity<SeekerProfileResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(profileService.uploadResume(userDetails.getId(), file));
    }
}
