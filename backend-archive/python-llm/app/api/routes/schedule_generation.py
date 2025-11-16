"""
Schedule generation API routes.
"""
from fastapi import APIRouter, HTTPException
from app.models.request import GenerateScheduleRequest
from app.models.response import ScheduleGenerationResponse, ScheduledTask
from app.services.gemini_service import get_gemini_service

router = APIRouter()


@router.post("/generate-schedule", response_model=ScheduleGenerationResponse)
async def generate_schedule(request: GenerateScheduleRequest):
    """
    Generate optimal schedule for tasks and members using AI.
    
    This endpoint uses Gemini AI to create an optimal schedule by assigning
    tasks to the most suitable team members based on their expertise.
    """
    try:
        if not request.tasks:
            raise HTTPException(status_code=400, detail="No tasks provided")
        
        if not request.members:
            raise HTTPException(status_code=400, detail="No members provided")
        
        gemini_service = get_gemini_service()
        scheduled_tasks_data = gemini_service.generate_schedule(
            event_name=request.event_name,
            event_info=request.event_info or "",
            event_start_date=request.event_start_date or "",
            event_end_date=request.event_end_date or "",
            tasks=request.tasks,
            members=request.members
        )
        
        # Convert to response model
        scheduled_tasks = [
            ScheduledTask(
                task_title=scheduled_task.get("task_title", ""),
                priority=scheduled_task.get("priority", "medium"),
                duration=scheduled_task.get("duration", {}),
                owners=scheduled_task.get("owners", []),
                start_date_time=scheduled_task.get("start_date_time", ""),
                end_date_time=scheduled_task.get("end_date_time", ""),
                order=scheduled_task.get("order", 0)
            )
            for scheduled_task in scheduled_tasks_data
        ]
        
        return ScheduleGenerationResponse(scheduled_tasks=scheduled_tasks)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating schedule: {str(e)}")

