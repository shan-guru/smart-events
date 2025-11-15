#!/usr/bin/env python3
"""
FastAPI application for generating optimal task lists from events using Gemini AI.
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
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from contextlib import contextmanager

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Event Task Generator API",
    description="API to generate optimal task lists for events using Gemini AI",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
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

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./events.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class EventWizardData(Base):
    __tablename__ = "event_wizard_data"
    
    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String, index=True)
    event_info = Column(Text)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    event_date = Column(String, nullable=True)
    tasks = Column(Text, default='[]')  # Store as JSON string
    assigned_members = Column(Text, default='[]')  # Store as JSON string
    current_step = Column(Integer, default=1)
    completed_steps = Column(Text, default='[]')  # Store as JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Database dependency
@contextmanager
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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
    # Find the first [ and last ] and try to parse
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
                # Try parsing as array
                tasks = json.loads(match)
                if isinstance(tasks, list) and len(tasks) > 0:
                    return tasks
                # Try parsing as single object and wrap in array
                if isinstance(tasks, dict) and "task" in tasks:
                    return [tasks]
            except (json.JSONDecodeError, ValueError):
                continue
    
    # Strategy 4: Try to clean and parse the entire response
    cleaned = response_text.strip()
    # Remove markdown code block markers
    cleaned = re.sub(r'```(?:json)?', '', cleaned)
    cleaned = re.sub(r'```', '', cleaned)
    cleaned = cleaned.strip()
    
    # Try to find and extract JSON array
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
        
        # Detect start of JSON array
        if '[' in stripped and not in_json:
            in_json = True
            bracket_count = stripped.count('[') - stripped.count(']')
            json_lines.append(stripped)
            continue
        
        if in_json:
            json_lines.append(stripped)
            bracket_count += stripped.count('[') - stripped.count(']')
            if bracket_count == 0:
                # Found complete JSON
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
                # Save previous task with description
                task_text = ' '.join(current_task_text)
                # Try to split into task title and description
                parts = task_text.split(':', 1)
                if len(parts) == 2:
                    current_task["task"] = parts[0].strip()
                    current_task["description"] = parts[1].strip()
                else:
                    # Use first 50 chars as task, rest as description
                    current_task["task"] = task_text[:50].strip()
                    current_task["description"] = task_text.strip()
                tasks.append(current_task)
            task_text = numbered_match.group(2)
            # Try to split into task and description
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
                # Save previous task with description
                task_text = ' '.join(current_task_text)
                # Try to split into task title and description
                parts = task_text.split(':', 1)
                if len(parts) == 2:
                    current_task["task"] = parts[0].strip()
                    current_task["description"] = parts[1].strip()
                else:
                    # Use first 50 chars as task, rest as description
                    current_task["task"] = task_text[:50].strip()
                    current_task["description"] = task_text.strip()
                tasks.append(current_task)
            task_text = bullet_match.group(1)
            # Try to split into task and description
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
                # Save previous task with description
                task_text = ' '.join(current_task_text)
                # Try to split into task title and description
                parts = task_text.split(':', 1)
                if len(parts) == 2:
                    current_task["task"] = parts[0].strip()
                    current_task["description"] = parts[1].strip()
                else:
                    # Use first 50 chars as task, rest as description
                    current_task["task"] = task_text[:50].strip()
                    current_task["description"] = task_text.strip()
                tasks.append(current_task)
            # Extract task text after keyword
            task_text = re.sub(r'^(task|action|step|item)[:\s]+', '', line, flags=re.IGNORECASE)
            # Try to split into task and description
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
            # Check if line contains priority info
            if re.search(r'\b(high|medium|low|priority)\b', line, re.IGNORECASE):
                if 'high' in line.lower():
                    current_task["priority"] = "high"
                elif 'low' in line.lower():
                    current_task["priority"] = "low"
                # Extract duration estimate if present
                time_match = re.search(r'(\d+\s*(?:days?|weeks?|hours?|months?))', line, re.IGNORECASE)
                if time_match:
                    current_task["estimated_duration"] = time_match.group(1)
            else:
                # It's a continuation of the task description
                current_task_text.append(line)
    
    # Add the last task
    if current_task and current_task_text:
        task_text = ' '.join(current_task_text)
        # Try to split into task title and description
        parts = task_text.split(':', 1)
        if len(parts) == 2:
            current_task["task"] = parts[0].strip()
            current_task["description"] = parts[1].strip()
        else:
            # Use first 50 chars as task, rest as description
            current_task["task"] = task_text[:50].strip()
            current_task["description"] = task_text.strip()
        tasks.append(current_task)
    
    # If we still have no tasks, try to extract any sentence-like structures
    if not tasks:
        # Split by common separators and create tasks
        sentences = re.split(r'[.!?]\s+', text)
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 10 and not sentence.startswith('#'):
                # Clean up the sentence
                sentence = re.sub(r'^\d+[\.\)]\s*', '', sentence)
                sentence = re.sub(r'^[-*•]\s*', '', sentence)
                if sentence:
                    tasks.append({
                        "task": sentence[:50],  # Short title
                        "description": sentence[:200],  # Full description
                        "priority": "medium",
                        "estimated_duration": None
                    })
    
    # Final fallback - return at least one task with the error message
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
    Handles:
    - Object with quantity and unit: {"quantity": 2, "unit": "days"}
    - String format: "2 days", "4 hours", "2-3 days", "1 week"
    - None or empty values
    """
    if not duration_data:
        return None
    
    # If it's already a dict/object with quantity and unit
    if isinstance(duration_data, dict):
        quantity = duration_data.get("quantity")
        unit = duration_data.get("unit", "").lower()
        
        # Validate unit
        if unit not in ["hours", "days"]:
            # Try to infer from common patterns
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
    
    # If it's a string, try to parse it
    if isinstance(duration_data, str):
        duration_str = duration_data.strip().lower()
        if not duration_str or duration_str == "null" or duration_str == "none":
            return None
        
        # Try to extract quantity and unit from string
        # Patterns: "2 days", "4 hours", "2-3 days", "1 week", etc.
        import re
        
        # Match patterns like "2 days", "4 hours", "1.5 days"
        match = re.search(r'(\d+(?:\.\d+)?)\s*(hours?|days?|hrs?|d)', duration_str)
        if match:
            quantity = float(match.group(1))
            unit_str = match.group(2).lower()
            
            # Normalize unit
            if "hour" in unit_str or "hr" in unit_str:
                unit = "hours"
            elif "day" in unit_str or unit_str == "d":
                unit = "days"
            else:
                return None
            
            return Duration(quantity=quantity, unit=unit)
        
        # Try "week" -> convert to days
        week_match = re.search(r'(\d+(?:\.\d+)?)\s*weeks?', duration_str)
        if week_match:
            quantity = float(week_match.group(1)) * 7  # Convert weeks to days
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
        
        # Clean up the response - remove quotes, periods, etc.
        task_name = task_name.strip('"\'.,;:')
        task_name = task_name.strip()
        
        # Limit to reasonable length (max 60 chars)
        if len(task_name) > 60:
            # Try to get first sentence or first 60 chars
            task_name = task_name[:60].rsplit(' ', 1)[0]
        
        # If still too long or empty, use first few words of description
        if not task_name or len(task_name) > 60:
            words = description.split()[:5]
            task_name = ' '.join(words)
        
        return task_name
    
    except Exception as e:
        print(f"Error generating task name: {e}")
        # Fallback: use first few words of description
        words = description.split()[:5]
        return ' '.join(words)


