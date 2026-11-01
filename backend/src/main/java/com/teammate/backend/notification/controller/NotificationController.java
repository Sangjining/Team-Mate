package com.teammate.backend.notification.controller;

import com.teammate.backend.notification.entity.Notification;
import com.teammate.backend.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> getMyNotifications(Authentication authentication) {
        return notificationService.getMyNotifications(authentication.getName())
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @GetMapping("/count")
    public NotificationCountResponse getMyNotificationCount(Authentication authentication) {
        return new NotificationCountResponse(
                notificationService.getMyNotificationCount(authentication.getName()));
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteMyNotification(
            @PathVariable Long notificationId,
            Authentication authentication) {
        notificationService.deleteMyNotification(notificationId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    // JPA 엔티티를 그대로 직렬화하지 않고, 프론트엔드에 필요한 값만 반환합니다.
    public record NotificationResponse(
            Long notificationId,
            Notification.Type type,
            Long teamId,
            Long taskId,
            Long assignmentId,
            String message,
            LocalDateTime createdAt
    ) {
        public static NotificationResponse from(Notification notification) {
            return new NotificationResponse(
                    notification.getNotificationId(),
                    notification.getType(),
                    notification.getTeamId(),
                    notification.getTaskId(),
                    notification.getAssignmentId(),
                    notification.getMessage(),
                    notification.getCreatedAt());
        }
    }

    public record NotificationCountResponse(long count) {}
}
