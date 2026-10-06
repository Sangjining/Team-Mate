package com.teammate.backend.schedule.repository;

import com.teammate.backend.schedule.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByTeamTeamIdOrderByStartAtAsc(Long teamId);
}