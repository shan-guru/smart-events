package com.vibeworks.tracking.repository;

import com.vibeworks.tracking.model.EventProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventProgressRepository extends JpaRepository<EventProgress, Long> {
    Optional<EventProgress> findByEventId(Long eventId);
}

