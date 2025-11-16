package com.eventmanagement.repository;

import com.eventmanagement.model.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByEventId(Long eventId);
    List<Schedule> findByTaskId(Long taskId);
    List<Schedule> findByMemberId(Long memberId);
    List<Schedule> findByEventIdOrderByStartDateTimeAsc(Long eventId);
    void deleteByEventId(Long eventId);
    void deleteByTaskId(Long taskId);
}

