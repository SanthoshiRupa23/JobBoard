package com.example.jobboard.service;

import com.example.jobboard.dto.DashboardStats;
import com.example.jobboard.dto.UserResponse;
import com.example.jobboard.exception.ResourceNotFoundException;
import com.example.jobboard.model.User;
import com.example.jobboard.model.enums.NotificationType;
import com.example.jobboard.model.enums.Role;
import com.example.jobboard.model.enums.UserStatus;
import com.example.jobboard.model.enums.JobStatus;
import com.example.jobboard.repository.ApplicationRepository;
import com.example.jobboard.repository.JobRepository;
import com.example.jobboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;

    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toResponse(user);
    }

    /** Get all employers pending admin approval. */
    public List<UserResponse> getPendingEmployers() {
        return userRepository.findByRoleAndStatus(Role.EMPLOYER, UserStatus.PENDING_APPROVAL)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Admin approves an employer — triggers notification. */
    @Transactional
    public UserResponse approveEmployer(Long employerId) {
        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found"));

        if (employer.getRole() != Role.EMPLOYER) {
            throw new RuntimeException("User is not an employer");
        }

        employer.setStatus(UserStatus.ACTIVE);
        employer = userRepository.save(employer);

        notificationService.createNotification(
                employer.getId(),
                "Your employer account has been approved! You can now post jobs.",
                NotificationType.EMPLOYER_APPROVED,
                null,
                null
        );

        return toResponse(employer);
    }

    /** Admin rejects an employer — triggers notification. */
    @Transactional
    public UserResponse rejectEmployer(Long employerId) {
        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found"));

        employer.setStatus(UserStatus.REJECTED);
        employer = userRepository.save(employer);

        notificationService.createNotification(
                employer.getId(),
                "Your employer registration has been rejected. Please contact support.",
                NotificationType.EMPLOYER_REJECTED,
                null,
                null
        );

        return toResponse(employer);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Aggregate stats for the admin dashboard. */
    public DashboardStats getAdminStats() {
        return DashboardStats.builder()
                .totalJobs(jobRepository.count())
                .totalSeekers(userRepository.countByRole(Role.SEEKER))
                .totalEmployers(userRepository.countByRole(Role.EMPLOYER))
                .totalApplications(applicationRepository.count())
                .pendingEmployers(userRepository.findByRoleAndStatus(Role.EMPLOYER, UserStatus.PENDING_APPROVAL).size())
                .openJobs(jobRepository.countByStatus(JobStatus.OPEN))
                .build();
    }

    /** Aggregate stats for the employer dashboard. */
    public DashboardStats getEmployerStats(Long employerUserId) {
        return DashboardStats.builder()
                .myJobs(jobRepository.countByCompanyUserId(employerUserId))
                .myApplications(applicationRepository.countByJobCompanyUserId(employerUserId))
                .build();
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
