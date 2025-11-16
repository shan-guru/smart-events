# Event Management System Backend

This backend consists of two services:
1. **Java API** - Main REST API for event, member, task, and schedule management
2. **Python LLM Service** - AI service for task generation and scheduling using Gemini

## Architecture

- **Java API**: Spring Boot 3.x with PostgreSQL
- **Python LLM Service**: FastAPI with Gemini AI integration
- **Database**: PostgreSQL with Flyway migrations
- **Deployment**: AWS Lambda ready (SAM templates included)

## Prerequisites

- Java 17+
- Maven 3.8+
- Python 3.11+
- PostgreSQL 12+
- AWS SAM CLI (for Lambda deployment)

## Setup

### Java API

1. Navigate to `java-api/` directory
2. Update `application.properties` with your PostgreSQL connection details
3. Build the project:
   ```bash
   mvn clean install
   ```
4. Run the application:
   ```bash
   mvn spring-boot:run
   ```

The API will be available at `http://localhost:8080`

### Python LLM Service

1. Navigate to `python-llm/` directory
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file with:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
5. Run the service:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
   ```

The LLM service will be available at `http://localhost:8001`

## API Endpoints

### Java API (Port 8080)

- `GET /api/v1/events` - Get all events
- `POST /api/v1/events` - Create event
- `GET /api/v1/events/{id}` - Get event by ID
- `PUT /api/v1/events/{id}` - Update event
- `DELETE /api/v1/events/{id}` - Delete event
- `PATCH /api/v1/events/{id}/close` - Mark event as closed
- `GET /api/v1/members` - Get all members
- `POST /api/v1/members` - Create member
- `POST /api/v1/events/{eventId}/tasks/generate` - Generate tasks for event
- `POST /api/v1/events/{eventId}/schedules/generate` - Generate schedule

### Python LLM Service (Port 8001)

- `POST /api/v1/generate-tasks` - Generate tasks using AI
- `POST /api/v1/generate-schedule` - Generate schedule using AI
- `GET /health` - Health check

## Database Migrations

Flyway migrations are located in `java-api/src/main/resources/db/migration/`

Migrations run automatically on application startup.

## Lambda Deployment

### Deploy Java API

1. Build the JAR:
   ```bash
   cd java-api
   mvn clean package
   ```

2. Deploy using SAM:
   ```bash
   sam build
   sam deploy --guided
   ```

### Deploy Python LLM Service

1. Package the service:
   ```bash
   cd python-llm
   pip install -r requirements.txt -t .
   ```

2. Deploy using SAM:
   ```bash
   sam build
   sam deploy --guided
   ```

## Configuration

### Environment Variables

**Java API:**
- `DB_URL` - PostgreSQL connection URL
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `LLM_SERVICE_URL` - Python LLM service URL

**Python LLM Service:**
- `GEMINI_API_KEY` - Google Gemini API key
- `GEMINI_MODEL` - Gemini model name (default: gemini-flash-latest)

## Development

- Use `application-dev.properties` for development
- Use `application-prod.properties` for production (Lambda)
- CORS is configured for `http://localhost:3000` (React frontend)

