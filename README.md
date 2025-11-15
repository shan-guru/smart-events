# Event Task Generator

A full-stack application for generating optimal task lists from events using Google's Gemini AI. Includes a Python FastAPI backend, React frontend, and CLI interface.

## Features

- 🤖 **AI-Powered Task Generation** - Generate optimal task lists using Gemini AI
- 🎨 **Modern React UI** - Beautiful, responsive web interface
- ➕ **Manual Task Management** - Add, edit, and remove tasks manually
- 🔌 **REST API** - FastAPI backend with comprehensive endpoints
- 💻 **CLI Interface** - Interactive command-line tool
- 🔄 **CORS Enabled** - Frontend and backend communication ready

## Setup

1. **Create and activate virtual environment:**
   
   **Option A: Using the setup script (recommended):**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   source venv/bin/activate
   ```
   
   **Option B: Manual setup:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

2. **Get your Gemini API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create or get your API key

3. **Configure API Key:**
   - Create a `.env` file in the project root:
     ```bash
     echo "GEMINI_API_KEY=your_actual_api_key_here" > .env
     ```
   - Or manually create `.env` and add:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```

## Usage

**Make sure your virtual environment is activated:**
```bash
source venv/bin/activate
```

Then run the application:
```bash
python app.py
```

Then enter your prompts when prompted. Type `quit`, `exit`, or `q` to exit the application.

## Example

```
Enter your prompt (or 'quit' to exit): What is Python?
Processing...

Gemini Response:
Python is a high-level, interpreted programming language...
```

## API Usage

The project includes a FastAPI-based REST API for generating optimal task lists from events.

### Starting the API Server

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Run the API server
python api.py

# Or using uvicorn directly
uvicorn api:app --reload
```

The API will be available at `http://localhost:8000`

### API Endpoints

#### 1. Health Check
```bash
GET /health
```

#### 2. Generate Tasks (Main Endpoint)
```bash
POST /generate-tasks
Content-Type: application/json

{
  "event": "Product Launch",
  "event_info": "Launching a new mobile app in Q2 2024, targeting tech-savvy millennials"
}
```

**Response:**
```json
{
  "event": "Product Launch",
  "total_tasks": 8,
  "tasks": [
    {
      "task": "Define product positioning and target audience",
      "priority": "high",
      "estimated_time": "2-3 days",
      "dependencies": []
    },
    {
      "task": "Develop marketing strategy and campaign plan",
      "priority": "high",
      "estimated_time": "1 week",
      "dependencies": ["Define product positioning and target audience"]
    }
  ]
}
```

### API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Testing the API

Run the test script:
```bash
python test_api.py
```

Or use curl:
```bash
curl -X POST "http://localhost:8000/generate-tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "Conference",
    "event_info": "Tech conference for 500 attendees in San Francisco, 3-day event"
  }'
```

### Key Features of the API

- **Optimal Task Generation**: Uses optimized prompts to generate the most effective task lists (KSR - Key Success Requirement)
- **Structured Response**: Returns tasks with priority, time estimates, and dependencies
- **Error Handling**: Comprehensive error handling and validation
- **JSON Parsing**: Robust parsing of Gemini responses with fallback mechanisms
- **CORS Enabled**: Ready for frontend integration

## React Frontend

A modern React UI for interacting with the API.

### Quick Start

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

4. **Make sure the backend API is running** (see API Usage section above)

### Frontend Features

- ✨ AI-powered task generation from event details
- ➕ Add tasks manually
- ✏️ Edit existing tasks
- 🗑️ Remove tasks
- 🎨 Modern, responsive UI
- 📱 Mobile-friendly design

For detailed frontend documentation, see [frontend/README.md](frontend/README.md)

## Complete Setup (Full Stack)

1. **Backend Setup:**
   ```bash
   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Set up API key
   echo "GEMINI_API_KEY=your_api_key_here" > .env
   
   # Start API server
   python api.py
   ```

2. **Frontend Setup (in a new terminal):**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs

## Project Structure

```
ai-key-validator/
├── api.py                 # FastAPI backend
├── app.py                 # CLI interface
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service
│   │   └── App.js         # Main app
│   └── package.json
├── requirements.txt       # Python dependencies
└── README.md
```

## Requirements

- Python 3.7+
- Node.js 14+ (for React frontend)
- Google Gemini API Key
- Internet connection

