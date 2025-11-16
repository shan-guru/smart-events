# Architecture Status

## Current Active Architecture: Microservices

The project uses a **microservices architecture** with the following services:

1. **AI Service** (`ai-service/`) - Python FastAPI for LLM interactions
2. **Event Planning Service** (`event-planning-service/`) - Java Spring Boot for desktop/web planning
3. **Event Tracking Service** (`event-tracking-service/`) - Java Spring Boot for mobile tracking
4. **API Gateway** (`api-gateway/`) - Spring Cloud Gateway for routing

**Documentation**: See `MICROSERVICES_README.md` for detailed documentation.

## Archived Architecture

The previous unified backend architecture has been archived in `backend-archive/` folder.

**What was archived**:
- Unified Java Spring Boot API (`java-api/`)
- Python LLM Service (`python-llm/`)

**Why archived**: Replaced by microservices architecture for better separation of concerns and independent scaling.

**Status**: Preserved for reference - **DO NOT DELETE**

See `backend-archive/README_ARCHIVE.md` for more details.

