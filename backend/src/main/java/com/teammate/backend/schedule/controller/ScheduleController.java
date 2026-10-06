package com.teammate.backend.schedule.controller;

import com.teammate.backend.schedule.dto.CreateScheduleRequest;
import com.teammate.backend.schedule.dto.ScheduleResponse;
import com.teammate.backend.schedule.service.ScheduleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.teammate.backend.schedule.dto.UpdateScheduleRequest;

import java.util.List;

@RestController
@RequestMapping("/api/teams/{teamId}/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @PostMapping
    public ResponseEntity<ScheduleResponse> createSchedule(
            @PathVariable Long teamId,
            @Valid @RequestBody CreateScheduleRequest request,
            Authentication authentication
    ) {
        String loginId = authentication.getName();

        ScheduleResponse response =
                scheduleService.createSchedule(
                        teamId,
                        request,
                        loginId
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ScheduleResponse>> getSchedules(
            @PathVariable Long teamId,
            Authentication authentication
    ) {
        String loginId = authentication.getName();

        List<ScheduleResponse> response =
                scheduleService.getSchedules(
                        teamId,
                        loginId
                );

        return ResponseEntity.ok(response);
    }
    @PatchMapping("/{scheduleId}")
    public ResponseEntity<ScheduleResponse> updateSchedule(
            @PathVariable Long teamId,
            @PathVariable Long scheduleId,
            @Valid @RequestBody UpdateScheduleRequest request,
            Authentication authentication
    ) {
        String loginId = authentication.getName();

        ScheduleResponse response =
                scheduleService.updateSchedule(
                        teamId,
                        scheduleId,
                        request,
                        loginId
                );

        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<Void> deleteSchedule(
            @PathVariable Long teamId,
            @PathVariable Long scheduleId,
            Authentication authentication
    ) {
        String loginId = authentication.getName();

        scheduleService.deleteSchedule(
                teamId,
                scheduleId,
                loginId
        );

        return ResponseEntity.noContent().build();
    }
}