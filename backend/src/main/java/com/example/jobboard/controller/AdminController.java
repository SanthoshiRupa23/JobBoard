package com.example.jobboard.controller;

import com.example.jobboard.dto.DashboardStats;
import com.example.jobboard.dto.UserResponse;
import com.example.jobboard.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin endpoints for employer approval and dashboard stats.
 * All endpoints require ADMIN role.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        return ResponseEntity.ok(userService.getAdminStats());
    }

    @GetMapping("/employers/pending")
    public ResponseEntity<List<UserResponse>> getPendingEmployers() {
        return ResponseEntity.ok(userService.getPendingEmployers());
    }

    @PutMapping("/employers/{id}/approve")
    public ResponseEntity<UserResponse> approveEmployer(@PathVariable Long id) {
        return ResponseEntity.ok(userService.approveEmployer(id));
    }

    @PutMapping("/employers/{id}/reject")
    public ResponseEntity<UserResponse> rejectEmployer(@PathVariable Long id) {
        return ResponseEntity.ok(userService.rejectEmployer(id));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
