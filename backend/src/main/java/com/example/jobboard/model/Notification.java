package com.example.jobboard.model;

import com.example.jobboard.model.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * In-app notification entity. Notifications are triggered by system events
 * (e.g., new application, status update, employer approval) and stored in the DB.
 * No real-time WebSockets — fetched via polling REST endpoints.
 */
@Entity
@Table(name = "notifications")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    /** Optional reference to a related entity (job ID, application ID, etc.) */
    private Long referenceId;

    /** Type of the referenced entity: "JOB", "APPLICATION", "USER" */
    private String referenceType;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
