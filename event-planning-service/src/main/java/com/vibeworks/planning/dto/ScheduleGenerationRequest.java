package com.vibeworks.planning.dto;

import lombok.Data;
import java.util.List;

@Data
public class ScheduleGenerationRequest {
    private String eventName;
    private String eventInfo;
    private String eventStartDate;
    private String eventEndDate;
    private List<Object> tasks;
    private List<Object> members;
}

