"""
Gemini AI service for task generation and scheduling.
"""
import os
import json
import re
import google.generativeai as genai
from typing import List, Dict, Any
from app.config import settings


class GeminiService:
    """Service for interacting with Google Gemini AI."""
    
    def __init__(self):
        """Initialize Gemini API."""
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is required")
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
    
    def generate_tasks(self, event: str, event_info: str) -> List[Dict[str, Any]]:
        """
        Generate optimal task list for an event.
        
        Args:
            event: Event name
            event_info: Additional event information
            
        Returns:
            List of task dictionaries
        """
        prompt = self._create_task_generation_prompt(event, event_info)
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text
            
            # Parse tasks from response
            tasks = self._parse_tasks_from_response(response_text)
            
            if not tasks:
                raise ValueError("No tasks were parsed from the response")
            
            return tasks
            
        except Exception as e:
            raise RuntimeError(f"Error generating tasks: {str(e)}")
    
    def generate_schedule(
        self,
        event_name: str,
        event_info: str,
        event_start_date: str,
        event_end_date: str,
        tasks: List[Dict[str, Any]],
        members: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Generate optimal schedule for tasks and members.
        
        Args:
            event_name: Event name
            event_info: Event information
            event_start_date: Event start date
            event_end_date: Event end date
            tasks: List of tasks
            members: List of members
            
        Returns:
            List of scheduled task dictionaries
        """
        prompt = self._create_scheduling_prompt(
            event_name, event_info, event_start_date, event_end_date, tasks, members
        )
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text
            
            # Parse scheduled tasks from response
            scheduled_tasks = self._parse_tasks_from_response(response_text)
            
            if not scheduled_tasks:
                raise ValueError("No scheduled tasks were parsed from the response")
            
            return scheduled_tasks
            
        except Exception as e:
            raise RuntimeError(f"Error generating schedule: {str(e)}")
    
    def _create_task_generation_prompt(self, event: str, event_info: str) -> str:
        """Create prompt for task generation."""
        return f"""You are an expert project manager and event planner. Your task is to analyze an event and generate the MOST OPTIMAL list of tasks to accomplish it successfully.

EVENT: {event}

EVENT INFORMATION: {event_info}

Please generate a comprehensive, well-structured, and OPTIMAL list of tasks that will ensure the event's success. Consider:
1. Critical path items that must be completed
2. Logical sequence and dependencies
3. Resource allocation and time management
4. Risk mitigation tasks
5. Quality assurance steps
6. Post-event follow-up tasks

CRITICAL: You MUST return ONLY a valid JSON array. Do NOT include any markdown code blocks, explanations, or additional text. Start your response with [ and end with ].

Required JSON format:
[
    {{
        "task": "Task name/title",
        "description": "Detailed description of what needs to be done",
        "priority": "high",
        "estimated_duration": {{
            "quantity": 2,
            "unit": "days"
        }}
    }}
]

Requirements:
- Return ONLY the JSON array, no other text
- Each task must have: task (string), description (string), priority (string: "high", "medium", or "low"), estimated_duration (object with quantity and unit or null)
- Tasks should be specific, actionable, and measurable
- Prioritize tasks logically (high priority first)
- Include realistic duration estimates
- Aim for 5-15 tasks depending on event complexity
- Ensure tasks are in logical order

Your response must be valid JSON that can be parsed directly with json.loads()."""
    
    def _create_scheduling_prompt(
        self,
        event_name: str,
        event_info: str,
        event_start_date: str,
        event_end_date: str,
        tasks: List[Dict[str, Any]],
        members: List[Dict[str, Any]]
    ) -> str:
        """Create prompt for schedule generation."""
        # Format members
        members_info = []
        for member in members:
            member_str = f"- {member.get('firstName', '')} {member.get('lastName', '')} {member.get('name', '')} ({member.get('type', 'person')})"
            if member.get('specializedIn'):
                member_str += f", Specialized in: {member['specializedIn']}"
            if member.get('experience'):
                member_str += f", Experience: {member['experience']}"
            members_info.append(member_str)
        
        # Format tasks
        tasks_info = []
        for idx, task in enumerate(tasks, 1):
            task_str = f"{idx}. {task.get('task', '')} - {task.get('description', '')}"
            if task.get('priority'):
                task_str += f" (Priority: {task['priority']})"
            if task.get('estimated_duration'):
                dur = task['estimated_duration']
                if isinstance(dur, dict):
                    task_str += f" (Duration: {dur.get('quantity', '')} {dur.get('unit', '')})"
            tasks_info.append(task_str)
        
        return f"""You are an expert project scheduler. Your task is to create an optimal schedule for an event by assigning tasks to the most suitable team members based on their expertise and experience.

EVENT: {event_name}
EVENT INFORMATION: {event_info}
EVENT DATE RANGE: {event_start_date} to {event_end_date}

AVAILABLE TASKS:
{chr(10).join(tasks_info)}

AVAILABLE TEAM MEMBERS:
{chr(10).join(members_info)}

CRITICAL RULES:
1. Consider each member's specialization and experience when assigning tasks
2. Match tasks to members who have relevant expertise
3. Distribute workload fairly among team members
4. Consider task priorities - high priority tasks should be scheduled earlier
5. Ensure realistic time allocation based on task duration
6. Schedule tasks within the event date range: {event_start_date} to {event_end_date}
7. Allow for reasonable breaks between tasks
8. Consider dependencies - some tasks may need to be completed before others

CRITICAL: You MUST return ONLY a valid JSON array. Do NOT include any markdown code blocks, explanations, or additional text. Start your response with [ and end with ].

Required JSON format:
[
    {{
        "task_title": "Task name/title",
        "priority": "high",
        "duration": {{
            "quantity": 2,
            "unit": "hours"
        }},
        "owners": [
            {{
                "id": 1234567890,
                "type": "person",
                "name": "John Doe"
            }}
        ],
        "start_date_time": "2024-01-15T09:00:00",
        "end_date_time": "2024-01-15T11:00:00",
        "order": 1
    }}
]

Requirements:
- Return ONLY the JSON array, no other text
- Each scheduled task must have: task_title, priority, duration (object), owners (array), start_date_time (ISO format), end_date_time (ISO format), order (integer)
- Assign tasks to members based on their specialization
- Schedule all tasks within the event date range
- Use ISO 8601 format for dates: YYYY-MM-DDTHH:MM:SS

Your response must be valid JSON that can be parsed directly with json.loads()."""
    
    def _parse_tasks_from_response(self, response_text: str) -> List[Dict[str, Any]]:
        """Parse task list from Gemini response."""
        if not response_text or not response_text.strip():
            return []
        
        # Strategy 1: Try to extract JSON from markdown code blocks
        json_match = re.search(r'```(?:json)?\s*(\[.*?\])\s*```', response_text, re.DOTALL)
        if json_match:
            try:
                json_str = json_match.group(1).strip()
                tasks = json.loads(json_str)
                if isinstance(tasks, list) and len(tasks) > 0:
                    return tasks
            except (json.JSONDecodeError, ValueError):
                pass
        
        # Strategy 2: Try to find JSON array with balanced brackets
        first_bracket = response_text.find('[')
        last_bracket = response_text.rfind(']')
        if first_bracket != -1 and last_bracket != -1 and last_bracket > first_bracket:
            try:
                json_str = response_text[first_bracket:last_bracket + 1]
                tasks = json.loads(json_str)
                if isinstance(tasks, list) and len(tasks) > 0:
                    return tasks
            except (json.JSONDecodeError, ValueError):
                pass
        
        # Strategy 3: Try to clean and parse the entire response
        cleaned = response_text.strip()
        cleaned = re.sub(r'```(?:json)?', '', cleaned)
        cleaned = re.sub(r'```', '', cleaned)
        cleaned = cleaned.strip()
        
        if cleaned.startswith('[') and cleaned.endswith(']'):
            try:
                tasks = json.loads(cleaned)
                if isinstance(tasks, list) and len(tasks) > 0:
                    return tasks
            except (json.JSONDecodeError, ValueError):
                pass
        
        raise ValueError("Unable to parse tasks from response")


# Singleton instance
_gemini_service = None

def get_gemini_service() -> GeminiService:
    """Get singleton Gemini service instance."""
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service

