package com.example.jobboard.service;

import com.example.jobboard.dto.AuthResponse;
import com.example.jobboard.dto.LoginRequest;
import com.example.jobboard.dto.RegisterRequest;
import com.example.jobboard.exception.BadRequestException;
import com.example.jobboard.model.User;
import com.example.jobboard.model.enums.Role;
import com.example.jobboard.model.enums.UserStatus;
import com.example.jobboard.repository.UserRepository;
import com.example.jobboard.security.CustomUserDetails;
import com.example.jobboard.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles user registration and login.
 * - Seekers are immediately ACTIVE upon registration.
 * - Employers are set to PENDING_APPROVAL and must be approved by an Admin.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role. Must be SEEKER or EMPLOYER");
        }

        if (role == Role.ADMIN) {
            throw new BadRequestException("Cannot register as Admin");
        }

        // Seekers are active immediately; employers need admin approval
        UserStatus status = (role == Role.SEEKER) ? UserStatus.ACTIVE : UserStatus.PENDING_APPROVAL;

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .status(status)
                .build();

        user = userRepository.save(user);

        // Generate JWT for active users; pending employers get token but with limited access
        CustomUserDetails userDetails = CustomUserDetails.fromUser(user);
        String token = tokenProvider.generateTokenFromUserDetails(userDetails);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        // Look up user for status
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        return AuthResponse.builder()
                .token(token)
                .userId(userDetails.getId())
                .email(userDetails.getEmail())
                .fullName(userDetails.getFullName())
                .role(userDetails.getRole().name())
                .status(user.getStatus().name())
                .build();
    }
}
