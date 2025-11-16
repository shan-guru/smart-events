package com.eventmanagement.service;

import com.eventmanagement.api.dto.request.CreateEventRequest;
import com.eventmanagement.api.dto.request.UpdateEventRequest;
import com.eventmanagement.api.dto.response.EventResponse;
import com.eventmanagement.model.entity.Event;
import com.eventmanagement.model.enums.EventStatus;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.util.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final EventRepository eventRepository;

    @Transactional
    public EventResponse createEvent(CreateEventRequest request) {
        log.info("Creating event: {}", request.getEventName());
        
        // Check if event with same name exists
        eventRepository.findByEventName(request.getEventName())
                .ifPresent(existing -> {
                    throw new com.eventmanagement.util.exceptions.ResourceAlreadyExistsException(
                            "Event with name '" + request.getEventName() + "' already exists");
                });
        
        Event event = new Event();
        event.setEventName(request.getEventName());
        event.setEventInfo(request.getEventInfo());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setEventDate(request.getEventDate());
        event.setStatus(EventStatus.UPCOMING);
        
        Event savedEvent = eventRepository.save(event);
        return mapToResponse(savedEvent);
    }

    @Transactional(readOnly = true)
    public EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        return mapToResponse(event);
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getEventsByStatus(EventStatus status) {
        return eventRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EventResponse updateEvent(Long id, UpdateEventRequest request) {
        log.info("Updating event with id: {}", id);
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        
        if (request.getEventName() != null) {
            event.setEventName(request.getEventName());
        }
        if (request.getEventInfo() != null) {
            event.setEventInfo(request.getEventInfo());
        }
        if (request.getStartDate() != null) {
            event.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            event.setEndDate(request.getEndDate());
        }
        if (request.getEventDate() != null) {
            event.setEventDate(request.getEventDate());
        }
        if (request.getStatus() != null) {
            event.setStatus(request.getStatus());
        }
        
        Event updatedEvent = eventRepository.save(event);
        return mapToResponse(updatedEvent);
    }

    @Transactional
    public void deleteEvent(Long id) {
        log.info("Deleting event with id: {}", id);
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        
        eventRepository.delete(event);
    }

    @Transactional
    public EventResponse markEventAsClosed(Long id) {
        log.info("Marking event as closed with id: {}", id);
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        
        event.setStatus(EventStatus.CLOSED);
        Event updatedEvent = eventRepository.save(event);
        return mapToResponse(updatedEvent);
    }

    private EventResponse mapToResponse(Event event) {
        return new EventResponse(
                event.getId(),
                event.getEventName(),
                event.getEventInfo(),
                event.getStartDate(),
                event.getEndDate(),
                event.getEventDate(),
                event.getStatus(),
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }
}

