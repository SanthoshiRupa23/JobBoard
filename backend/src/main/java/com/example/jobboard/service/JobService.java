package com.example.jobboard.service;

import com.example.jobboard.dto.JobRequest;
import com.example.jobboard.dto.JobResponse;
import com.example.jobboard.exception.BadRequestException;
import com.example.jobboard.exception.ResourceNotFoundException;
import com.example.jobboard.model.Company;
import com.example.jobboard.model.Job;
import com.example.jobboard.model.enums.JobStatus;
import com.example.jobboard.model.enums.JobType;
import com.example.jobboard.repository.ApplicationRepository;
import com.example.jobboard.repository.CompanyRepository;
import com.example.jobboard.repository.JobRepository;
import com.example.jobboard.repository.SavedJobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final ApplicationRepository applicationRepository;
    private final SavedJobRepository savedJobRepository;

    /** Create a new job listing under the employer's company. */
    @Transactional
    public JobResponse createJob(Long employerUserId, JobRequest request) {
        Company company = companyRepository.findByUserId(employerUserId)
                .orElseThrow(() -> new BadRequestException("Please create a company profile before posting jobs"));

        Job job = Job.builder()
                .company(company)
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .type(JobType.valueOf(request.getType().toUpperCase()))
                .category(request.getCategory())
                .requirements(request.getRequirements())
                .status(JobStatus.OPEN)
                .build();

        job = jobRepository.save(job);
        return toResponse(job, null);
    }

    @Transactional
    public JobResponse updateJob(Long jobId, Long employerUserId, JobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getCompany().getUser().getId().equals(employerUserId)) {
            throw new BadRequestException("You can only edit your own jobs");
        }

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setLocation(request.getLocation());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setType(JobType.valueOf(request.getType().toUpperCase()));
        job.setCategory(request.getCategory());
        job.setRequirements(request.getRequirements());

        job = jobRepository.save(job);
        return toResponse(job, null);
    }

    @Transactional
    public void closeJob(Long jobId, Long employerUserId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getCompany().getUser().getId().equals(employerUserId)) {
            throw new BadRequestException("You can only close your own jobs");
        }

        job.setStatus(JobStatus.CLOSED);
        jobRepository.save(job);
    }

    public JobResponse getJobById(Long jobId, Long seekerUserId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        return toResponse(job, seekerUserId);
    }

    /** Get all open jobs with pagination. */
    public Page<JobResponse> getOpenJobs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("postedAt").descending());
        return jobRepository.findByStatus(JobStatus.OPEN, pageable)
                .map(job -> toResponse(job, null));
    }

    /** Multi-criteria search across open jobs. */
    public Page<JobResponse> searchJobs(String keyword, String type, String category,
                                         String location, int page, int size, Long seekerUserId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("postedAt").descending());
        JobType jobType = (type != null && !type.isEmpty()) ? JobType.valueOf(type.toUpperCase()) : null;
        String cat = (category != null && !category.isEmpty()) ? category : null;
        String loc = (location != null && !location.isEmpty()) ? location : null;
        String kw = (keyword != null && !keyword.isEmpty()) ? keyword : null;

        return jobRepository.searchJobs(JobStatus.OPEN, kw, jobType, cat, loc, pageable)
                .map(job -> toResponse(job, seekerUserId));
    }

    /** Get all jobs posted by a specific employer. */
    public List<JobResponse> getJobsByEmployer(Long employerUserId) {
        return jobRepository.findByCompanyUserId(employerUserId)
                .stream()
                .map(job -> toResponse(job, null))
                .collect(Collectors.toList());
    }

    private JobResponse toResponse(Job job, Long seekerUserId) {
        long appCount = applicationRepository.countByJobId(job.getId());
        Boolean isSaved = (seekerUserId != null)
                ? savedJobRepository.existsBySeekerIdAndJobId(seekerUserId, job.getId())
                : null;

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
                .updatedAt(job.getUpdatedAt())
                .companyId(job.getCompany().getId())
                .companyName(job.getCompany().getName())
                .companyLogoUrl(job.getCompany().getLogoUrl())
                .companyLocation(job.getCompany().getLocation())
                .companyIndustry(job.getCompany().getIndustry())
                .applicationCount(appCount)
                .isSaved(isSaved)
                .build();
    }
}
