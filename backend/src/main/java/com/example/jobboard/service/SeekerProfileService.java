package com.example.jobboard.service;

import com.example.jobboard.dto.SeekerProfileRequest;
import com.example.jobboard.dto.SeekerProfileResponse;
import com.example.jobboard.exception.ResourceNotFoundException;
import com.example.jobboard.model.SeekerProfile;
import com.example.jobboard.model.User;
import com.example.jobboard.repository.SeekerProfileRepository;
import com.example.jobboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SeekerProfileService {

    private final SeekerProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public SeekerProfileResponse getProfile(Long userId) {
        SeekerProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found. Please complete your profile."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toResponse(profile, user);
    }

    @Transactional
    public SeekerProfileResponse createOrUpdateProfile(Long userId, SeekerProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SeekerProfile profile = profileRepository.findByUserId(userId)
                .orElse(SeekerProfile.builder().user(user).build());

        profile.setPhone(request.getPhone());
        profile.setHeadline(request.getHeadline());
        profile.setSummary(request.getSummary());
        profile.setSkills(request.getSkills());
        profile.setExperience(request.getExperience());
        profile.setEducation(request.getEducation());
        profile.setLocation(request.getLocation());

        profile = profileRepository.save(profile);
        return toResponse(profile, user);
    }

    /** Upload a PDF resume file, store it on disk, and save the path. */
    @Transactional
    public SeekerProfileResponse uploadResume(Long userId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new RuntimeException("Only PDF files are allowed");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SeekerProfile profile = profileRepository.findByUserId(userId)
                .orElse(SeekerProfile.builder().user(user).build());

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            profile.setResumePath(filename);
            profile = profileRepository.save(profile);

            return toResponse(profile, user);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store resume file", e);
        }
    }

    private SeekerProfileResponse toResponse(SeekerProfile profile, User user) {
        return SeekerProfileResponse.builder()
                .id(profile.getId())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(profile.getPhone())
                .headline(profile.getHeadline())
                .summary(profile.getSummary())
                .skills(profile.getSkills())
                .experience(profile.getExperience())
                .education(profile.getEducation())
                .resumePath(profile.getResumePath())
                .location(profile.getLocation())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
