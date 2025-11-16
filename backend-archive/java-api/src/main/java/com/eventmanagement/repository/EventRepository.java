package com.eventmanagement.repository;

import com.eventmanagement.model.entity.Event;
import com.eventmanagement.model.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    Optional<Event> findByEventName(String eventName);
    List<Event> findByStatus(EventStatus status);
    List<Event> findByStatusOrderByCreatedAtDesc(EventStatus status);
    List<Event> findAllByOrderByCreatedAtDesc();
}

