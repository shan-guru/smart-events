package com.vibeworks.planning.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vibeworks.planning.dto.TaskGenerationRequest;
import com.vibeworks.planning.dto.WizardDataRequest;
import com.vibeworks.planning.dto.WizardDataResponse;
import com.vibeworks.planning.model.Event;
import com.vibeworks.planning.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class EventService {
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private AiServiceClient aiServiceClient;
    
    public WizardDataResponse saveWizardData(WizardDataRequest request) {
        Optional<Event> existing = eventRepository.findByEventName(request.getEventName());
        
        Event event;
        if (existing.isPresent()) {
            event = existing.get();
            updateEventFromRequest(event, request);
        } else {
            event = createEventFromRequest(request);
        }
        
        event = eventRepository.save(event);
        return convertToResponse(event);
    }
    
    public WizardDataResponse getWizardData(String eventName) {
        Event event = eventRepository.findByEventName(eventName)
                .orElseThrow(() -> new RuntimeException("Wizard data not found"));
        return convertToResponse(event);
    }
    
    public List<WizardDataResponse> getAllWizards() {
        return eventRepository.findAll().stream()
                .map(this::convertToResponse)
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .toList();
    }
    
    public void deleteWizardData(String eventName) {
        Event event = eventRepository.findByEventName(eventName)
                .orElseThrow(() -> new RuntimeException("Wizard data not found"));
        eventRepository.delete(event);
    }
    
    @Transactional
    public Map generateTasks(TaskGenerationRequest request) {
        return aiServiceClient.generateTasks(request)
                .block(); // Synchronous call for now
    }
    
    private Event createEventFromRequest(WizardDataRequest request) {
        Event event = new Event();
        event.setEventName(request.getEventName());
        event.setEventInfo(request.getEventInfo());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setEventDate(request.getEventDate());
        event.setTasks(convertToJsonString(request.getTasks()));
        event.setAssignedMembers(convertToJsonString(request.getAssignedMembers()));
        event.setCurrentStep(request.getCurrentStep() != null ? request.getCurrentStep() : 1);
        event.setCompletedSteps(convertToJsonString(request.getCompletedSteps()));
        return event;
    }
    
    private void updateEventFromRequest(Event event, WizardDataRequest request) {
        event.setEventInfo(request.getEventInfo());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setEventDate(request.getEventDate());
        event.setTasks(convertToJsonString(request.getTasks()));
        event.setAssignedMembers(convertToJsonString(request.getAssignedMembers()));
        event.setCurrentStep(request.getCurrentStep() != null ? request.getCurrentStep() : 1);
        event.setCompletedSteps(convertToJsonString(request.getCompletedSteps()));
    }
    
    private WizardDataResponse convertToResponse(Event event) {
        WizardDataResponse response = new WizardDataResponse();
        response.setId(event.getId());
        response.setEventName(event.getEventName());
        response.setEventInfo(event.getEventInfo());
        response.setStartDate(event.getStartDate());
        response.setEndDate(event.getEndDate());
        response.setEventDate(event.getEventDate());
        response.setTasks(convertFromJsonString(event.getTasks()));
        response.setAssignedMembers(convertFromJsonString(event.getAssignedMembers()));
        response.setCurrentStep(event.getCurrentStep());
        response.setCompletedSteps(convertFromJsonStringToIntList(event.getCompletedSteps()));
        response.setCreatedAt(event.getCreatedAt());
        response.setUpdatedAt(event.getUpdatedAt());
        return response;
    }
    
    private String convertToJsonString(Object obj) {
        try {
            if (obj == null) {
                return "[]";
            }
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "[]";
        }
    }
    
    private List<Object> convertFromJsonString(String json) {
        try {
            if (json == null || json.isEmpty()) {
                return List.of();
            }
            return objectMapper.readValue(json, new TypeReference<List<Object>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
    
    private List<Integer> convertFromJsonStringToIntList(String json) {
        try {
            if (json == null || json.isEmpty()) {
                return List.of();
            }
            return objectMapper.readValue(json, new TypeReference<List<Integer>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}

