#!/usr/bin/env python3
"""
AI Service (LLM Service) - Isolated microservice for all LLM interactions.
This service handles task generation, schedule generation, and task name generation using Google Gemini AI.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
import re

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="AI Service (LLM Service)",
    description="Microservice for all LLM interactions - task generation, schedule generation, and task name generation",
    version="1.0.0"
)

# Add CORS middleware - allow all origins for microservice communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for microservice communication
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini
def initialize_gemini():
    """Initialize Gemini API with API key from environment variable."""
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY not found. Please set it in your .env file or environment variables."
        )
    
    genai.configure(api_key=api_key)
    return genai

# Initialize on startup
try:
    initialize_gemini()
except ValueError as e:
    print(f"Warning: {e}")

# Request/Response Models
class EventRequest(BaseModel):
    """Request model for event task generation."""
    event: str = Field(..., description="The event name or type", example="Product Launch")
    event_info: str = Field(..., description="Additional information about the event", example="Launching a new mobile app in Q2 2024, targeting tech-savvy millennials")
    
    class Config:
        json_schema_extra = {
            "example": {
                "event": "Product Launch",
                "event_info": "Launching a new mobile app in Q2 2024, targeting tech-savvy millennials"
            }
        }


class Duration(BaseModel):
    """Duration model with quantity and unit."""
    quantity: Optional[float] = Field(None, description="Duration quantity (e.g., 2, 1.5)")
    unit: Optional[str] = Field(None, description="Duration unit: 'hours' or 'days'")


class TaskItem(BaseModel):
    """Individual task item model."""
    task: str = Field(..., description="The task name/title")
    description: str = Field(..., description="Detailed description of the task")
    priority: str = Field(..., description="Task priority: high, medium, or low")
    estimated_duration: Optional[Duration] = Field(None, description="Estimated duration with quantity and unit")


class TaskResponse(BaseModel):
    """Response model containing list of tasks."""
    event: str = Field(..., description="The event name")
    tasks: List[TaskItem] = Field(..., description="List of optimal tasks to accomplish the event")
    total_tasks: int = Field(..., description="Total number of tasks")
    
    class Config:
        json_schema_extra = {
            "example": {
                "event": "Product Launch",
                "total_tasks": 5,
                "tasks": [
                    {
                        "task": "Define product positioning",
                        "description": "Research and define the product positioning strategy and identify target audience segments",
                        "priority": "high",
                        "estimated_duration": {
                            "quantity": 2.5,
                            "unit": "days"
                        }
                    }
                ]
            }
        }


class ScheduledTask(BaseModel):
    """Model for a scheduled task."""
    task_title: str
    priority: str
    duration: Duration
    owners: List[dict] = Field(default_factory=list)
    start_date_time: str
    end_date_time: str
    order: int


class ScheduleRequest(BaseModel):
    """Request model for AI scheduling."""
    event_name: str
    event_info: Optional[str] = None
    event_start_date: Optional[str] = None
    event_end_date: Optional[str] = None
    tasks: List[dict] = Field(default_factory=list)
    members: List[dict] = Field(default_factory=list)


class ScheduleResponse(BaseModel):
    """Response model for scheduled tasks."""
    scheduled_tasks: List[ScheduledTask]


class TaskNameRequest(BaseModel):
    """Request model for generating task name."""
    description: str = Field(..., description="Task description to generate name from")


class TaskNameResponse(BaseModel):
    """Response model for generated task name."""
    task_name: str = Field(..., description="Generated short task name")


# LLM Functions
def create_optimized_prompt(event: str, event_info: str) -> str:
    """
    Create an optimized prompt for generating the most optimal task list.
    This is the KSR (Key Success Requirement) - arriving at the most optimal tasks.
    """
    prompt = f"""You are an expert project manager and event planner. Your task is to analyze an event and generate the MOST OPTIMAL list of tasks to accomplish it successfully.

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

Required JSON format (copy this exact structure):
[
    {{
        "task": "Task name/title",
        "description": "Detailed description of what needs to be done",
        "priority": "high",
        "estimated_duration": {{
            "quantity": 2,
            "unit": "days"
        }}
    }},
    {{
        "task": "Another task name",
        "description": "Detailed description of this task",
        "priority": "medium",
        "estimated_duration": {{
            "quantity": 4,
            "unit": "hours"
        }}
    }}
]

