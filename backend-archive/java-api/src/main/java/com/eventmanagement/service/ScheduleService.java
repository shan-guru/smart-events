package com.eventmanagement.service;

import com.eventmanagement.api.dto.request.GenerateScheduleRequest;
import com.eventmanagement.model.entity.Event;
import com.eventmanagement.model.entity.Schedule;
import com.eventmanagement.model.entity.Task;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.repository.ScheduleRepository;
import com.eventmanagement.repository.TaskRepository;
import com.eventmanagement.util.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final EventRepository eventRepository;
    private final TaskRepository taskRepository;
    private final LLMServiceClient llmServiceClient;

    @Transactional
    public List<Schedule> generateSchedule(Long eventId, GenerateScheduleRequest request) {
        log.info("Generating schedule for event id: {}", eventId);
        
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));
        
        // Call LLM service to generate schedule
        List<Map<String, Object>> scheduledTasks = llmServiceClient.generateSchedule(request)
                .block(); // Blocking call - in production, consider async
        
        // Save schedules to database
        List<Schedule> schedules = scheduledTasks.stream()
                .map(scheduledTask -> mapToScheduleEntity(eventId, scheduledTask))
                .toList();
        
        return scheduleRepository.saveAll(schedules);
    }

    @Transactional(readOnly = true)
    public List<Schedule> getSchedulesByEventId(Long eventId) {
        return scheduleRepository.findByEventIdOrderByStartDateTimeAsc(eventId);
    }

    @Transactional
    public void deleteSchedule(Long id) {
        log.info("Deleting schedule with id: {}", id);
        
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule", id));
        
        scheduleRepository.delete(schedule);
    }

    @Transactional
    public void deleteSchedulesByEventId(Long eventId) {
        log.info("Deleting all schedules for event id: {}", eventId);
        scheduleRepository.deleteByEventId(eventId);
    }

    private Schedule mapToScheduleEntity(Long eventId, Map<String, Object> scheduledTask) {
        Schedule schedule = new Schedule();
        schedule.setEventId(eventId);
        
        // Find task by title or create reference
        String taskTitle = (String) scheduledTask.get("task_title");
        List<Task> tasks = taskRepository.findByEventId(eventId);
        Task matchingTask = tasks.stream()
                .filter(t -> t.getTaskTitle().equals(taskTitle))
                .findFirst()
                .orElse(null);
        
        if (matchingTask != null) {
            schedule.setTaskId(matchingTask.getId());
        }
        
        // Extract member ID from owners
        List<Map<String, Object>> owners = (List<Map<String, Object>>) scheduledTask.get("owners");
        if (owners != null && !owners.isEmpty()) {
            Object memberId = owners.get(0).get("id");
            if (memberId instanceof Number) {
                schedule.setMemberId(((Number) memberId).longValue());
            }
        }
        
        schedule.setStartDateTime((String) scheduledTask.get("start_date_time"));
        schedule.setEndDateTime((String) scheduledTask.get("end_date_time"));
        
        return schedule;
    }
}

