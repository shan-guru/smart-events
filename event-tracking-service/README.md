# Event Tracking Service

Spring Boot microservice for event tracking and status updates. Optimized for mobile applications.

## Purpose

This service handles:
- Event status tracking
- Task status updates (in-progress, completed, blocked)
- Real-time progress updates
- Mobile-optimized lightweight APIs
- Task completion tracking

## Technology Stack

- **Framework**: Spring Boot 3.2.0
- **Java**: 17
- **Database**: PostgreSQL (production), H2 (testing)
- **ORM**: JPA/Hibernate
- **API Documentation**: OpenAPI/Swagger

## Setup

### Prerequisites

- Java 17+
- Maven 3.6+
- PostgreSQL (for production)

### Database Setup

1. Create PostgreSQL database:
   ```sql
   CREATE DATABASE event_tracking_db;
   ```

2. Update `application.yml` with your database credentials:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/event_tracking_db
       username: your_username
       password: your_password
   ```

### Running the Service

```bash
# Build the project
mvn clean install

# Run the service
mvn spring-boot:run
```

The service will be available at `http://localhost:8081`

## API Endpoints

### Health Check
```bash
GET /health
```

### Event Status
```bash
GET /api/tracking/events/{eventId}/status
GET /api/tracking/events/{eventId}/progress
```

### Task Status
```bash
GET /api/tracking/tasks/{taskId}/status
PUT /api/tracking/tasks/{taskId}/status?eventId={eventId}
POST /api/tracking/tasks/{taskId}/complete
```

### My Tasks
```bash
GET /api/tracking/my-tasks?userId={userId}
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8081/swagger-ui.html
- **API Docs**: http://localhost:8081/api-docs

## Configuration

### Environment Variables

- `DB_USERNAME`: PostgreSQL username (default: postgres)
- `DB_PASSWORD`: PostgreSQL password (default: postgres)
- `PLANNING_SERVICE_URL`: Event Planning Service URL (default: http://localhost:8080)

### Application Properties

See `src/main/resources/application.yml` for all configuration options.

## Architecture

This service:
- Tracks task and event status in its own database
- Provides lightweight, mobile-optimized APIs
- Can query Event Planning Service for event/task data
- Calculates and maintains event progress
- Designed for high-frequency status updates from mobile clients

## Port

Default port: **8081**

