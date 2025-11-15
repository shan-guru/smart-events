# Troubleshooting Guide

## Common Issues

### 1. Network Error / Connection Refused

**Error Message:**
```
ERR_NETWORK
ERR_CONNECTION_REFUSED
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

**Solution:**
The backend API server is not running. Follow these steps:

1. **Open a new terminal window/tab**

2. **Navigate to the project directory:**
   ```bash
   cd /path/to/ai-key-validator
   ```

3. **Activate the virtual environment:**
   ```bash
   source venv/bin/activate
   ```

4. **Start the API server:**
   ```bash
   python api.py
   ```
   
   Or use the startup script:
   ```bash
   ./start_api.sh
   ```

5. **Verify the server is running:**
   - You should see: `INFO:     Uvicorn running on http://0.0.0.0:8000`
   - Visit http://localhost:8000/docs to see the API documentation

6. **Keep this terminal open** - the server needs to keep running

7. **In your React app**, try generating tasks again

### 2. API Key Not Found

**Error Message:**
```
GEMINI_API_KEY not found
```

**Solution:**
1. Create a `.env` file in the project root:
   ```bash
   echo "GEMINI_API_KEY=your_actual_api_key_here" > .env
   ```

2. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. Restart the API server

### 3. Port Already in Use

**Error Message:**
```
Address already in use
Port 8000 is already in use
```

**Solution:**
1. Find the process using port 8000:
   ```bash
   lsof -i :8000
   ```

2. Kill the process:
   ```bash
   kill -9 <PID>
   ```

3. Or change the port in `api.py`:
   ```python
   uvicorn.run(app, host="0.0.0.0", port=8001)
   ```

4. Update the frontend `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:8001
   ```

### 4. CORS Errors

**Error Message:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**
The CORS middleware should already be configured. If you're using a different port for React:

1. Update `api.py` to include your React port:
   ```python
   allow_origins=["http://localhost:3000", "http://localhost:3001", ...]
   ```

2. Restart the API server

### 5. Module Not Found Errors

**Error Message:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**
1. Make sure virtual environment is activated:
   ```bash
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### 6. React App Not Starting

**Error Message:**
```
npm ERR! code ELIFECYCLE
```

**Solution:**
1. Make sure you're in the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Clear cache and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Quick Health Check

Run these commands to verify everything is set up correctly:

```bash
# Check if API server is running
curl http://localhost:8000/health

# Check if React app is running
curl http://localhost:3000

# Check if .env file exists
test -f .env && echo "✓ .env exists" || echo "✗ .env missing"

# Check if virtual environment is activated
which python | grep venv && echo "✓ venv active" || echo "✗ venv not active"
```

## Still Having Issues?

1. Check the terminal where the API server is running for error messages
2. Check the browser console (F12) for detailed error messages
3. Verify both servers are running:
   - Backend: http://localhost:8000/docs
   - Frontend: http://localhost:3000

