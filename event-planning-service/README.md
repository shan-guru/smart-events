# Event Planning Service

Spring Boot microservice for event planning, task management, and scheduling. Designed for desktop/web applications.

## Purpose

This service handles:
- Event CRUD operations
- Event wizard data management
- Task management (CRUD)
- Schedule management (CRUD)
- Member/team management
- Integration with AI Service for task and schedule generation

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
   CREATE DATABASE event_planning_db;
   ```

2. Update `application.yml` with your database credentials:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/event_planning_db
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

The service will be available at `http://localhost:8080`

## API Endpoints

### Health Check
```bash
GET /health
```

### Wizard Data Management
```bash
POST /api/events/save-wizard
GET /api/events/wizard/{eventName}
GET /api/events/wizards
DELETE /api/events/wizard/{eventName}
```

### Task Generation
```bash
POST /api/events/generate-tasks
```

### Schedule Generation
```bash
POST /api/schedules/generate
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/api-docs

## Configuration

### Environment Variables

- `DB_USERNAME`: PostgreSQL username (default: postgres)
- `DB_PASSWORD`: PostgreSQL password (default: postgres)
- `AI_SERVICE_URL`: AI Service URL (default: http://localhost:8001)

### Application Properties

See `src/main/resources/application.yml` for all configuration options.

## Architecture

This service:
- Manages events, tasks, schedules, and members in its own database
- Calls AI Service for task and schedule generation
- Provides RESTful APIs optimized for desktop/web clients
- Uses JPA for database operations

## Port

Default port: **8080**

