package com.example.jobboard.service;

import com.example.jobboard.dto.JobResponse;
import com.example.jobboard.exception.ResourceNotFoundException;
import com.example.jobboard.model.SavedJob;
import com.example.jobboard.model.User;
import com.example.jobboard.repository.JobRepository;
import com.example.jobboard.repository.SavedJobRepository;
import com.example.jobboard.repository.UserRepository;
import com.example.jobboard.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;

    @Transactional
    public void saveJob(Long seekerUserId, Long jobId) {
        if (savedJobRepository.existsBySeekerIdAndJobId(seekerUserId, jobId)) {
            return; // Already saved, idempotent
        }
        if (!jobRepository.existsById(jobId)) {
            throw new ResourceNotFoundException("Job not found");
        }
        User seeker = userRepository.findById(seekerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SavedJob savedJob = SavedJob.builder()
                .seeker(seeker)
                .job(jobRepository.getReferenceById(jobId))
                .build();
        savedJobRepository.save(savedJob);
    }

    @Transactional
    public void unsaveJob(Long seekerUserId, Long jobId) {
        savedJobRepository.deleteBySeekerIdAndJobId(seekerUserId, jobId);
    }

    public List<JobResponse> getSavedJobs(Long seekerUserId) {
        return savedJobRepository.findBySeekerId(seekerUserId).stream()
                .map(savedJob -> {
                    var job = savedJob.getJob();
                    long appCount = applicationRepository.countByJobId(job.getId());
                    return JobResponse.builder()
                            .id(job.getId())
                            .title(job.getTitle())
                            .description(job.getDescription())
                            .location(job.getLocation())
                            .salaryMin(job.getSalaryMin())
                            .salaryMax(job.getSalaryMax())
                            .type(job.getType().name())
                            .category(job.getCategory())
                            .status(job.getStatus().name())
                            .requirements(job.getRequirements())
                            .postedAt(job.getPostedAt())
                            .companyId(job.getCompany().getId())
                            .companyName(job.getCompany().getName())
                            .companyLogoUrl(job.getCompany().getLogoUrl())
                            .companyLocation(job.getCompany().getLocation())
                            .applicationCount(appCount)
                            .isSaved(true)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