Requirements:
- Return ONLY the JSON array, no other text
- Start with [ and end with ]
- Each task must have: task (string - short title), description (string - detailed description), priority (string: "high", "medium", or "low"), estimated_duration (object with "quantity" (number) and "unit" (string: "hours" or "days") or null)
- Task should be a short, clear title (2-5 words)
- Description should be detailed and explain what needs to be done
- Tasks should be specific, actionable, and measurable
- Prioritize tasks logically (high priority first)
- Include realistic duration estimates (e.g., "2-3 days", "1 week", "4 hours")
- Aim for 5-15 tasks depending on event complexity
- Ensure tasks are in logical order
- Focus on OPTIMAL task selection - only include tasks that are truly necessary and impactful

Your response must be valid JSON that can be parsed directly with json.loads(). Do not wrap it in markdown code blocks."""
    
    return prompt


def parse_tasks_from_response(response_text: str) -> List[dict]:
    """
    Parse task list from Gemini response.
    Handles various response formats and extracts JSON with multiple fallback strategies.
    """
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
    
    # Strategy 3: Try to extract JSON with more flexible regex
    json_patterns = [
        r'\[[\s\S]*?\]',  # Any array-like structure
        r'\{[\s\S]*?"task"[\s\S]*?\}',  # Object with "task" key
    ]
    
    for pattern in json_patterns:
        matches = re.findall(pattern, response_text, re.DOTALL)
        for match in matches:
            try:
                tasks = json.loads(match)
                if isinstance(tasks, list) and len(tasks) > 0:
                    return tasks
                if isinstance(tasks, dict) and "task" in tasks:
                    return [tasks]
            except (json.JSONDecodeError, ValueError):
                continue
    
    # Strategy 4: Try to clean and parse the entire response
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
    
    # Strategy 5: Try to parse line by line and reconstruct JSON
    lines = response_text.split('\n')
    json_lines = []
    in_json = False
    bracket_count = 0
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        
        if '[' in stripped and not in_json:
            in_json = True
            bracket_count = stripped.count('[') - stripped.count(']')
            json_lines.append(stripped)
            continue
        
        if in_json:
            json_lines.append(stripped)
            bracket_count += stripped.count('[') - stripped.count(']')
            if bracket_count == 0:
                try:
                    json_str = '\n'.join(json_lines)
                    tasks = json.loads(json_str)
                    if isinstance(tasks, list) and len(tasks) > 0:
                        return tasks
                except (json.JSONDecodeError, ValueError):
                    pass
                json_lines = []
                in_json = False
    
    # Strategy 6: Fallback to text parsing
    print(f"JSON parsing failed, attempting text parsing. Response preview: {response_text[:200]}")
    return parse_tasks_from_text(response_text)


def parse_tasks_from_text(text: str) -> List[dict]:
    """
    Fallback parser for when JSON parsing fails.
    Attempts to extract tasks from structured text with multiple patterns.
    """
    tasks = []
    lines = text.split('\n')
    
    current_task = None
    current_task_text = []
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        
        # Pattern 1: Numbered list (1., 2., etc.)
        numbered_match = re.match(r'^(\d+)[\.\)]\s*(.+)', line)
        if numbered_match:
            if current_task and current_task_text:
                task_text = ' '.join(current_task_text)
                parts = task_text.split(':', 1)
                if len(parts) == 2:
                    current_task["task"] = parts[0].strip()
                    current_task["description"] = parts[1].strip()
                else:
                    current_task["task"] = task_text[:50].strip()
                    current_task["description"] = task_text.strip()
                tasks.append(current_task)
            task_text = numbered_match.group(2)
            parts = task_text.split(':', 1)
            if len(parts) == 2:
                current_task = {
                    "task": parts[0].strip(),
                    "description": parts[1].strip(),
                    "priority": "medium",
                    "estimated_duration": None
                }
                current_task_text = [parts[1].strip()]
            else:
                current_task = {
                    "task": task_text[:50].strip(),
                    "description": task_text.strip(),
                    "priority": "medium",
                    "estimated_duration": None
                }
                current_task_text = [task_text]
            continue
        
        # Pattern 2: Bullet points (-, *, •)
        bullet_match = re.match(r'^[-*•]\s*(.+)', line)
        if bullet_match:
            if current_task and current_task_text:
                task_text = ' '.join(current_task_text)
                parts = task_text.split(':', 1)
                if len(parts) == 2:
                    current_task["task"] = parts[0].strip()
                    current_task["description"] = parts[1].strip()
                else:
                    current_task["task"] = task_text[:50].strip()
                    current_task["description"] = task_text.strip()
                tasks.append(current_task)
            task_text = bullet_match.group(1)
            parts = task_text.split(':', 1)
            if len(parts) == 2:
                current_task = {
                    "task": parts[0].strip(),
                    "description": parts[1].strip(),
                    "priority": "medium",
                    "estimated_duration": None
                }
                current_task_text = [parts[1].strip()]
            else:
                current_task = {
                    "task": task_text[:50].strip(),
                    "description": task_text.strip(),
                    "priority": "medium",
                    "estimated_duration": None
                }
                current_task_text = [task_text]
            continue
        
        # Pattern 3: Lines starting with "task" or containing task-like keywords
        if re.match(r'^(task|action|step|item)', line, re.IGNORECASE):
            if current_task and current_task_text:
                task_text = ' '.join(current_task_text)
                parts = task_text.split(':', 1)
                if len(parts) == 2:
                    current_task["task"] = parts[0].strip()
                    current_task["description"] = parts[1].strip()
                else:
                    current_task["task"] = task_text[:50].strip()
                    current_task["description"] = task_text.strip()
                tasks.append(current_task)
            task_text = re.sub(r'^(task|action|step|item)[:\s]+', '', line, flags=re.IGNORECASE)
            parts = task_text.split(':', 1)
            if len(parts) == 2:
                current_task = {
                    "task": parts[0].strip(),
                    "description": parts[1].strip(),
                    "priority": "medium",
                    "estimated_duration": None
                }
                current_task_text = [parts[1].strip()]
            else:
                current_task = {
                    "task": task_text[:50].strip(),
                    "description": task_text.strip(),
                    "priority": "medium",
                    "estimated_duration": None
                }
                current_task_text = [task_text]
            continue
        
        # Pattern 4: Continue current task if it's a continuation line
        if current_task:
            if re.search(r'\b(high|medium|low|priority)\b', line, re.IGNORECASE):
                if 'high' in line.lower():
                    current_task["priority"] = "high"
                elif 'low' in line.lower():
                    current_task["priority"] = "low"
                time_match = re.search(r'(\d+\s*(?:days?|weeks?|hours?|months?))', line, re.IGNORECASE)
                if time_match:
                    current_task["estimated_duration"] = time_match.group(1)
            else:
                current_task_text.append(line)
    
    # Add the last task
    if current_task and current_task_text:
        task_text = ' '.join(current_task_text)
        parts = task_text.split(':', 1)
        if len(parts) == 2:
            current_task["task"] = parts[0].strip()
            current_task["description"] = parts[1].strip()
        else:
            current_task["task"] = task_text[:50].strip()
            current_task["description"] = task_text.strip()
        tasks.append(current_task)
    
    # If we still have no tasks, try to extract any sentence-like structures
    if not tasks:
        sentences = re.split(r'[.!?]\s+', text)
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 10 and not sentence.startswith('#'):
                sentence = re.sub(r'^\d+[\.\)]\s*', '', sentence)
                sentence = re.sub(r'^[-*•]\s*', '', sentence)
                if sentence:
                    tasks.append({
                        "task": sentence[:50],
                        "description": sentence[:200],
                        "priority": "medium",
                        "estimated_duration": None
                    })
    
    # Final fallback
    if not tasks:
        return [{
            "task": "Parsing Error",
            "description": "Unable to parse tasks from response. The AI may have returned an unexpected format. Please try again.",
            "priority": "medium",
            "estimated_duration": None
        }]
    
    return tasks


def parse_duration(duration_data) -> Optional[Duration]:
    """
    Parse duration from various formats and convert to Duration model.
    """
    if not duration_data:
        return None
    
    if isinstance(duration_data, dict):
        quantity = duration_data.get("quantity")
        unit = duration_data.get("unit", "").lower()
        
        if unit not in ["hours", "days"]:
            if "hour" in unit or "hr" in unit:
                unit = "hours"
            elif "day" in unit:
                unit = "days"
            else:
                unit = None
        
        if quantity is not None and unit:
            try:
                quantity = float(quantity)
                return Duration(quantity=quantity, unit=unit)
            except (ValueError, TypeError):
                pass
    
    if isinstance(duration_data, str):
        duration_str = duration_data.strip().lower()
        if not duration_str or duration_str == "null" or duration_str == "none":
            return None
        
        match = re.search(r'(\d+(?:\.\d+)?)\s*(hours?|days?|hrs?|d)', duration_str)
        if match:
            quantity = float(match.group(1))
            unit_str = match.group(2).lower()
            
            if "hour" in unit_str or "hr" in unit_str:
                unit = "hours"
            elif "day" in unit_str or unit_str == "d":
                unit = "days"
            else:
                return None
            
            return Duration(quantity=quantity, unit=unit)
        
        week_match = re.search(r'(\d+(?:\.\d+)?)\s*weeks?', duration_str)
        if week_match:
            quantity = float(week_match.group(1)) * 7
            return Duration(quantity=quantity, unit="days")
    
    return None


def generate_short_task_name(description: str) -> str:
    """
    Use AI to generate a short, concise task name from a description.
    Returns a 2-5 word title.
    """
    try:
        prompt = f"""Given this task description, generate a short, concise task name/title (2-5 words maximum).

