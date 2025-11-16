package com.vibeworks.tracking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class PlanningServiceConfig {
    
    @Value("${planning-service.url}")
    private String planningServiceUrl;
    
    @Bean
    public WebClient planningServiceWebClient() {
        return WebClient.builder()
                .baseUrl(planningServiceUrl)
                .build();
    }
}

