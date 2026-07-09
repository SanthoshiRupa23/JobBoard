package com.example.jobboard.service;

import com.example.jobboard.dto.ApplicationRequest;
import com.example.jobboard.dto.ApplicationResponse;
import com.example.jobboard.exception.BadRequestException;
import com.example.jobboard.exception.ResourceNotFoundException;
import com.example.jobboard.model.Application;
import com.example.jobboard.model.Job;
import com.example.jobboard.model.SeekerProfile;
import com.example.jobboard.model.User;
import com.example.jobboard.model.enums.ApplicationStatus;
import com.example.jobboard.model.enums.JobStatus;
import com.example.jobboard.model.enums.NotificationType;
import com.example.jobboard.repository.ApplicationRepository;
import com.example.jobboard.repository.JobRepository;
import com.example.jobboard.repository.SeekerProfileRepository;
import com.example.jobboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final SeekerProfileRepository seekerProfileRepository;
    private final NotificationService notificationService;

    /** Seeker applies to a job — triggers notification to employer. */
    @Transactional
    public ApplicationResponse applyToJob(Long seekerUserId, ApplicationRequest request) {
        if (applicationRepository.existsBySeekerIdAndJobId(seekerUserId, request.getJobId())) {
            throw new BadRequestException("You have already applied to this job");
        }

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (job.getStatus() != JobStatus.OPEN) {
            throw new BadRequestException("This job is no longer accepting applications");
        }

        User seeker = userRepository.findById(seekerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Application application = Application.builder()
                .seeker(seeker)
                .job(job)
                .status(ApplicationStatus.APPLIED)
                .coverLetter(request.getCoverLetter())
                .build();

        application = applicationRepository.save(application);

        // Notify the employer about the new application
        notificationService.createNotification(
                job.getCompany().getUser().getId(),
                seeker.getFullName() + " applied for \"" + job.getTitle() + "\"",
                NotificationType.APPLICATION_RECEIVED,
                application.getId(),
                "APPLICATION"
        );

        return toResponse(application);
    }

    /** Employer updates application status — triggers notification to seeker. */
    @Transactional
    public ApplicationResponse updateApplicationStatus(Long applicationId, String statusStr, Long employerUserId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        // Verify the employer owns the job
        if (!application.getJob().getCompany().getUser().getId().equals(employerUserId)) {
            throw new BadRequestException("You can only update applications for your own jobs");
        }

        ApplicationStatus newStatus;
        try {
            newStatus = ApplicationStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + statusStr);
        }

        application.setStatus(newStatus);
        application = applicationRepository.save(application);

        // Notify the seeker about status change
        notificationService.createNotification(
                application.getSeeker().getId(),
                "Your application for \"" + application.getJob().getTitle() + "\" has been updated to: " + newStatus.name(),
                NotificationType.APPLICATION_STATUS_UPDATED,
                application.getId(),
                "APPLICATION"
        );

        return toResponse(application);
    }

    /** Get all applications made by a seeker. */
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getSeekerApplications(Long seekerUserId) {
        return applicationRepository.findBySeekerId(seekerUserId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Get all applications for a specific job (employer view). */
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsByJob(Long jobId, Long employerUserId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getCompany().getUser().getId().equals(employerUserId)) {
            throw new BadRequestException("You can only view applications for your own jobs");
        }

        return applicationRepository.findByJobId(jobId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ApplicationResponse toResponse(Application app) {
        SeekerProfile profile = seekerProfileRepository.findByUserId(app.getSeeker().getId())
                .orElse(null);

        return ApplicationResponse.builder()
                .id(app.getId())
                .status(app.getStatus().name())
                .coverLetter(app.getCoverLetter())
                .appliedAt(app.getAppliedAt())
                .updatedAt(app.getUpdatedAt())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .jobLocation(app.getJob().getLocation())
                .jobType(app.getJob().getType().name())
                .companyName(app.getJob().getCompany().getName())
                .companyLogoUrl(app.getJob().getCompany().getLogoUrl())
                .seekerId(app.getSeeker().getId())
                .seekerName(app.getSeeker().getFullName())
                .seekerEmail(app.getSeeker().getEmail())
                .seekerPhone(profile != null ? profile.getPhone() : null)
                .seekerHeadline(profile != null ? profile.getHeadline() : null)
                .seekerSkills(profile != null ? profile.getSkills() : null)
                .seekerExperience(profile != null ? profile.getExperience() : null)
                .seekerEducation(profile != null ? profile.getEducation() : null)
                .build();
    }
}
