"""
Request models for LLM service.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class GenerateTasksRequest(BaseModel):
    """Request model for task generation."""
    event: str = Field(..., description="The event name or type")
    event_info: str = Field(..., description="Additional information about the event")


class GenerateScheduleRequest(BaseModel):
    """Request model for schedule generation."""
    event_name: str = Field(..., description="Event name")
    event_info: Optional[str] = Field(None, description="Event information")
    event_start_date: Optional[str] = Field(None, description="Event start date")
    event_end_date: Optional[str] = Field(None, description="Event end date")
    tasks: List[Dict[str, Any]] = Field(..., description="List of tasks")
    members: List[Dict[str, Any]] = Field(..., description="List of members")

