# Archived Backend Implementation

## Status: ARCHIVED

This backend implementation has been **archived** in favor of the microservices architecture.

**Date Archived**: November 16, 2025

## What This Contains

This folder contains an alternative backend architecture implementation:

- `java-api/` - Unified Java Spring Boot API (Events, Members, Tasks, Schedules)
- `python-llm/` - Python FastAPI LLM Service

## Current Active Architecture

The project now uses the **microservices architecture** located in the root directory:

- `ai-service/` - Python FastAPI for LLM interactions
- `event-planning-service/` - Java Spring Boot for desktop/web planning
- `event-tracking-service/` - Java Spring Boot for mobile tracking
- `api-gateway/` - Spring Cloud Gateway for routing

See `MICROSERVICES_README.md` in the root directory for the current architecture documentation.

## Why Archived

This implementation was replaced by the microservices architecture which provides:
- Better separation of concerns (planning vs tracking)
- Independent scaling of services
- Clearer service boundaries
- Better alignment with microservices best practices

## Preservation

This archive is preserved for:
- Reference purposes
- Potential future use
- Architecture comparison
- Learning purposes

**Do not delete this folder** - it serves as historical reference.