def generate_tasks(event: str, event_info: str) -> List[TaskItem]:
    """
    Generate optimal task list using Gemini AI.
    This is the core function that implements the KSR.
    """
    try:
        # Create optimized prompt
        prompt = create_optimized_prompt(event, event_info)
        
        # Get response from Gemini
        model = genai.GenerativeModel("gemini-flash-latest")
        response = model.generate_content(prompt)
        response_text = response.text
        
        # Log response for debugging (first 500 chars)
        print(f"Gemini response preview: {response_text[:500]}...")
        
        # Parse tasks from response
        tasks_data = parse_tasks_from_response(response_text)
        
        if not tasks_data:
            raise ValueError("No tasks were parsed from the response")
        
        # Convert to TaskItem objects and validate
        task_items = []
        for idx, task_data in enumerate(tasks_data):
            try:
                # Skip error messages that might have been parsed as tasks
                if isinstance(task_data, dict):
                    # Get task and description
                    task_text = task_data.get("task", "").strip()
                    description = task_data.get("description", "").strip()
                    
                    # If no task but we have description, use description as base
                    if not task_text and description:
                        task_text = description
                    
                    # If no description but we have task, use task as description
                    if not description and task_text:
                        description = task_text
                    
                    # Skip if still no valid content
                    if not task_text or task_text.startswith("Parsing Error"):
                        continue
                    
                    # If task and description are the same, or task is too long, generate a short task name
                    if (task_text == description or 
                        len(task_text) > 60 or 
                        task_text.count(' ') > 8):  # More than 8 words
                        print(f"Generating short task name for task {idx + 1}...")
                        task_text = generate_short_task_name(description)
                    
                    # Ensure we have a description (use task if description is missing)
                    if not description:
                        description = task_text
                    
                    # Parse duration
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


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Event Task Generator API",
        "version": "1.0.0",
        "endpoints": {
            "POST /generate-tasks": "Generate optimal task list for an event",
            "GET /health": "Health check endpoint",
            "POST /save-wizard": "Save wizard data",
            "GET /wizard/{event_name}": "Get wizard data by event name",
            "GET /wizards": "Get all saved wizards",
            "POST /generate-schedule": "Generate AI-powered schedule for tasks and members"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        initialize_gemini()
        return {
            "status": "healthy",
            "gemini_configured": True
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "gemini_configured": False,
            "error": str(e)
        }


@app.post("/generate-tasks", response_model=TaskResponse)
async def generate_event_tasks(request: EventRequest):
    """
    Generate optimal task list for an event.
    
    This endpoint combines the event and event_info into an optimized AI prompt
    and returns a structured list of tasks to accomplish the event.
    
    KSR: Arriving at the most optimal task list is the key success requirement.
    """
    try:
        # Validate input
        if not request.event or not request.event_info:
            raise HTTPException(
                status_code=400,
                detail="Both 'event' and 'event_info' are required"
            )
        
        # Generate tasks using Gemini
        tasks = generate_tasks(request.event, request.event_info)
        
        if not tasks:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate tasks. Please try again."
            )
        
        # Return response
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


