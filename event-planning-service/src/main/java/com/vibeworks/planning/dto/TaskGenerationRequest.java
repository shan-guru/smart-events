package com.vibeworks.planning.dto;

import lombok.Data;

@Data
public class TaskGenerationRequest {
    private String event;
    private String eventInfo;
}

