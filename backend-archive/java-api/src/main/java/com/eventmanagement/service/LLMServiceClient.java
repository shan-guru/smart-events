package com.eventmanagement.service;

import com.eventmanagement.api.dto.request.GenerateScheduleRequest;
import com.eventmanagement.api.dto.request.GenerateTasksRequest;
import com.eventmanagement.config.LLMServiceConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class LLMServiceClient {

    private final WebClient llmServiceWebClient;
    private final LLMServiceConfig llmServiceConfig;
    private final ObjectMapper objectMapper;

    public Mono<List<Map<String, Object>>> generateTasks(GenerateTasksRequest request) {
        log.info("Calling LLM service to generate tasks for event: {}", request.getEvent());
        
        return llmServiceWebClient.post()
                .uri("/api/v1/generate-tasks")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(llmServiceConfig.getTimeout())
                .retryWhen(Retry.backoff(2, Duration.ofSeconds(1))
                        .filter(throwable -> throwable instanceof WebClientResponseException
                                && ((WebClientResponseException) throwable).getStatusCode().is5xxServerError()))
                .map(response -> {
                    JsonNode tasksNode = response.get("tasks");
                    if (tasksNode != null && tasksNode.isArray()) {
                        return objectMapper.convertValue(tasksNode, 
                                objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class));
                    }
                    throw new RuntimeException("Invalid response format from LLM service");
                })
                .doOnError(error -> log.error("Error calling LLM service for task generation", error))
                .onErrorMap(error -> new RuntimeException("Failed to generate tasks: " + error.getMessage(), error));
    }

    public Mono<List<Map<String, Object>>> generateSchedule(GenerateScheduleRequest request) {
        log.info("Calling LLM service to generate schedule for event: {}", request.getEventName());
        
        return llmServiceWebClient.post()
                .uri("/api/v1/generate-schedule")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(llmServiceConfig.getTimeout())
                .retryWhen(Retry.backoff(2, Duration.ofSeconds(1))
                        .filter(throwable -> throwable instanceof WebClientResponseException
                                && ((WebClientResponseException) throwable).getStatusCode().is5xxServerError()))
                .map(response -> {
                    JsonNode scheduledTasksNode = response.get("scheduled_tasks");
                    if (scheduledTasksNode != null && scheduledTasksNode.isArray()) {
                        return objectMapper.convertValue(scheduledTasksNode, 
                                objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class));
                    }
                    throw new RuntimeException("Invalid response format from LLM service");
                })
                .doOnError(error -> log.error("Error calling LLM service for schedule generation", error))
                .onErrorMap(error -> new RuntimeException("Failed to generate schedule: " + error.getMessage(), error));
    }
}

