#!/bin/bash

# Root-level Backend Start/Restart Script
# This script calls the service-specific script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_SCRIPT="$SCRIPT_DIR/event-planning-service/start-backend.sh"

if [ ! -f "$SERVICE_SCRIPT" ]; then
    echo "Error: Backend script not found at $SERVICE_SCRIPT"
    exit 1
fi

# Make sure it's executable
chmod +x "$SERVICE_SCRIPT"

# Execute the service script with all arguments
exec "$SERVICE_SCRIPT" "$@"

