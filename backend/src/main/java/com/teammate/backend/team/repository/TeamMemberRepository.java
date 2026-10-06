package com.teammate.backend.team.repository;

import com.teammate.backend.team.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    List<TeamMember> findByUserUserId(Long userId);

    List<TeamMember> findByTeamTeamId(Long teamId);

    boolean existsByTeamTeamIdAndUserUserId(Long teamId, Long userId);

    boolean existsByTeamTeamIdAndUserUserIdAndRole(
            Long teamId,
            Long userId,
            TeamMember.TeamRole role
    );

    Optional<TeamMember> findByTeamTeamIdAndUserUserId(
            Long teamId,
            Long userId
    );
    void deleteByTeamTeamId(Long teamId);
}