package com.vibeworks.planning.controller;

import com.vibeworks.planning.dto.ScheduleGenerationRequest;
import com.vibeworks.planning.service.AiServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = "*")
public class ScheduleController {
    
    @Autowired
    private AiServiceClient aiServiceClient;
    
    @PostMapping("/generate")
    public ResponseEntity<Map> generateSchedule(@RequestBody ScheduleGenerationRequest request) {
        Map response = aiServiceClient.generateSchedule(request).block();
        return ResponseEntity.ok(response);
    }
}

