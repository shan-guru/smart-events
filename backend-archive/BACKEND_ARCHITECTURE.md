# Backend Architecture Documentation

## Overview

The Event Management System backend is built using a **microservices architecture** with two main services:

1. **Java API Service** - Main REST API for event, member, task, and schedule management
2. **Python LLM Service** - AI-powered service for task generation and scheduling using Google Gemini

Both services are designed to be **AWS Lambda-ready** for serverless deployment.

## Architecture Diagram

```
┌─────────────────┐
│  React Frontend │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────────────┐
│  Java Spring Boot API   │  ← Main API (Port 8080)
│  - Event Management     │
│  - Member Management    │
│  - Task Management      │
│  - Schedule Management  │
└────────┬────────────────┘
         │ HTTP/REST
         │ PostgreSQL
         ▼
┌─────────────────────────┐
│  PostgreSQL Database     │  ← RDS (Production)
│  - events               │
│  - members              │
│  - tasks                │
│  - schedules            │
└─────────────────────────┘

┌─────────────────────────┐
│  Python FastAPI Service │  ← LLM Service (Port 8001)
│  - Gemini AI Integration│
│  - Task Generation      │
│  - Schedule Generation  │
└─────────────────────────┘
```

## Technology Stack

### Java API Service

- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Build Tool**: Maven
- **ORM**: Spring Data JPA / Hibernate
- **Database**: PostgreSQL 12+
- **Migrations**: Flyway
- **HTTP Client**: Spring WebFlux (WebClient)
- **Connection Pool**: HikariCP
- **Validation**: Jakarta Validation (Bean Validation)

### Python LLM Service

- **Framework**: FastAPI 0.104+
- **Language**: Python 3.11+
- **AI Integration**: Google Generative AI (Gemini)
- **HTTP Server**: Uvicorn
- **Validation**: Pydantic 2.0+
- **Lambda Handler**: Mangum

### Database

- **Type**: PostgreSQL
- **Features Used**:
  - JSONB for flexible data storage
  - Foreign keys with CASCADE deletes
  - Indexes for performance optimization
  - Connection pooling (HikariCP)

## Directory Structure

