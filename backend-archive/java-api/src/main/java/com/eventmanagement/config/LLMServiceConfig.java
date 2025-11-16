package com.eventmanagement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Configuration
public class LLMServiceConfig {

    @Value("${llm.service.url}")
    private String llmServiceUrl;

    @Value("${llm.service.timeout:30000}")
    private long timeout;

    @Bean
    public WebClient llmServiceWebClient() {
        return WebClient.builder()
                .baseUrl(llmServiceUrl)
                .defaultHeader("Content-Type", "application/json")
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(10 * 1024 * 1024)) // 10MB
                .build();
    }

    public String getLlmServiceUrl() {
        return llmServiceUrl;
    }

    public Duration getTimeout() {
        return Duration.ofMillis(timeout);
    }
}

