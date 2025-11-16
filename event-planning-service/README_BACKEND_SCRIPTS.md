# Backend Management Scripts

## Quick Start Script

The `start-backend.sh` script provides an easy way to manage the backend service.

### Usage

```bash
# Start the backend
./start-backend.sh start

# Restart the backend (stop and start)
./start-backend.sh restart

# Stop the backend
./start-backend.sh stop

# Check backend status
./start-backend.sh status

# View logs (tail -f)
./start-backend.sh logs
```

### Features

- **Automatic Process Detection**: Finds and manages backend processes
- **Port Conflict Handling**: Detects and handles port 8080 conflicts
- **Health Check**: Waits for backend to be ready before completing
- **Log Management**: Logs are written to `backend.log`
- **PID Tracking**: Stores process ID in `backend.pid`

### Examples

#### Start Backend
```bash
cd event-planning-service
./start-backend.sh start
```

#### Restart Backend (useful after code changes)
```bash
cd event-planning-service
./start-backend.sh restart
```

#### Check if Backend is Running
```bash
cd event-planning-service
./start-backend.sh status
```

#### View Live Logs
```bash
cd event-planning-service
./start-backend.sh logs
```

### Manual Start (Alternative)

If you prefer to start manually:

```bash
cd event-planning-service
mvn spring-boot:run
```

Or in the background:

```bash
cd event-planning-service
nohup mvn spring-boot:run > backend.log 2>&1 &
```

### Troubleshooting

#### Port Already in Use
If port 8080 is already in use, the script will:
1. Detect the process using the port
2. Ask if you want to kill it
3. Proceed with starting the backend

#### Backend Won't Start
1. Check logs: `tail -f backend.log`
2. Verify Java is installed: `java -version`
3. Verify Maven is installed: `mvn -version`
4. Check database connection in `application.yml`

#### Process Not Found
If the script can't find the backend process:
1. Check manually: `ps aux | grep event-planning`
2. Check port: `lsof -i :8080`
3. Kill manually if needed: `kill -9 <PID>`