```
backend/
├── java-api/                          # Main API (Java/Spring Boot)
│   ├── src/main/java/
│   │   └── com/eventmanagement/
│   │       ├── EventManagementApplication.java
│   │       │
│   │       ├── api/                   # Presentation Layer
│   │       │   ├── controllers/       # REST controllers
│   │       │   │   ├── EventController.java
│   │       │   │   ├── TaskController.java
│   │       │   │   ├── MemberController.java
│   │       │   │   └── ScheduleController.java
│   │       │   ├── dto/               # Request/Response DTOs
│   │       │   │   ├── request/
│   │       │   │   │   ├── CreateEventRequest.java
│   │       │   │   │   ├── UpdateEventRequest.java
│   │       │   │   │   ├── CreateMemberRequest.java
│   │       │   │   │   ├── GenerateTasksRequest.java
│   │       │   │   │   └── GenerateScheduleRequest.java
│   │       │   │   └── response/
│   │       │   │       ├── EventResponse.java
│   │       │   │       ├── MemberResponse.java
│   │       │   │       ├── TaskResponse.java
│   │       │   │       └── ApiResponse.java
│   │       │   └── exceptions/        # Exception handlers
│   │       │       └── GlobalExceptionHandler.java
│   │       │
│   │       ├── service/               # Business Logic Layer
│   │       │   ├── EventService.java
│   │       │   ├── TaskService.java
│   │       │   ├── MemberService.java
│   │       │   ├── ScheduleService.java
│   │       │   └── LLMServiceClient.java  # HTTP client for Python LLM service
│   │       │
│   │       ├── repository/            # Data Access Layer
│   │       │   ├── EventRepository.java
│   │       │   ├── TaskRepository.java
│   │       │   ├── MemberRepository.java
│   │       │   └── ScheduleRepository.java
│   │       │
│   │       ├── model/                 # Data Models
│   │       │   ├── entity/            # JPA entities
│   │       │   │   ├── Event.java
│   │       │   │   ├── Task.java
│   │       │   │   ├── Member.java
│   │       │   │   └── Schedule.java
│   │       │   └── enums/             # Enums
│   │       │       ├── EventStatus.java
│   │       │       ├── Priority.java
│   │       │       └── MemberType.java
│   │       │
│   │       ├── config/                # Configuration
│   │       │   ├── DatabaseConfig.java
│   │       │   ├── WebConfig.java
│   │       │   ├── LLMServiceConfig.java
│   │       │   └── WebClientConfig.java
│   │       │
│   │       └── util/                  # Utilities
│   │           └── exceptions/
│   │               ├── ResourceNotFoundException.java
│   │               └── ResourceAlreadyExistsException.java
│   │
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── application-dev.properties
│   │   ├── application-prod.properties
│   │   └── db/migration/              # Flyway migrations
│   │       ├── V1__Create_events_table.sql
│   │       ├── V2__Create_members_table.sql
│   │       ├── V3__Create_tasks_table.sql
│   │       └── V4__Create_schedules_table.sql
│   │
│   ├── src/test/java/                 # Tests
│   ├── pom.xml                        # Maven dependencies
│   └── template.yaml                  # SAM template for Lambda
│
└── python-llm/                        # LLM Service (Python)
    ├── app/
    │   ├── __init__.py
    │   ├── main.py                    # FastAPI app
    │   ├── config.py                   # Configuration
    │   │
    │   ├── api/                       # API routes
    │   │   ├── __init__.py
    │   │   └── routes/
    │   │       ├── __init__.py
    │   │       ├── task_generation.py
    │   │       └── schedule_generation.py
    │   │
    │   ├── services/                  # Business logic
    │   │   ├── __init__.py
    │   │   └── gemini_service.py      # Gemini AI integration
    │   │
    │   └── models/                    # Pydantic models
    │       ├── __init__.py
    │       ├── request.py
    │       └── response.py
    │
    ├── requirements.txt
    ├── lambda_function.py             # Lambda handler wrapper
    └── template.yaml                   # SAM template for Lambda
```

## Layered Architecture

The Java API follows a **3-tier layered architecture**:

### 1. Presentation Layer (`api/`)

**Purpose**: Handle HTTP requests and responses

**Components**:
- **Controllers**: REST endpoints that receive HTTP requests
- **DTOs**: Data Transfer Objects for request/response validation
- **Exception Handlers**: Global exception handling and error formatting

**Responsibilities**:
- Request validation using Jakarta Validation
- HTTP status code management
- Response formatting
- Input sanitization

### 2. Business Logic Layer (`service/`)

**Purpose**: Implement business rules and orchestrate operations

**Components**:
- **Services**: Business logic for each domain (Event, Member, Task, Schedule)
- **LLMServiceClient**: HTTP client to communicate with Python LLM service

**Responsibilities**:
- Business rule enforcement
- Data transformation
- Orchestration of multiple operations
- Integration with external services (LLM service)
- Transaction management

### 3. Data Access Layer (`repository/`)

**Purpose**: Database operations

**Components**:
- **Repositories**: Spring Data JPA repositories for database operations
- **Entities**: JPA entities representing database tables

**Responsibilities**:
- CRUD operations
- Query building
- Transaction management
- No business logic

## Database Schema

### Tables

#### 1. `events`
- `id` (BIGSERIAL PRIMARY KEY)
- `event_name` (VARCHAR(255))
- `event_info` (TEXT)
- `start_date` (VARCHAR(50))
- `end_date` (VARCHAR(50))
- `event_date` (VARCHAR(50))
- `status` (VARCHAR(20)) - Enum: UPCOMING, IN_PROGRESS, COMPLETED, CLOSED
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Indexes**: `status`, `event_name`, `created_at`

