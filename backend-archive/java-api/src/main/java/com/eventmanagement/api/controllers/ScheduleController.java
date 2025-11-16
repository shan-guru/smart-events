package com.eventmanagement.api.controllers;

import com.eventmanagement.api.dto.request.GenerateScheduleRequest;
import com.eventmanagement.api.dto.response.ApiResponse;
import com.eventmanagement.model.entity.Schedule;
import com.eventmanagement.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events/{eventId}/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<List<Schedule>>> generateSchedule(
            @PathVariable Long eventId,
            @Valid @RequestBody GenerateScheduleRequest request) {
        List<Schedule> schedules = scheduleService.generateSchedule(eventId, request);
        return ResponseEntity.ok(ApiResponse.success("Schedule generated successfully", schedules));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Schedule>>> getSchedulesByEventId(@PathVariable Long eventId) {
        List<Schedule> schedules = scheduleService.getSchedulesByEventId(eventId);
        return ResponseEntity.ok(ApiResponse.success(schedules));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.ok(ApiResponse.success("Schedule deleted successfully", null));
    }
}

