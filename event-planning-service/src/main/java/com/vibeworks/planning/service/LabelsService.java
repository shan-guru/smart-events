package com.vibeworks.planning.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

@Service
@Slf4j
public class LabelsService {
    
    private final Map<String, String> labels = new HashMap<>();
    
    public LabelsService() {
        loadLabels();
    }
    
    private void loadLabels() {
        try {
            ClassPathResource resource = new ClassPathResource("labels.properties");
            Properties properties = new Properties();
            
            try (InputStream inputStream = resource.getInputStream()) {
                properties.load(inputStream);
            }
            
            // Convert Properties to Map
            for (String key : properties.stringPropertyNames()) {
                labels.put(key, properties.getProperty(key));
            }
            
            log.info("Loaded {} labels from properties file", labels.size());
        } catch (IOException e) {
            log.error("Failed to load labels.properties file", e);
        }
    }
    
    public Map<String, String> getAllLabels() {
        return new HashMap<>(labels);
    }
    
    public String getLabel(String key) {
        return labels.getOrDefault(key, key);
    }
    
    public String getLabel(String key, String defaultValue) {
        return labels.getOrDefault(key, defaultValue);
    }
    
    public Map<String, String> getLabelsByPrefix(String prefix) {
        Map<String, String> filtered = new HashMap<>();
        for (Map.Entry<String, String> entry : labels.entrySet()) {
            if (entry.getKey().startsWith(prefix)) {
                filtered.put(entry.getKey(), entry.getValue());
            }
        }
        return filtered;
    }
}

