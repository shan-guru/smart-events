package com.vibeworks.planning.service;

import com.vibeworks.planning.dto.ScheduleGenerationRequest;
import com.vibeworks.planning.dto.TaskGenerationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class AiServiceClient {
    
    @Autowired
    private WebClient aiServiceWebClient;
    
    public Mono<Map> generateTasks(TaskGenerationRequest request) {
        return aiServiceWebClient.post()
                .uri("/generate-tasks")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Map.class);
    }
    
    public Mono<Map> generateSchedule(ScheduleGenerationRequest request) {
        return aiServiceWebClient.post()
                .uri("/generate-schedule")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Map.class);
    }
    
    public Mono<Map> generateTaskName(String description) {
        Map<String, String> request = Map.of("description", description);
        return aiServiceWebClient.post()
                .uri("/generate-task-name")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Map.class);
    }
}

