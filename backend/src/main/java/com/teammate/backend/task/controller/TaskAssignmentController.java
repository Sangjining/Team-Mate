package com.teammate.backend.task.controller;

import com.teammate.backend.task.entity.TaskAssignment;
import com.teammate.backend.task.service.TaskAssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/teams/{teamId}/tasks")
public class TaskAssignmentController {

    private final TaskAssignmentService assignmentService;

    public TaskAssignmentController(TaskAssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    // 팀원이 담당자가 없는 업무에 신청
    @PostMapping("/{taskId}/assignments")
    public ResponseEntity<AssignmentResponse> apply(
            @PathVariable Long teamId,
            @PathVariable Long taskId,
            Authentication authentication
    ) {
        TaskAssignment result = assignmentService.apply(teamId, taskId, authentication.getName());
        return ResponseEntity.ok(AssignmentResponse.from(result));
    }

    // OWNER가 팀 전체의 승인 대기 신청 조회
    @GetMapping("/assignments/pending")
    public ResponseEntity<List<AssignmentResponse>> getPending(
            @PathVariable Long teamId,
            Authentication authentication
    ) {
        List<AssignmentResponse> results = assignmentService.getPending(teamId, authentication.getName())
                .stream().map(AssignmentResponse::from).toList();
        return ResponseEntity.ok(results);
    }

    // OWNER 승인
    @PatchMapping("/assignments/{assignmentId}/approve")
    public ResponseEntity<AssignmentResponse> approve(
            @PathVariable Long teamId,
            @PathVariable Long assignmentId,
            Authentication authentication
    ) {
        TaskAssignment result = assignmentService.approve(teamId, assignmentId, authentication.getName());
        return ResponseEntity.ok(AssignmentResponse.from(result));
    }

    // OWNER 거절
    @PatchMapping("/assignments/{assignmentId}/reject")
    public ResponseEntity<AssignmentResponse> reject(
            @PathVariable Long teamId,
            @PathVariable Long assignmentId,
            Authentication authentication
    ) {
        TaskAssignment result = assignmentService.reject(teamId, assignmentId, authentication.getName());
        return ResponseEntity.ok(AssignmentResponse.from(result));
    }

    // 신청자 본인이 대기 중인 신청 취소
    @PatchMapping("/assignments/{assignmentId}/cancel")
    public ResponseEntity<AssignmentResponse> cancel(
            @PathVariable Long teamId,
            @PathVariable Long assignmentId,
            Authentication authentication
    ) {
        TaskAssignment result = assignmentService.cancel(teamId, assignmentId, authentication.getName());
        return ResponseEntity.ok(AssignmentResponse.from(result));
    }

    // JPA 엔티티를 그대로 반환하지 않아 LAZY 로딩 및 순환 참조 문제를 방지
    public record AssignmentResponse(
            Long assignmentId,
            Long taskId,
            String taskTitle,
            Long userId,
            String userName,
            TaskAssignment.Status status,
            LocalDateTime createdAt,
            LocalDateTime reviewedAt
    ) {
        public static AssignmentResponse from(TaskAssignment assignment) {
            return new AssignmentResponse(
                    assignment.getAssignmentId(),
                    assignment.getTask().getTaskId(),
                    assignment.getTask().getTitle(),
                    assignment.getUser().getUserId(),
                    assignment.getUser().getName(),
                    assignment.getStatus(),
                    assignment.getCreatedAt(),
                    assignment.getReviewedAt()
            );
        }
    }
}
