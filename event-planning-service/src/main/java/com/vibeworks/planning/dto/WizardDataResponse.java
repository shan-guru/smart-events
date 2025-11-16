package com.vibeworks.planning.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WizardDataResponse {
    private Long id;
    private String eventName;
    private String eventInfo;
    private String startDate;
    private String endDate;
    private String eventDate;
    private List<Object> tasks;
    private List<Object> assignedMembers;
    private Integer currentStep;
    private List<Integer> completedSteps;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

