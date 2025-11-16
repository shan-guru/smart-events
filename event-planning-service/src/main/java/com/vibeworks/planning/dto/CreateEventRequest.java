package com.vibeworks.planning.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class CreateEventRequest {
    @NotBlank(message = "Event name is required")
    private String eventName;
    
    private String eventInfo;
    private String startDate;
    private String endDate;
    private String eventDate;
    private List<Object> tasks;
    private List<Object> assignedMembers;
    private Integer currentStep;
    private List<Integer> completedSteps;
    private String status; // upcoming, in-progress, completed, closed
}

