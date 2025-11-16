package com.vibeworks.planning.controller;

import com.vibeworks.planning.service.LabelsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/labels")
@CrossOrigin(origins = "*")
@Tag(name = "Labels", description = "Resource bundle labels API")
public class LabelsController {
    
    @Autowired
    private LabelsService labelsService;
    
    @GetMapping
    @Operation(summary = "Get all labels")
    public ResponseEntity<Map<String, String>> getAllLabels() {
        Map<String, String> labels = labelsService.getAllLabels();
        return ResponseEntity.ok(labels);
    }
    
    @GetMapping("/{key}")
    @Operation(summary = "Get a specific label by key")
    public ResponseEntity<Map<String, String>> getLabel(@PathVariable String key) {
        String value = labelsService.getLabel(key);
        return ResponseEntity.ok(Map.of(key, value));
    }
    
    @GetMapping("/prefix/{prefix}")
    @Operation(summary = "Get all labels with a specific prefix")
    public ResponseEntity<Map<String, String>> getLabelsByPrefix(@PathVariable String prefix) {
        Map<String, String> labels = labelsService.getLabelsByPrefix(prefix);
        return ResponseEntity.ok(labels);
    }
}