Task Description: {description}

Requirements:
- Return ONLY the task name/title, nothing else
- Should be 2-5 words
- Should be clear and actionable
- No punctuation at the end
- Just the title, no explanation

Task Name:"""
        
        model = genai.GenerativeModel("gemini-flash-latest")
        response = model.generate_content(prompt)
        task_name = response.text.strip()
        
        task_name = task_name.strip('"\'.,;:')
        task_name = task_name.strip()
        
        if len(task_name) > 60:
            task_name = task_name[:60].rsplit(' ', 1)[0]
        
        if not task_name or len(task_name) > 60:
            words = description.split()[:5]
            task_name = ' '.join(words)
        
        return task_name
    
    except Exception as e:
        print(f"Error generating task name: {e}")
        words = description.split()[:5]
        return ' '.join(words)


def generate_tasks(event: str, event_info: str) -> List[TaskItem]:
    """
    Generate optimal task list using Gemini AI.
    This is the core function that implements the KSR.
    """
    try:
        prompt = create_optimized_prompt(event, event_info)
        
        model = genai.GenerativeModel("gemini-flash-latest")
        response = model.generate_content(prompt)
        response_text = response.text
        
        print(f"Gemini response preview: {response_text[:500]}...")
        
        tasks_data = parse_tasks_from_response(response_text)
        
        if not tasks_data:
            raise ValueError("No tasks were parsed from the response")
        
        task_items = []
        for idx, task_data in enumerate(tasks_data):
            try:
                if isinstance(task_data, dict):
                    task_text = task_data.get("task", "").strip()
                    description = task_data.get("description", "").strip()
                    
                    if not task_text and description:
                        task_text = description
                    
                    if not description and task_text:
                        description = task_text
                    
                    if not task_text or task_text.startswith("Parsing Error"):
                        continue
                    
                    if (task_text == description or 
                        len(task_text) > 60 or 
                        task_text.count(' ') > 8):
                        print(f"Generating short task name for task {idx + 1}...")
                        task_text = generate_short_task_name(description)
                    
                    if not description:
                        description = task_text
                    
                    duration_data = task_data.get("estimated_duration")
                    parsed_duration = parse_duration(duration_data)
                    
                    task_item = TaskItem(
                        task=task_text,
                        description=description,
                        priority=task_data.get("priority", "medium").lower(),
                        estimated_duration=parsed_duration
                    )
                    task_items.append(task_item)
            except Exception as e:
                print(f"Error processing task {idx}: {e}")
                continue
        
        if not task_items:
            raise ValueError("No valid tasks were extracted from the response")
        
        return task_items
    
    except Exception as e:
        print(f"Error in generate_tasks: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating tasks: {str(e)}"
        )


def create_scheduling_prompt(event_name: str, event_info: str, event_start_date: str, event_end_date: str, tasks: List[dict], members: List[dict]) -> str:
    """
    Create a prompt for AI to generate an optimal schedule.
    """
    members_info = []
    for member in members:
        member_str = f"- {member.get('firstName', '')} {member.get('lastName', '')} {member.get('name', '')} ({member.get('type', 'person')})"
        if member.get('specializedIn'):
            member_str += f", Specialized in: {member['specializedIn']}"
        if member.get('experience'):
            member_str += f", Experience: {member['experience']} years"
        members_info.append(member_str)
    
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
    
    prompt = f"""You are an expert project scheduler. Your task is to create an optimal schedule for an event by assigning tasks to the most suitable team members based on their expertise and experience.

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