#### 2. `members`
- `id` (BIGSERIAL PRIMARY KEY)
- `type` (VARCHAR(20)) - Enum: PERSON, ENTITY
- `first_name` (VARCHAR(100)) - For PERSON type
- `last_name` (VARCHAR(100)) - For PERSON type
- `name` (VARCHAR(255)) - For ENTITY type
- `email` (VARCHAR(255) UNIQUE)
- `phone` (VARCHAR(50))
- `whatsapp` (VARCHAR(50))
- `specialized_in` (VARCHAR(255))
- `experience` (VARCHAR(50))
- `address` (TEXT)
- `offline` (BOOLEAN) - For ENTITY type
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Indexes**: `type`, `email`, `created_at`

#### 3. `tasks`
- `id` (BIGSERIAL PRIMARY KEY)
- `event_id` (BIGINT) - Foreign Key to `events`
- `task_title` (VARCHAR(255))
- `description` (TEXT)
- `priority` (VARCHAR(20)) - Enum: HIGH, MEDIUM, LOW
- `duration_quantity` (DOUBLE PRECISION)
- `duration_unit` (VARCHAR(20))
- `owners` (JSONB) - Flexible JSON storage for owner assignments
- `start_date_time` (VARCHAR(100))
- `end_date_time` (VARCHAR(100))
- `order_index` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Indexes**: `event_id`, `priority`, `order_index`
**Foreign Keys**: `event_id` → `events(id)` ON DELETE CASCADE

#### 4. `schedules`
- `id` (BIGSERIAL PRIMARY KEY)
- `event_id` (BIGINT) - Foreign Key to `events`
- `task_id` (BIGINT) - Foreign Key to `tasks`
- `member_id` (BIGINT) - Foreign Key to `members`
- `start_date_time` (VARCHAR(100))
- `end_date_time` (VARCHAR(100))
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Indexes**: `event_id`, `task_id`, `member_id`, `start_date_time`
**Foreign Keys**: 
- `event_id` → `events(id)` ON DELETE CASCADE
- `task_id` → `tasks(id)` ON DELETE CASCADE
- `member_id` → `members(id)` ON DELETE CASCADE

## API Endpoints

### Java API (Port 8080)

#### Events
- `GET /api/v1/events` - Get all events (optional `status` query param)
- `POST /api/v1/events` - Create new event
- `GET /api/v1/events/{id}` - Get event by ID
- `PUT /api/v1/events/{id}` - Update event
- `DELETE /api/v1/events/{id}` - Delete event
- `PATCH /api/v1/events/{id}/close` - Mark event as closed

#### Members
- `GET /api/v1/members` - Get all members (optional `type` query param)
- `POST /api/v1/members` - Create new member
- `GET /api/v1/members/{id}` - Get member by ID
- `DELETE /api/v1/members/{id}` - Delete member

#### Tasks
- `GET /api/v1/events/{eventId}/tasks` - Get all tasks for an event
- `POST /api/v1/events/{eventId}/tasks/generate` - Generate tasks using AI
- `DELETE /api/v1/events/{eventId}/tasks/{id}` - Delete task

#### Schedules
- `GET /api/v1/events/{eventId}/schedules` - Get all schedules for an event
- `POST /api/v1/events/{eventId}/schedules/generate` - Generate schedule using AI
- `DELETE /api/v1/events/{eventId}/schedules/{id}` - Delete schedule

### Python LLM Service (Port 8001)

#### Task Generation
- `POST /api/v1/generate-tasks` - Generate optimal task list for an event
  - Request Body:
    ```json
    {
      "event": "Product Launch",
      "event_info": "Launching a new mobile app in Q2 2024"
    }
    ```
  - Response:
    ```json
    {
      "event": "Product Launch",
      "tasks": [
        {
          "task": "Define product positioning",
          "description": "Research and define the product positioning strategy",
          "priority": "high",
          "estimated_duration": {
            "quantity": 2.5,
            "unit": "days"
          }
        }
      ],
      "total_tasks": 10
    }
    ```