# Wizard Data Models
class WizardDataRequest(BaseModel):
    """Request model for saving wizard data."""
    event_name: str
    event_info: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    event_date: Optional[str] = None
    tasks: Optional[List[dict]] = Field(default_factory=list)
    assigned_members: Optional[List[dict]] = Field(default_factory=list)
    current_step: Optional[int] = 1
    completed_steps: Optional[List[int]] = Field(default_factory=list)


class WizardDataResponse(BaseModel):
    """Response model for wizard data."""
    id: int
    event_name: str
    event_info: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    event_date: Optional[str] = None
    tasks: Optional[List[dict]] = Field(default_factory=list)
    assigned_members: Optional[List[dict]] = Field(default_factory=list)
    current_step: Optional[int] = 1
    completed_steps: Optional[List[int]] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


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


@app.post("/save-wizard", response_model=WizardDataResponse)
async def save_wizard_data(data: WizardDataRequest):
    """Save or update wizard data."""
    with get_db() as db:
        # Check if event with this name already exists
        existing = db.query(EventWizardData).filter(EventWizardData.event_name == data.event_name).first()
        
        if existing:
            # Update existing record
            existing.event_info = data.event_info
            existing.start_date = data.start_date
            existing.end_date = data.end_date
            existing.event_date = data.event_date
            existing.tasks = json.dumps(data.tasks or [])
            existing.assigned_members = json.dumps(data.assigned_members or [])
            existing.current_step = data.current_step or 1
            existing.completed_steps = json.dumps(data.completed_steps or [])
            existing.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing)
            # Convert JSON strings back to dicts for response
            return WizardDataResponse(
                id=existing.id,
                event_name=existing.event_name,
                event_info=existing.event_info,
                start_date=existing.start_date,
                end_date=existing.end_date,
                event_date=existing.event_date,
                tasks=json.loads(existing.tasks) if existing.tasks else [],
                assigned_members=json.loads(existing.assigned_members) if existing.assigned_members else [],
                current_step=existing.current_step,
                completed_steps=json.loads(existing.completed_steps) if existing.completed_steps else [],
                created_at=existing.created_at,
                updated_at=existing.updated_at
            )
        else:
            # Create new record
            new_data = EventWizardData(
                event_name=data.event_name,
                event_info=data.event_info,
                start_date=data.start_date,
                end_date=data.end_date,
                event_date=data.event_date,
                tasks=json.dumps(data.tasks or []),
                assigned_members=json.dumps(data.assigned_members or []),
                current_step=data.current_step or 1,
                completed_steps=json.dumps(data.completed_steps or [])
            )
            db.add(new_data)
            db.commit()
            db.refresh(new_data)
            # Convert JSON strings back to dicts for response
            return WizardDataResponse(
                id=new_data.id,
                event_name=new_data.event_name,
                event_info=new_data.event_info,
                start_date=new_data.start_date,
                end_date=new_data.end_date,
                event_date=new_data.event_date,
                tasks=json.loads(new_data.tasks) if new_data.tasks else [],
                assigned_members=json.loads(new_data.assigned_members) if new_data.assigned_members else [],
                current_step=new_data.current_step,
                completed_steps=json.loads(new_data.completed_steps) if new_data.completed_steps else [],
                created_at=new_data.created_at,
                updated_at=new_data.updated_at
            )


