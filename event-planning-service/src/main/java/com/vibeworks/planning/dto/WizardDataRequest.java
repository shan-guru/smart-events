package com.vibeworks.planning.dto;

import lombok.Data;
import java.util.List;

@Data
public class WizardDataRequest {
    private String eventName;
    private String eventInfo;
    private String startDate;
    private String endDate;
    private String eventDate;
    private List<Object> tasks;
    private List<Object> assignedMembers;
    private Integer currentStep;
    private List<Integer> completedSteps;
}