#### Schedule Generation
- `POST /api/v1/generate-schedule` - Generate optimal schedule for tasks and members
  - Request Body:
    ```json
    {
      "event_name": "Product Launch",
      "event_info": "Launching a new mobile app",
      "event_start_date": "2024-01-15",
      "event_end_date": "2024-01-20",
      "tasks": [...],
      "members": [...]
    }
    ```
  - Response:
    ```json
    {
      "scheduled_tasks": [
        {
          "task_title": "Define product positioning",
          "priority": "high",
          "duration": {
            "quantity": 2,
            "unit": "days"
          },
          "owners": [
            {
              "id": 1,
              "type": "person",
              "name": "John Doe"
            }
          ],
          "start_date_time": "2024-01-15T09:00:00",
          "end_date_time": "2024-01-17T17:00:00",
          "order": 1
        }
      ]
    }
    ```

#### Health Check
- `GET /health` - Service health check
- `GET /` - API information

## Service Communication

### Java API → Python LLM Service

**Communication Method**: HTTP REST calls using Spring WebFlux WebClient

**Configuration**:
- Endpoint: Configurable via `llm.service.url` property
- Timeout: Configurable via `llm.service.timeout` property
- Retry Logic: Automatic retry on 5xx errors (2 retries with exponential backoff)

**Flow**:
1. Java API receives request for task/schedule generation
2. Service layer calls `LLMServiceClient`
3. WebClient makes HTTP POST request to Python LLM service
4. Python service processes request using Gemini AI
5. Response is parsed and returned to Java API
6. Java API saves results to database

## Configuration Management

### Environment-Based Configuration

#### Development (`application-dev.properties`)
- Database: Local PostgreSQL instance
- LLM Service: `http://localhost:8001`
- Logging: DEBUG level
- JPA: `ddl-auto=update` (for development flexibility)

#### Production (`application-prod.properties`)
- Database: RDS PostgreSQL (via environment variables)
- LLM Service: Lambda function URL (via environment variables)
- Logging: INFO level
- JPA: `ddl-auto=validate` (strict validation)
- Connection Pool: Optimized for RDS Proxy

### Environment Variables

**Java API**:
- `DB_URL` - PostgreSQL connection URL
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `LLM_SERVICE_URL` - Python LLM service URL

**Python LLM Service**:
- `GEMINI_API_KEY` - Google Gemini API key
- `GEMINI_MODEL` - Gemini model name (default: `gemini-flash-latest`)
- `HOST` - Server host (default: `0.0.0.0`)
- `PORT` - Server port (default: `8001`)

## Database Migrations

**Tool**: Flyway

**Location**: `java-api/src/main/resources/db/migration/`

**Migrations**:
1. `V1__Create_events_table.sql` - Creates events table
2. `V2__Create_members_table.sql` - Creates members table
3. `V3__Create_tasks_table.sql` - Creates tasks table with JSONB support
4. `V4__Create_schedules_table.sql` - Creates schedules table

**Execution**: Automatic on application startup

## Exception Handling

### Custom Exceptions

1. **ResourceNotFoundException**: When a requested resource doesn't exist
2. **ResourceAlreadyExistsException**: When trying to create a duplicate resource

### Global Exception Handler

`GlobalExceptionHandler` catches and formats all exceptions:
- **404**: Resource not found
- **409**: Resource already exists
- **400**: Validation errors (with field-level details)
- **500**: Internal server errors

### Response Format

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

