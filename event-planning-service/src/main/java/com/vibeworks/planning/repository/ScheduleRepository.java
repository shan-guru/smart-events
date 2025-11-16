package com.vibeworks.planning.repository;

import com.vibeworks.planning.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByEventId(Long eventId);
    void deleteByEventId(Long eventId);
}

