# API Gateway

Spring Cloud Gateway service for routing requests to microservices. Provides a single entry point for all client requests.

## Purpose

This gateway service:
- Routes requests to appropriate microservices
- Provides unified API endpoint
- Handles CORS for all services
- Health check aggregation
- Future: Authentication/authorization
- Future: Rate limiting
- Future: Request/response transformation

## Technology Stack

- **Framework**: Spring Boot 3.2.0
- **Gateway**: Spring Cloud Gateway
- **Java**: 17

## Setup

### Prerequisites

- Java 17+
- Maven 3.6+
- All microservices running (AI Service, Event Planning Service, Event Tracking Service)

### Running the Gateway

```bash
# Build the project
mvn clean install

# Run the gateway
mvn spring-boot:run
```

The gateway will be available at `http://localhost:8082`

## Routing

### AI Service Routes
- `/api/ai/**` → `http://localhost:8001/**`
  - Example: `/api/ai/generate-tasks` → `http://localhost:8001/generate-tasks`

### Event Planning Service Routes
- `/api/planning/**` → `http://localhost:8080/api/**`
- `/api/events/**` → `http://localhost:8080/api/events/**`
- `/api/schedules/**` → `http://localhost:8080/api/schedules/**`

### Event Tracking Service Routes
- `/api/tracking/**` → `http://localhost:8081/api/tracking/**`

### Health Check Routes
- `/health/ai` → AI Service health
- `/health/planning` → Event Planning Service health
- `/health/tracking` → Event Tracking Service health

## Example Requests

### Through Gateway
```bash
# Generate tasks (via gateway)
POST http://localhost:8082/api/ai/generate-tasks

# Get event status (via gateway)
GET http://localhost:8082/api/tracking/events/1/status

# Save wizard data (via gateway)
POST http://localhost:8082/api/events/save-wizard
```

## Configuration

Routes are configured in `src/main/resources/application.yml`. Update service URLs as needed.

## Port

Default port: **8082**

## Future Enhancements

- Authentication/Authorization (JWT, OAuth2)
- Rate limiting
- Request/response logging
- Circuit breaker pattern
- Load balancing
- Service discovery (Eureka, Consul)

