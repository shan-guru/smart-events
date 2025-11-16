# Microservices Architecture

This document describes the microservices architecture implementation for the event management application.

## Architecture Overview

The application has been split into the following microservices:

1. **AI Service (LLM Service)** - Python FastAPI service for all LLM interactions
2. **Event Planning Service** - Java Spring Boot service for desktop/web planning operations
3. **Event Tracking Service** - Java Spring Boot service for mobile tracking operations
4. **API Gateway** - Spring Cloud Gateway for routing and unified API access

## Service Details

### 1. AI Service (Port 8001)

**Technology**: Python FastAPI  
**Purpose**: Isolated service for all LLM interactions

**Endpoints**:
- `POST /generate-tasks` - Generate tasks from event details
- `POST /generate-schedule` - Generate schedule from tasks and members
- `POST /generate-task-name` - Generate short task name from description
- `GET /health` - Health check

**Location**: `ai-service/`

### 2. Event Planning Service (Port 8080)

**Technology**: Java Spring Boot 3.2.0  
**Purpose**: Desktop/web application backend

**Endpoints**:
- `POST /api/events/save-wizard` - Save wizard data
- `GET /api/events/wizard/{eventName}` - Get wizard data
- `GET /api/events/wizards` - Get all wizards
- `DELETE /api/events/wizard/{eventName}` - Delete wizard data
- `POST /api/events/generate-tasks` - Generate tasks (calls AI Service)
- `POST /api/schedules/generate` - Generate schedule (calls AI Service)
- `GET /health` - Health check

**Location**: `event-planning-service/`

### 3. Event Tracking Service (Port 8081)

**Technology**: Java Spring Boot 3.2.0  
**Purpose**: Mobile application backend

**Endpoints**:
- `GET /api/tracking/events/{eventId}/status` - Get event status
- `GET /api/tracking/events/{eventId}/progress` - Get event progress
- `GET /api/tracking/tasks/{taskId}/status` - Get task status
- `PUT /api/tracking/tasks/{taskId}/status` - Update task status
- `POST /api/tracking/tasks/{taskId}/complete` - Mark task complete
- `GET /api/tracking/my-tasks` - Get user's assigned tasks
- `GET /health` - Health check

**Location**: `event-tracking-service/`

### 4. API Gateway (Port 8082)

**Technology**: Spring Cloud Gateway  
**Purpose**: Single entry point for all services

**Routes**:
- `/api/ai/**` → AI Service
- `/api/planning/**`, `/api/events/**`, `/api/schedules/**` → Event Planning Service
- `/api/tracking/**` → Event Tracking Service
- `/health/ai`, `/health/planning`, `/health/tracking` → Service health checks

**Location**: `api-gateway/`

## Getting Started

### Prerequisites

- Python 3.11+ (for AI Service)
- Java 17+ (for Java services)
- Maven 3.6+ (for Java services)
- PostgreSQL (for Java services)

### Setup Steps

1. **Setup AI Service**:
   ```bash
   cd ai-service
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   # Create .env file with GEMINI_API_KEY
   python main.py
   ```

2. **Setup Event Planning Service**:
   ```bash
   cd event-planning-service
   # Create PostgreSQL database: event_planning_db
   mvn clean install
   mvn spring-boot:run
   ```

3. **Setup Event Tracking Service**:
   ```bash
   cd event-tracking-service
   # Create PostgreSQL database: event_tracking_db
   mvn clean install
   mvn spring-boot:run
   ```

4. **Setup API Gateway** (Optional):
   ```bash
   cd api-gateway
   mvn clean install
   mvn spring-boot:run
   ```

## Service Communication

### Synchronous (REST/HTTP)

- **Event Planning Service** → **AI Service**: Task/schedule generation requests
- **Event Tracking Service** → **Event Planning Service**: Read event/task data (future)
- **Frontend (Web)** → **Event Planning Service** or **API Gateway**: Planning operations
- **Frontend (Mobile)** → **Event Tracking Service** or **API Gateway**: Tracking operations

## Database Strategy

Each service has its own database:
- **Event Planning Service**: `event_planning_db` (PostgreSQL)
- **Event Tracking Service**: `event_tracking_db` (PostgreSQL)
- **AI Service**: Stateless (no database)

## Deployment

Each service can be deployed independently using Docker:

```bash
# Build and run each service
cd ai-service && docker build -t ai-service . && docker run -p 8001:8001 ai-service
cd event-planning-service && docker build -t planning-service . && docker run -p 8080:8080 planning-service
cd event-tracking-service && docker build -t tracking-service . && docker run -p 8081:8081 tracking-service
cd api-gateway && docker build -t api-gateway . && docker run -p 8082:8082 api-gateway
```

## Environment Variables

### AI Service
- `GEMINI_API_KEY`: Google Gemini API key

### Event Planning Service
- `DB_USERNAME`: PostgreSQL username (default: postgres)
- `DB_PASSWORD`: PostgreSQL password (default: postgres)
- `AI_SERVICE_URL`: AI Service URL (default: http://localhost:8001)

### Event Tracking Service
- `DB_USERNAME`: PostgreSQL username (default: postgres)
- `DB_PASSWORD`: PostgreSQL password (default: postgres)
- `PLANNING_SERVICE_URL`: Event Planning Service URL (default: http://localhost:8080)

## API Documentation

- **AI Service**: http://localhost:8001/docs
- **Event Planning Service**: http://localhost:8080/swagger-ui.html
- **Event Tracking Service**: http://localhost:8081/swagger-ui.html

## Migration from Monolithic

The original monolithic `api.py` has been split into:
- AI-related code → `ai-service/`
- Event/Task/Schedule CRUD → `event-planning-service/`
- Tracking functionality → `event-tracking-service/`

The frontend can be updated to call the new services directly or through the API Gateway.

