package com.teammate.backend.team.controller;

import com.teammate.backend.team.dto.CreateTeamRequest;
import com.teammate.backend.team.dto.TeamResponse;
import com.teammate.backend.team.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.teammate.backend.team.dto.TeamMemberResponse;
import com.teammate.backend.team.dto.AddTeamMemberRequest;
import com.teammate.backend.team.dto.UpdateTeamRequest;
import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(
            @Valid @RequestBody CreateTeamRequest request,
            Authentication authentication
    ) {

        String loginId = authentication.getName();

        TeamResponse response = teamService.createTeam(request, loginId);

        return ResponseEntity.ok(response);
    }
    @GetMapping
    public ResponseEntity<List<TeamResponse>> getMyTeams(
            Authentication authentication
    ) {

        String loginId = authentication.getName();

        List<TeamResponse> response = teamService.getMyTeams(loginId);

        return ResponseEntity.ok(response);
    }
    @GetMapping("/{teamId}")
    public ResponseEntity<TeamResponse> getTeam(
            @PathVariable Long teamId,
            Authentication authentication
    ) {

        String loginId = authentication.getName();

        TeamResponse response = teamService.getTeam(teamId, loginId);

        return ResponseEntity.ok(response);
    }
    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<TeamMemberResponse>> getTeamMembers(
            @PathVariable Long teamId,
            Authentication authentication
    ) {

        String loginId = authentication.getName();

        List<TeamMemberResponse> response =
                teamService.getTeamMembers(teamId, loginId);

        return ResponseEntity.ok(response);
    }
    @PostMapping("/{teamId}/members")
    public ResponseEntity<TeamMemberResponse> addTeamMember(
            @PathVariable Long teamId,
            @Valid @RequestBody AddTeamMemberRequest request,
            Authentication authentication
    ) {
        String loginId = authentication.getName();

        TeamMemberResponse response =
                teamService.addTeamMember(teamId, request, loginId);

        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<Void> removeTeamMember(
            @PathVariable Long teamId,
            @PathVariable Long userId,
            Authentication authentication
    ) {
        String loginId = authentication.getName();

        teamService.removeTeamMember(teamId, userId, loginId);

        return ResponseEntity.noContent().build();
    }
    @PatchMapping("/{teamId}")
    public ResponseEntity<TeamResponse> updateTeam(
            @PathVariable Long teamId,
            @Valid @RequestBody UpdateTeamRequest request,
            Authentication authentication
    ) {
        String loginId = authentication.getName();

        TeamResponse response =
                teamService.updateTeam(teamId, request, loginId);

        return ResponseEntity.ok(response);
    }
    @PatchMapping("/{teamId}/complete")
    public ResponseEntity<TeamResponse> completeTeam(
            @PathVariable Long teamId,
            Authentication authentication
    ) {
        String loginId = authentication.getName();

        TeamResponse response =
                teamService.completeTeam(teamId, loginId);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{teamId}/reopen")
    public ResponseEntity<TeamResponse> reopenTeam(
            @PathVariable Long teamId,
            Authentication authentication
    ) {
        String loginId = authentication.getName();

        TeamResponse response =
                teamService.reopenTeam(teamId, loginId);

        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{teamId}")
    public ResponseEntity<Void> deleteTeam(
            @PathVariable Long teamId,
            Authentication authentication
    ) {
        String loginId = authentication.getName();

        teamService.deleteTeam(teamId, loginId);

        return ResponseEntity.noContent().build();
    }
}