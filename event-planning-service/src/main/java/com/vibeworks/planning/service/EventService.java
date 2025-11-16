package com.vibeworks.planning.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vibeworks.planning.dto.*;
import com.vibeworks.planning.model.Event;
import com.vibeworks.planning.repository.EventRepository;
import com.vibeworks.planning.util.exceptions.ResourceAlreadyExistsException;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
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
    
    @Transactional
    public ImportEventsResponse importEvents(MultipartFile file) {
        log.info("Importing events from file: {}", file.getOriginalFilename());
        
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new RuntimeException("File name is required");
        }
        
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        
        try {
            List<Map<String, Object>> eventsData;
            
            switch (extension) {
                case "json":
                    eventsData = parseJsonFile(file);
                    break;
                case "csv":
                    eventsData = parseCsvFile(file);
                    break;
                case "xlsx":
                case "xls":
                    eventsData = parseExcelFile(file, extension);
                    break;
                default:
                    throw new RuntimeException("Unsupported file format: " + extension + ". Supported formats: JSON, CSV, Excel");
            }
            
            return processEventImport(eventsData);
            
        } catch (Exception e) {
            log.error("Error importing events", e);
            throw new RuntimeException("Failed to import events: " + e.getMessage(), e);
        }
    }
    
    private List<Map<String, Object>> parseJsonFile(MultipartFile file) throws Exception {
        String content = new String(file.getBytes(), StandardCharsets.UTF_8);
        return objectMapper.readValue(content, new TypeReference<List<Map<String, Object>>>() {});
    }
    
    private List<Map<String, Object>> parseCsvFile(MultipartFile file) throws Exception {
        List<Map<String, Object>> events = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new RuntimeException("CSV file is empty");
            }
            
            String[] headers = parseCsvLine(headerLine);
            
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                
                String[] values = parseCsvLine(line);
                Map<String, Object> event = new HashMap<>();
                
                for (int i = 0; i < headers.length && i < values.length; i++) {
                    String header = headers[i].trim();
                    String value = values[i].trim();
                    
                    String normalizedHeader = normalizeEventHeader(header);
                    if (!normalizedHeader.isEmpty() && !value.isEmpty()) {
                        event.put(normalizedHeader, value);
                    }
                }
                
                if (!event.isEmpty()) {
                    events.add(event);
                }
            }
        }
        
        return events;
    }
    
    private String[] parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                values.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        values.add(current.toString());
        
        return values.toArray(new String[0]);
    }
    
    private String normalizeEventHeader(String header) {
        String lower = header.toLowerCase().trim();
        
        if (lower.contains("event") && lower.contains("name")) return "eventName";
        if (lower.contains("event") && lower.contains("info")) return "eventInfo";
        if (lower.contains("start") && lower.contains("date")) return "startDate";
        if (lower.contains("end") && lower.contains("date")) return "endDate";
        if (lower.contains("event") && lower.contains("date") && !lower.contains("start") && !lower.contains("end")) return "eventDate";
        if (lower.contains("status")) return "status";
        if (lower.contains("task")) return "tasks";
        if (lower.contains("assigned") || lower.contains("member")) return "assignedMembers";
        if (lower.contains("step")) return "currentStep";
        if (lower.contains("completed")) return "completedSteps";
        
        return "";
    }
    
    private List<Map<String, Object>> parseExcelFile(MultipartFile file, String extension) throws Exception {
        List<Map<String, Object>> events = new ArrayList<>();
        
        try (InputStream is = file.getInputStream();
             Workbook workbook = extension.equals("xlsx") 
                 ? new XSSFWorkbook(is) 
                 : new HSSFWorkbook(is)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet.getPhysicalNumberOfRows() < 2) {
                throw new RuntimeException("Excel file must have at least a header row and one data row");
            }
            
            Row headerRow = sheet.getRow(0);
            List<String> headers = new ArrayList<>();
            for (Cell cell : headerRow) {
                headers.add(getCellValueAsString(cell));
            }
            
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                Map<String, Object> event = new HashMap<>();
                boolean hasData = false;
                
                for (int j = 0; j < headers.size() && j < row.getLastCellNum(); j++) {
                    Cell cell = row.getCell(j);
                    String header = headers.get(j);
                    String value = getCellValueAsString(cell);
                    
                    String normalizedHeader = normalizeEventHeader(header);
                    if (!normalizedHeader.isEmpty() && !value.isEmpty()) {
                        event.put(normalizedHeader, value);
                        hasData = true;
                    }
                }
                
                if (hasData) {
                    events.add(event);
                }
            }
        }
        
        return events;
    }
    
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    double numValue = cell.getNumericCellValue();
                    if (numValue == (long) numValue) {
                        return String.valueOf((long) numValue);
                    } else {
                        return String.valueOf(numValue);
                    }
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }
    
    @Transactional
    private ImportEventsResponse processEventImport(List<Map<String, Object>> eventsData) {
        List<String> errors = new ArrayList<>();
        List<WizardDataResponse> importedEvents = new ArrayList<>();
        int successful = 0;
        int failed = 0;
        
        for (int i = 0; i < eventsData.size(); i++) {
            Map<String, Object> eventData = eventsData.get(i);
            int rowNumber = i + 1;
            
            try {
                // Validate and convert to CreateEventRequest
                CreateEventRequest request = mapToCreateEventRequest(eventData);
                
                // Check for duplicate event name
                if (eventRepository.findByEventName(request.getEventName()).isPresent()) {
                    errors.add("Row " + rowNumber + ": Event with name '" + request.getEventName() + "' already exists");
                    failed++;
                    continue;
                }
                
                // Create event
                Event event = mapToEvent(request);
                Event saved = eventRepository.save(event);
                importedEvents.add(convertToResponse(saved));
                successful++;
                
            } catch (Exception e) {
                errors.add("Row " + rowNumber + ": " + e.getMessage());
                failed++;
                log.error("Error processing event at row {}", rowNumber, e);
            }
        }
        
        return new ImportEventsResponse(
            eventsData.size(),
            successful,
            failed,
            errors,
            importedEvents
        );
    }
    
    private CreateEventRequest mapToCreateEventRequest(Map<String, Object> data) {
        CreateEventRequest request = new CreateEventRequest();
        
        request.setEventName(getStringValue(data, "eventName", "event_name", "Event Name", "name"));
        request.setEventInfo(getStringValue(data, "eventInfo", "event_info", "Event Info", "info", "description"));
        request.setStartDate(getStringValue(data, "startDate", "start_date", "Start Date"));
        request.setEndDate(getStringValue(data, "endDate", "end_date", "End Date"));
        request.setEventDate(getStringValue(data, "eventDate", "event_date", "Event Date"));
        request.setStatus(getStringValue(data, "status", "Status"));
        
        // Handle tasks (can be JSON string or array)
        Object tasksObj = data.get("tasks");
        if (tasksObj != null) {
            if (tasksObj instanceof String) {
                try {
                    request.setTasks(objectMapper.readValue((String) tasksObj, new TypeReference<List<Object>>() {}));
                } catch (Exception e) {
                    request.setTasks(List.of());
                }
            } else if (tasksObj instanceof List) {
                request.setTasks((List<Object>) tasksObj);
            }
        }
        
        // Handle assignedMembers
        Object membersObj = data.get("assignedMembers");
        if (membersObj != null) {
            if (membersObj instanceof String) {
                try {
                    request.setAssignedMembers(objectMapper.readValue((String) membersObj, new TypeReference<List<Object>>() {}));
                } catch (Exception e) {
                    request.setAssignedMembers(List.of());
                }
            } else if (membersObj instanceof List) {
                request.setAssignedMembers((List<Object>) membersObj);
            }
        }
        
        // Handle currentStep
        Object stepObj = data.get("currentStep");
        if (stepObj != null) {
            if (stepObj instanceof Number) {
                request.setCurrentStep(((Number) stepObj).intValue());
            } else if (stepObj instanceof String) {
                try {
                    request.setCurrentStep(Integer.parseInt((String) stepObj));
                } catch (NumberFormatException e) {
                    request.setCurrentStep(1);
                }
            }
        } else {
            request.setCurrentStep(1);
        }
        
        // Handle completedSteps
        Object completedObj = data.get("completedSteps");
        if (completedObj != null) {
            if (completedObj instanceof String) {
                try {
                    request.setCompletedSteps(objectMapper.readValue((String) completedObj, new TypeReference<List<Integer>>() {}));
                } catch (Exception e) {
                    request.setCompletedSteps(List.of());
                }
            } else if (completedObj instanceof List) {
                request.setCompletedSteps((List<Integer>) completedObj);
            }
        }
        
        // Validate required fields
        if (request.getEventName() == null || request.getEventName().trim().isEmpty()) {
            throw new RuntimeException("Event name is required");
        }
        
        return request;
    }
    
    private String getStringValue(Map<String, Object> data, String... keys) {
        for (String key : keys) {
            Object value = data.get(key);
            if (value != null) {
                return value.toString().trim();
            }
        }
        return null;
    }
    
    private Event mapToEvent(CreateEventRequest request) {
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
}

