# Event Task Generator - React Frontend

A modern React UI for generating and managing event task lists using AI.

## Features

- ✨ **AI-Powered Task Generation** - Generate optimal task lists using Gemini AI
- ➕ **Manual Task Management** - Add, edit, and remove tasks manually
- 🎨 **Modern UI** - Beautiful, responsive design
- 📱 **Mobile Friendly** - Works seamlessly on all devices
- ⚡ **Real-time Updates** - Instant task list updates

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API server running on `http://localhost:8000`

## Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

3. **Make sure the backend API is running:**
   ```bash
   # In the project root directory
   source venv/bin/activate
   python api.py
   ```

## Configuration

The app is configured to connect to `http://localhost:8000` by default. To change this:

1. Create a `.env` file in the `frontend` directory:
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

2. Restart the development server

## Usage

1. **Enter Event Details:**
   - Fill in the "Event Name" field (e.g., "Product Launch", "Wedding", "Conference")
   - Provide detailed "Event Information" including timeline, audience, budget, location, etc.

2. **Generate Tasks:**
   - Click "Generate Tasks with AI" to get an optimal task list
   - The AI will analyze your event and create a structured list of tasks

3. **Manage Tasks:**
   - **Edit**: Click the ✏️ icon to edit a task
   - **Delete**: Click the 🗑️ icon to remove a task
   - **Add**: Click "+ Add Task" to manually add a new task

4. **Task Properties:**
   - Each task has a priority (High, Medium, Low)
   - Estimated time can be added
   - Dependencies can be specified

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── TaskList.js       # Task list component with CRUD operations
│   │   └── TaskList.css      # Task list styles
│   ├── services/
│   │   └── api.js            # API service for backend communication
│   ├── App.js                # Main app component
│   ├── App.css               # App styles
│   ├── index.js              # Entry point
│   └── index.css             # Global styles
├── package.json
└── README.md
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App (irreversible)

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Troubleshooting

### API Connection Issues

If you see "Failed to generate tasks" errors:

1. Make sure the backend API is running on port 8000
2. Check that CORS is enabled in the backend (FastAPI should handle this automatically)
3. Verify your `.env` file has the correct API URL

### Port Already in Use

If port 3000 is already in use, React will prompt you to use a different port.

## Technologies Used

- **React 18** - UI library
- **Axios** - HTTP client for API calls
- **CSS3** - Styling with modern features
- **Create React App** - Development tooling

