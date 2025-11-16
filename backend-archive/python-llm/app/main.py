from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import task_generation, schedule_generation

# Validate configuration on startup
settings.validate()

# Initialize FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(task_generation.router, prefix="/api/v1", tags=["Task Generation"])
app.include_router(schedule_generation.router, prefix="/api/v1", tags=["Schedule Generation"])

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Event Management LLM Service",
        "version": settings.API_VERSION,
        "endpoints": {
            "POST /api/v1/generate-tasks": "Generate optimal task list for an event",
            "POST /api/v1/generate-schedule": "Generate optimal schedule for tasks and members"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "llm-service",
        "version": settings.API_VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)

