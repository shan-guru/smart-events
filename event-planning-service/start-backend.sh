#!/bin/bash

# Backend Start/Restart Script for Event Planning Service
# Usage: ./start-backend.sh [start|restart|stop|status]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_NAME="event-planning-service"
PORT=8080
LOG_FILE="$SCRIPT_DIR/backend.log"
PID_FILE="$SCRIPT_DIR/backend.pid"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to find Java process
find_backend_process() {
    ps aux | grep -i "event-planning-service\|EventPlanningServiceApplication" | grep -v grep | awk '{print $2}'
}

# Function to find process using port 8080
find_port_process() {
    lsof -ti :$PORT 2>/dev/null
}

# Function to check if backend is running
check_status() {
    local pid=$(find_backend_process)
    local port_pid=$(find_port_process)
    
    if [ -n "$pid" ] || [ -n "$port_pid" ]; then
        echo -e "${GREEN}✓${NC} Backend is running"
        if [ -n "$pid" ]; then
            echo -e "  Process ID: $pid"
        fi
        if [ -n "$port_pid" ]; then
            echo -e "  Port $PORT is in use by PID: $port_pid"
        fi
        return 0
    else
        echo -e "${RED}✗${NC} Backend is not running"
        return 1
    fi
}

# Function to stop backend
stop_backend() {
    echo -e "${YELLOW}Stopping backend...${NC}"
    
    # Find and kill backend processes
    local pids=$(find_backend_process)
    local port_pid=$(find_port_process)
    
    if [ -n "$pids" ]; then
        echo "Found backend processes: $pids"
        echo "$pids" | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✓${NC} Backend processes stopped"
    fi
    
    if [ -n "$port_pid" ] && [ -z "$pids" ]; then
        echo "Port $PORT is in use by PID: $port_pid"
        read -p "Kill process on port $PORT? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill -9 $port_pid 2>/dev/null
            echo -e "${GREEN}✓${NC} Process on port $PORT stopped"
        fi
    fi
    
    # Remove PID file if exists
    [ -f "$PID_FILE" ] && rm -f "$PID_FILE"
    
    # Wait a bit for ports to be released
    sleep 2
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}Starting backend...${NC}"
    
    # Check if already running
    if check_status >/dev/null 2>&1; then
        echo -e "${YELLOW}Backend is already running. Use 'restart' to restart it.${NC}"
        return 1
    fi
    
    # Check if port is in use
    local port_pid=$(find_port_process)
    if [ -n "$port_pid" ]; then
        echo -e "${RED}Port $PORT is already in use by PID: $port_pid${NC}"
        read -p "Kill process and continue? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill -9 $port_pid 2>/dev/null
            sleep 2
        else
            return 1
        fi
    fi
    
    # Change to service directory
    cd "$SCRIPT_DIR" || exit 1
    
    # Check if Maven is available
    if ! command -v mvn &> /dev/null; then
        echo -e "${RED}Error: Maven (mvn) is not installed or not in PATH${NC}"
        return 1
    fi
    
    # Check if Java is available
    if ! command -v java &> /dev/null; then
        echo -e "${RED}Error: Java is not installed or not in PATH${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Building and starting backend...${NC}"
    echo -e "Logs will be written to: $LOG_FILE"
    echo ""
    
    # Start backend in background and save PID
    nohup mvn spring-boot:run > "$LOG_FILE" 2>&1 &
    local pid=$!
    echo $pid > "$PID_FILE"
    
    echo -e "${GREEN}✓${NC} Backend started with PID: $pid"
    echo -e "${BLUE}Waiting for backend to be ready...${NC}"
    
    # Wait for backend to start (check health endpoint or port)
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        sleep 2
        if curl -s http://localhost:$PORT/api/members >/dev/null 2>&1 || \
           curl -s http://localhost:$PORT/actuator/health >/dev/null 2>&1 || \
           lsof -ti :$PORT >/dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} Backend is ready!"
            echo -e "${BLUE}Backend URL: http://localhost:$PORT${NC}"
            echo -e "${BLUE}API Docs: http://localhost:$PORT/swagger-ui.html${NC}"
            echo -e "${BLUE}View logs: tail -f $LOG_FILE${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        echo -n "."
    done
    
    echo ""
    echo -e "${YELLOW}Backend may still be starting. Check logs: tail -f $LOG_FILE${NC}"
    return 0
}

# Function to restart backend
restart_backend() {
    echo -e "${YELLOW}Restarting backend...${NC}"
    stop_backend
    sleep 2
    start_backend
}

# Function to show logs
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo -e "${BLUE}Showing last 50 lines of logs. Press Ctrl+C to exit.${NC}"
        tail -f -n 50 "$LOG_FILE"
    else
        echo -e "${YELLOW}Log file not found: $LOG_FILE${NC}"
    fi
}

# Main script logic
case "${1:-start}" in
    start)
        start_backend
        ;;
    restart)
        restart_backend
        ;;
    stop)
        stop_backend
        ;;
    status)
        check_status
        ;;
    logs)
        show_logs
        ;;
    *)
        echo "Usage: $0 [start|restart|stop|status|logs]"
        echo ""
        echo "Commands:"
        echo "  start   - Start the backend service"
        echo "  restart - Stop and start the backend service"
        echo "  stop    - Stop the backend service"
        echo "  status  - Check if backend is running"
        echo "  logs    - Show backend logs (tail -f)"
        exit 1
        ;;
esac

