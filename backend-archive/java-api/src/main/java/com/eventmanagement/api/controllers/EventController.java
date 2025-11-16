package com.eventmanagement.api.controllers;

import com.eventmanagement.api.dto.request.CreateEventRequest;
import com.eventmanagement.api.dto.request.UpdateEventRequest;
import com.eventmanagement.api.dto.response.ApiResponse;
import com.eventmanagement.api.dto.response.EventResponse;
import com.eventmanagement.model.enums.EventStatus;
import com.eventmanagement.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(@Valid @RequestBody CreateEventRequest request) {
        EventResponse event = eventService.createEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Event created successfully", event));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> getEventById(@PathVariable Long id) {
        EventResponse event = eventService.getEventById(id);
        return ResponseEntity.ok(ApiResponse.success(event));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents(
            @RequestParam(required = false) EventStatus status) {
        List<EventResponse> events;
        if (status != null) {
            events = eventService.getEventsByStatus(status);
        } else {
            events = eventService.getAllEvents();
        }
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEventRequest request) {
        EventResponse event = eventService.updateEvent(id, request);
        return ResponseEntity.ok(ApiResponse.success("Event updated successfully", event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success("Event deleted successfully", null));
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<ApiResponse<EventResponse>> markEventAsClosed(@PathVariable Long id) {
        EventResponse event = eventService.markEventAsClosed(id);
        return ResponseEntity.ok(ApiResponse.success("Event marked as closed", event));
    }
}

