package com.teammate.backend.task.controller;

import com.teammate.backend.task.dto.CreateTaskRequest;
import com.teammate.backend.task.dto.TaskResponse;
import com.teammate.backend.task.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.teammate.backend.task.dto.UpdateTaskStatusRequest;
import com.teammate.backend.task.dto.UpdateTaskRequest;
import com.teammate.backend.task.dto.TaskProgressResponse;

import java.util.List;

@RestController
@RequestMapping("/api/teams/{teamId}/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable Long teamId,
            @Valid @RequestBody CreateTaskRequest request,
            Authentication authentication
    ) {
        String loginId = authentication.getName();

        TaskResponse response =
                taskService.createTask(teamId, request, loginId);

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasks(
            @PathVariable Long teamId,
            Authentication authentication
    ) {
        String loginId = authentication.getName();

        List<TaskResponse> response =
                taskService.getTasks(teamId, loginId);

        return ResponseEntity.ok(response);
    }
    @PatchMapping("/{taskId}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable Long teamId,
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskStatusRequest request,
            Authentication authentication
    ) {
        String loginId = authentication.getName();

        TaskResponse response =
                taskService.updateTaskStatus(
                        teamId,
                        taskId,
                        request,
                        loginId
                );

        return ResponseEntity.ok(response);
    }
    @PatchMapping("/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long teamId,
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskRequest request,
            Authentication authentication
    ) {
        String loginId = authentication.getName();

        TaskResponse response =
                taskService.updateTask(
                        teamId,
                        taskId,
                        request,
                        loginId
                );

        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long teamId,
            @PathVariable Long taskId,
            Authentication authentication
    ) {
        String loginId = authentication.getName();

        taskService.deleteTask(
                teamId,
                taskId,
                loginId
        );

        return ResponseEntity.noContent().build();
    }
    @GetMapping("/progress")
    public ResponseEntity<TaskProgressResponse> getTaskProgress(
            @PathVariable Long teamId,
            Authentication authentication
    ) {
        String loginId = authentication.getName();

        TaskProgressResponse response =
                taskService.getTaskProgress(
                        teamId,
                        loginId
                );

        return ResponseEntity.ok(response);
    }
}