Required JSON format (copy this exact structure):
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
- Start with [ and end with ]
- Each scheduled task must have: task_title, priority, duration (object with quantity and unit), owners (array of objects with id, type, name), start_date_time (ISO format), end_date_time (ISO format), order (integer starting from 1)
- Assign tasks to members based on their specialization and experience
- Schedule all tasks within the event date range
- Ensure start_date_time is before end_date_time
- Order tasks logically (consider dependencies and priorities)
- Owners array should contain one or more members suitable for the task
- Use ISO 8601 format for dates: YYYY-MM-DDTHH:MM:SS

Your response must be valid JSON that can be parsed directly with json.loads(). Do not wrap it in markdown code blocks."""
    
    return prompt


def generate_schedule(event_name: str, event_info: str, event_start_date: str, event_end_date: str, tasks: List[dict], members: List[dict]) -> List[ScheduledTask]:
    """
    Generate optimal schedule using Gemini AI.
    """
    try:
        prompt = create_scheduling_prompt(event_name, event_info, event_start_date, event_end_date, tasks, members)
        
        model = genai.GenerativeModel("gemini-flash-latest")
        response = model.generate_content(prompt)
        response_text = response.text
        
        print(f"AI Scheduling response preview: {response_text[:500]}...")
        
        scheduled_tasks_data = parse_tasks_from_response(response_text)
        
        if not scheduled_tasks_data:
            raise ValueError("No scheduled tasks were parsed from the response")
        
        scheduled_tasks = []
        for idx, task_data in enumerate(scheduled_tasks_data):
            try:
                if isinstance(task_data, dict):
                    duration_data = task_data.get("duration")
                    parsed_duration = parse_duration(duration_data) if duration_data else None
                    
                    if not parsed_duration:
                        parsed_duration = Duration(quantity=1, unit="hours")
                    
                    scheduled_task = ScheduledTask(
                        task_title=task_data.get("task_title", task_data.get("task", "")),
                        priority=task_data.get("priority", "medium").lower(),
                        duration=parsed_duration,
                        owners=task_data.get("owners", []),
                        start_date_time=task_data.get("start_date_time", ""),
                        end_date_time=task_data.get("end_date_time", ""),
                        order=task_data.get("order", idx + 1)
                    )
                    scheduled_tasks.append(scheduled_task)
            except Exception as e:
                print(f"Error processing scheduled task {idx}: {e}")
                continue
        
        if not scheduled_tasks:
            raise ValueError("No valid scheduled tasks were extracted from the response")
        
        scheduled_tasks.sort(key=lambda x: x.order)
        
        return scheduled_tasks
    
    except Exception as e:
        print(f"Error in generate_schedule: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating schedule: {str(e)}"
        )


# API Endpoints
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "AI Service (LLM Service)",
        "version": "1.0.0",
        "endpoints": {
            "POST /generate-tasks": "Generate optimal task list for an event",
            "POST /generate-schedule": "Generate AI-powered schedule for tasks and members",
            "POST /generate-task-name": "Generate short task name from description",
            "GET /health": "Health check endpoint"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        initialize_gemini()
        return {
            "status": "healthy",
            "service": "ai-service",
            "gemini_configured": True
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "ai-service",
            "gemini_configured": False,
            "error": str(e)
        }


@app.post("/generate-tasks", response_model=TaskResponse)
async def generate_event_tasks(request: EventRequest):
    """
    Generate optimal task list for an event.
    
    This endpoint combines the event and event_info into an optimized AI prompt
    and returns a structured list of tasks to accomplish the event.
    """
    try:
        if not request.event or not request.event_info:
            raise HTTPException(
                status_code=400,
                detail="Both 'event' and 'event_info' are required"
            )
        
        tasks = generate_tasks(request.event, request.event_info)
        
        if not tasks:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate tasks. Please try again."
            )
        
        return TaskResponse(
            event=request.event,
            tasks=tasks,
            total_tasks=len(tasks)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.post("/generate-schedule", response_model=ScheduleResponse)
async def generate_event_schedule(request: ScheduleRequest):
    """
    Generate optimal schedule for tasks and members using AI.
    """
    try:
        if not request.tasks:
            raise HTTPException(status_code=400, detail="No tasks provided")
        
        if not request.members:
            raise HTTPException(status_code=400, detail="No members provided")
        
        scheduled_tasks = generate_schedule(
            event_name=request.event_name,
            event_info=request.event_info or "",
            event_start_date=request.event_start_date or "",
            event_end_date=request.event_end_date or "",
            tasks=request.tasks,
            members=request.members
        )
        
        return ScheduleResponse(scheduled_tasks=scheduled_tasks)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in generate_event_schedule: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.post("/generate-task-name", response_model=TaskNameResponse)
async def generate_task_name(request: TaskNameRequest):
    """
    Generate a short, concise task name from a description.
    """
    try:
        if not request.description:
            raise HTTPException(
                status_code=400,
                detail="Description is required"
            )
        
        task_name = generate_short_task_name(request.description)
        
        return TaskNameResponse(task_name=task_name)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)  # Different port from main API