Validation errors include field-level details:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "email": "Email must be valid",
    "eventName": "Event name is required"
  }
}
```

## Lambda Deployment Architecture

### Design Principles

1. **Stateless**: No session storage, all state in database
2. **Externalized Configuration**: All config via environment variables
3. **Connection Pooling**: RDS Proxy compatible (HikariCP)
4. **Modular Handlers**: Easy to split into separate Lambda functions
5. **Cold Start Optimization**: Minimal dependencies, efficient initialization

### Deployment Strategy

#### Java API Lambda

**Handler**: Spring Cloud Function (to be implemented)
**Runtime**: Java 17
**Memory**: 512 MB (configurable)
**Timeout**: 30 seconds
**VPC**: Required for RDS access
**Environment Variables**: Database credentials, LLM service URL

#### Python LLM Service Lambda

**Handler**: `lambda_function.lambda_handler`
**Runtime**: Python 3.11
**Memory**: 512 MB (configurable)
**Timeout**: 60 seconds (for AI processing)
**Environment Variables**: Gemini API key

### SAM Templates

Both services include SAM templates (`template.yaml`) for:
- Lambda function definition
- API Gateway configuration
- Environment variables
- IAM roles
- VPC configuration (for Java API)

## Security Considerations

1. **Database Security**:
   - Credentials stored in environment variables (AWS Secrets Manager in production)
   - Connection pooling with RDS Proxy
   - SSL/TLS for database connections

2. **API Security**:
   - CORS configuration for frontend access
   - Input validation on all endpoints
   - SQL injection prevention (JPA parameterized queries)

3. **LLM Service Security**:
   - API key stored in environment variables
   - Rate limiting (to be implemented)
   - Input sanitization

## Performance Optimization

1. **Database**:
   - Indexes on frequently queried columns
   - Connection pooling (HikariCP)
   - JSONB for flexible data (efficient queries)

2. **API**:
   - Async HTTP client (WebClient) for LLM service calls
   - Response caching (to be implemented)
   - Pagination for large datasets (to be implemented)

3. **Lambda**:
   - Provisioned concurrency for critical functions
   - GraalVM Native Image (future optimization)
   - Efficient dependency management

## Testing Strategy

### Unit Tests
- Service layer business logic
- Repository layer data access
- Utility functions

### Integration Tests
- API endpoint testing
- Database integration
- LLM service integration

### Test Structure
```
src/test/java/
├── service/
│   ├── EventServiceTest.java
│   ├── TaskServiceTest.java
│   └── ...
├── repository/
│   ├── EventRepositoryTest.java
│   └── ...
└── api/
    └── controllers/
        ├── EventControllerTest.java
        └── ...
```

## Future Enhancements

1. **Authentication & Authorization**:
   - JWT-based authentication
   - Role-based access control (RBAC)

2. **Caching**:
   - Redis for frequently accessed data
   - Response caching for LLM results

3. **Monitoring & Logging**:
   - CloudWatch integration
   - Distributed tracing (AWS X-Ray)
   - Structured logging

4. **API Gateway**:
   - Rate limiting
   - Request/response transformation
   - API versioning

5. **Message Queue**:
   - SQS for async task processing
   - Event-driven architecture

6. **Optimization**:
   - GraalVM Native Image for faster cold starts
   - Connection pooling optimization
   - Query optimization

## Development Workflow

1. **Local Development**:
   - Run PostgreSQL locally (Docker recommended)
   - Start Java API on port 8080
   - Start Python LLM service on port 8001
   - Use `application-dev.properties` for configuration

2. **Database Changes**:
   - Create new Flyway migration script
   - Follow naming convention: `V{version}__{description}.sql`
   - Test migration locally before committing

3. **API Changes**:
   - Update entity models
   - Update DTOs
   - Update services
   - Update controllers
   - Add/update tests

4. **Deployment**:
   - Build JAR: `mvn clean package`
   - Build Python package: `pip install -r requirements.txt -t .`
   - Deploy using SAM: `sam build && sam deploy`

## Dependencies

### Java API (Maven)

**Core**:
- Spring Boot 3.2.0
- Spring Data JPA
- Spring WebFlux
- PostgreSQL Driver
- HikariCP
- Flyway
- Lombok
- Jackson

**Testing**:
- Spring Boot Test
- JUnit
- Mockito

### Python LLM Service (pip)

**Core**:
- FastAPI 0.104+
- Uvicorn
- Pydantic 2.0+
- Google Generative AI SDK
- Mangum (for Lambda)

**Utilities**:
- python-dotenv
- requests

## Conclusion

This architecture provides:
- **Separation of Concerns**: Clear layer boundaries
- **Scalability**: Lambda-ready for serverless deployment
- **Maintainability**: Well-organized code structure
- **Flexibility**: Easy to extend and modify
- **Performance**: Optimized database queries and connection pooling
- **Reliability**: Exception handling and validation
- **Portability**: Easy to deploy to AWS Lambda or traditional servers

The microservices approach allows independent scaling and deployment of the Java API and Python LLM service, while maintaining clear communication patterns and data consistency.

