"""
Task generation API routes.
"""
from fastapi import APIRouter, HTTPException
from app.models.request import GenerateTasksRequest
from app.models.response import TaskGenerationResponse, TaskItem
from app.services.gemini_service import get_gemini_service

router = APIRouter()


@router.post("/generate-tasks", response_model=TaskGenerationResponse)
async def generate_tasks(request: GenerateTasksRequest):
    """
    Generate optimal task list for an event.
    
    This endpoint uses Gemini AI to generate a comprehensive list of tasks
    needed to successfully accomplish the event.
    """
    try:
        gemini_service = get_gemini_service()
        tasks_data = gemini_service.generate_tasks(request.event, request.event_info)
        
        # Convert to response model
        task_items = [
            TaskItem(
                task=task.get("task", ""),
                description=task.get("description", ""),
                priority=task.get("priority", "medium"),
                estimated_duration=task.get("estimated_duration")
            )
            for task in tasks_data
        ]
        
        return TaskGenerationResponse(
            event=request.event,
            tasks=task_items,
            total_tasks=len(task_items)
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating tasks: {str(e)}")

