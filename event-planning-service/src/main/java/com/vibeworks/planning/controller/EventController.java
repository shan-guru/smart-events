package com.vibeworks.planning.controller;

import com.vibeworks.planning.dto.*;
import com.vibeworks.planning.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {
    
    @Autowired
    private EventService eventService;
    
    @PostMapping("/save-wizard")
    public ResponseEntity<WizardDataResponse> saveWizardData(@RequestBody WizardDataRequest request) {
        WizardDataResponse response = eventService.saveWizardData(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/wizard/{eventName}")
    public ResponseEntity<WizardDataResponse> getWizardData(@PathVariable String eventName) {
        WizardDataResponse response = eventService.getWizardData(eventName);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/wizards")
    public ResponseEntity<List<WizardDataResponse>> getAllWizards() {
        List<WizardDataResponse> responses = eventService.getAllWizards();
        return ResponseEntity.ok(responses);
    }
    
    @DeleteMapping("/wizard/{eventName}")
    public ResponseEntity<Map<String, String>> deleteWizardData(@PathVariable String eventName) {
        eventService.deleteWizardData(eventName);
        return ResponseEntity.ok(Map.of("message", "Wizard data deleted successfully"));
    }
    
    @PostMapping("/generate-tasks")
    public ResponseEntity<Map> generateTasks(@RequestBody TaskGenerationRequest request) {
        Map response = eventService.generateTasks(request);
        return ResponseEntity.ok(response);
    }
}

