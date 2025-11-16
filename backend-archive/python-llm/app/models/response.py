"""
Response models for LLM service.
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any


class TaskItem(BaseModel):
    """Individual task item model."""
    task: str = Field(..., description="The task name/title")
    description: str = Field(..., description="Detailed description of the task")
    priority: str = Field(..., description="Task priority: high, medium, or low")
    estimated_duration: Optional[Dict[str, Any]] = Field(None, description="Estimated duration")


class TaskGenerationResponse(BaseModel):
    """Response model for task generation."""
    event: str = Field(..., description="The event name")
    tasks: List[TaskItem] = Field(..., description="List of optimal tasks")
    total_tasks: int = Field(..., description="Total number of tasks")


class ScheduledTask(BaseModel):
    """Model for a scheduled task."""
    task_title: str = Field(..., description="Task title")
    priority: str = Field(..., description="Task priority")
    duration: Dict[str, Any] = Field(..., description="Task duration")
    owners: List[Dict[str, Any]] = Field(..., description="Task owners")
    start_date_time: str = Field(..., description="Start date and time (ISO format)")
    end_date_time: str = Field(..., description="End date and time (ISO format)")
    order: int = Field(..., description="Task order")


class ScheduleGenerationResponse(BaseModel):
    """Response model for schedule generation."""
    scheduled_tasks: List[ScheduledTask] = Field(..., description="List of scheduled tasks")

