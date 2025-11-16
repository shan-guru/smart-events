# AI Service (LLM Service)

Isolated microservice for all LLM interactions using Google Gemini AI.

## Purpose

This service handles all AI/LLM operations for the event management application:
- Task generation from event details
- Schedule generation from tasks and members
- Task name generation from descriptions

## Setup

1. **Create and activate virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure API Key:**
   Create a `.env` file in the `ai-service` directory:
   ```bash
   echo "GEMINI_API_KEY=your_actual_api_key_here" > .env
   ```

## Running the Service

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Run the service
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --port 8001
```

The service will be available at `http://localhost:8001`

## API Endpoints

### Health Check
```bash
GET /health
```

### Generate Tasks
```bash
POST /generate-tasks
Content-Type: application/json

{
  "event": "Product Launch",
  "event_info": "Launching a new mobile app in Q2 2024"
}
```

### Generate Schedule
```bash
POST /generate-schedule
Content-Type: application/json

{
  "event_name": "Product Launch",
  "event_info": "Launching a new mobile app",
  "event_start_date": "2024-01-15",
  "event_end_date": "2024-01-20",
  "tasks": [...],
  "members": [...]
}
```

### Generate Task Name
```bash
POST /generate-task-name
Content-Type: application/json

{
  "description": "Research and define the product positioning strategy"
}
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## Architecture

This is a stateless microservice with no database. It:
- Receives requests from other services (Event Planning Service)
- Calls Google Gemini AI API
- Returns structured responses
- Can be scaled independently based on LLM request load

## Environment Variables

- `GEMINI_API_KEY`: Required. Your Google Gemini API key

## Port

Default port: **8001** (different from the main API service which uses 8000)