@app.get("/wizard/{event_name}", response_model=WizardDataResponse)
async def get_wizard_data(event_name: str):
    """Get wizard data by event name."""
    with get_db() as db:
        wizard_data = db.query(EventWizardData).filter(EventWizardData.event_name == event_name).first()
        if not wizard_data:
            raise HTTPException(status_code=404, detail="Wizard data not found")
        # Convert JSON strings back to dicts
        return WizardDataResponse(
            id=wizard_data.id,
            event_name=wizard_data.event_name,
            event_info=wizard_data.event_info,
            start_date=wizard_data.start_date,
            end_date=wizard_data.end_date,
            event_date=wizard_data.event_date,
            tasks=json.loads(wizard_data.tasks) if wizard_data.tasks else [],
            assigned_members=json.loads(wizard_data.assigned_members) if wizard_data.assigned_members else [],
            current_step=wizard_data.current_step,
            completed_steps=json.loads(wizard_data.completed_steps) if wizard_data.completed_steps else [],
            created_at=wizard_data.created_at,
            updated_at=wizard_data.updated_at
        )


@app.get("/wizards", response_model=List[WizardDataResponse])
async def get_all_wizards():
    """Get all saved wizard data."""
    with get_db() as db:
        wizards = db.query(EventWizardData).order_by(EventWizardData.updated_at.desc()).all()
        # Convert JSON strings back to dicts for each wizard
        result = []
        for wizard in wizards:
            result.append(WizardDataResponse(
                id=wizard.id,
                event_name=wizard.event_name,
                event_info=wizard.event_info,
                start_date=wizard.start_date,
                end_date=wizard.end_date,
                event_date=wizard.event_date,
                tasks=json.loads(wizard.tasks) if wizard.tasks else [],
                assigned_members=json.loads(wizard.assigned_members) if wizard.assigned_members else [],
                current_step=wizard.current_step,
                completed_steps=json.loads(wizard.completed_steps) if wizard.completed_steps else [],
                created_at=wizard.created_at,
                updated_at=wizard.updated_at
            ))
        return result


@app.delete("/wizard/{event_name}")
async def delete_wizard_data(event_name: str):
    """Delete wizard data by event name."""
    with get_db() as db:
        wizard_data = db.query(EventWizardData).filter(EventWizardData.event_name == event_name).first()
        if not wizard_data:
            raise HTTPException(status_code=404, detail="Wizard data not found")
        db.delete(wizard_data)
        db.commit()
        return {"message": "Wizard data deleted successfully"}


def create_scheduling_prompt(event_name: str, event_info: str, event_start_date: str, event_end_date: str, tasks: List[dict], members: List[dict]) -> str:
    """
    Create a prompt for AI to generate an optimal schedule.
    """
    # Format members with their experience
    members_info = []
    for member in members:
        member_str = f"- {member.get('firstName', '')} {member.get('lastName', '')} {member.get('name', '')} ({member.get('type', 'person')})"
        if member.get('specializedIn'):
            member_str += f", Specialized in: {member['specializedIn']}"
        if member.get('experience'):
            member_str += f", Experience: {member['experience']} years"
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
    }},
    {{
        "task_title": "Another task",
        "priority": "medium",
        "duration": {{
            "quantity": 1,
            "unit": "days"
        }},
        "owners": [
            {{
                "id": 1234567891,
                "type": "entity",
                "name": "Acme Corp"
            }}
        ],
        "start_date_time": "2024-01-15T14:00:00",
        "end_date_time": "2024-01-16T14:00:00",
        "order": 2
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
    Handles token constraints with chunking if needed.
    """
    try:
        prompt = create_scheduling_prompt(event_name, event_info, event_start_date, event_end_date, tasks, members)
        
        model = genai.GenerativeModel("gemini-flash-latest")
        response = model.generate_content(prompt)
        response_text = response.text
        
        print(f"AI Scheduling response preview: {response_text[:500]}...")
        
        # Parse the response using similar strategies as task parsing
        scheduled_tasks_data = parse_tasks_from_response(response_text)
        
        if not scheduled_tasks_data:
            raise ValueError("No scheduled tasks were parsed from the response")
        
        # Convert to ScheduledTask objects
        scheduled_tasks = []
        for idx, task_data in enumerate(scheduled_tasks_data):
            try:
                if isinstance(task_data, dict):
                    # Parse duration
                    duration_data = task_data.get("duration")
                    parsed_duration = parse_duration(duration_data) if duration_data else None
                    
                    if not parsed_duration:
                        # Fallback duration
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
        
        # Sort by order
        scheduled_tasks.sort(key=lambda x: x.order)
        
        return scheduled_tasks
    
    except Exception as e:
        print(f"Error in generate_schedule: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating schedule: {str(e)}"
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

