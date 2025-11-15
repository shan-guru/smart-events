import React, { useState } from 'react';
import { generateTasks } from './services/api';
import TaskList from './components/TaskList';
import ExecutionMembers from './components/ExecutionMembers';
import EventWizard from './components/EventWizard';
import ScheduleTablePage from './components/ScheduleTablePage';
import EditPopupDemo from './components/EditPopupDemo';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('wizard'); // 'tasks', 'members', 'schedule', 'edit-demo', or 'wizard'
  const [eventName, setEventName] = useState('');
  const [eventInfo, setEventInfo] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('unknown');
  // Shared state for execution members
  const [executionMembers, setExecutionMembers] = useState([]);

  // Normalize task structure to ensure consistency
  const normalizeTask = (task) => {
    // Handle duration - can be object {quantity, unit} or legacy string format
    let duration = null;
    if (task.estimated_duration) {
      if (typeof task.estimated_duration === 'object' && task.estimated_duration !== null) {
        // Already in new format
        duration = {
          quantity: task.estimated_duration.quantity || null,
          unit: task.estimated_duration.unit || null,
        };
      } else if (typeof task.estimated_duration === 'string') {
        // Legacy string format - try to parse
        const match = task.estimated_duration.match(/(\d+(?:\.\d+)?)\s*(hours?|days?|hrs?|d)/i);
        if (match) {
          duration = {
            quantity: parseFloat(match[1]),
            unit: match[2].toLowerCase().includes('hour') || match[2].toLowerCase().includes('hr') ? 'hours' : 'days',
          };
        }
      }
    }

    return {
      task: task.task || '',
      description: task.description || task.task || '',
      priority: (task.priority || 'medium').toLowerCase(),
      estimated_duration: duration,
    };
  };

  const handleGenerateTasks = async (e) => {
    e.preventDefault();
    
    if (!eventName.trim() || !eventInfo.trim()) {
      setError('Please fill in both Event Name and Event Info');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await generateTasks(eventName, eventInfo);
      // Normalize all tasks to ensure consistent structure
      const normalizedTasks = (response.tasks || []).map(normalizeTask);
      setTasks(normalizedTasks);
      setApiStatus('connected');
    } catch (err) {
      setError(err.message || 'Failed to generate tasks. Please check if the API server is running.');
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTasks = (updatedTasks) => {
    // Normalize all tasks before updating to ensure consistency
    const normalizedTasks = updatedTasks.map(normalizeTask);
    setTasks(normalizedTasks);
  };

  const handleClear = () => {
    setEventName('');
    setEventInfo('');
    setTasks([]);
    setError(null);
  };

  return (
    <div className="App">
      <div className="container">
        <header className="app-header">
          <h1>🎯 Event Task Generator</h1>
          <p>Generate optimal task lists for your events using AI</p>
        </header>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'wizard' ? 'active' : ''}`}
            onClick={() => setActiveTab('wizard')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            Create Event
          </button>
          <button
            className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Tasks
          </button>
          <button
            className={`tab ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Execution Members
          </button>
          <button
            className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Schedule Table
          </button>
          <button
            className={`tab ${activeTab === 'edit-demo' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit-demo')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit Popup Demo
          </button>
        </div>

        <div className="main-content">
          {activeTab === 'wizard' ? (
            <EventWizard executionMembers={executionMembers} />
          ) : activeTab === 'edit-demo' ? (
            <EditPopupDemo />
          ) : activeTab === 'schedule' ? (
            <ScheduleTablePage />
          ) : activeTab === 'tasks' ? (
            <>
              <div className="form-section">
                <form onSubmit={handleGenerateTasks} className="event-form">
              <div className="form-group">
                <label htmlFor="eventName">Event Name *</label>
                <input
                  id="eventName"
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g., Product Launch, Conference, Wedding"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="eventInfo">Event Information *</label>
                <textarea
                  id="eventInfo"
                  value={eventInfo}
                  onChange={(e) => setEventInfo(e.target.value)}
                  placeholder="Provide details about your event: timeline, target audience, budget, location, special requirements, etc."
                  className="form-textarea"
                  rows="4"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Generating Tasks...
                    </>
                  ) : (
                    '✨ Generate Tasks with AI'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Clear
                </button>
              </div>

              {error && (
                <div className="error-message">
                  <span>⚠️</span> {error}
                </div>
              )}
            </form>
          </div>

          {tasks.length > 0 && (
            <TaskList tasks={tasks} onUpdateTasks={handleUpdateTasks} />
          )}

          {tasks.length === 0 && !loading && (
            <div className="welcome-message">
              <h3>👋 Welcome!</h3>
              <p>
                Enter an event name and details above to generate an optimal task list using AI.
                You'll be able to add, edit, and remove tasks as needed.
              </p>
            </div>
          )}
            </>
          ) : (
            <ExecutionMembers 
              members={executionMembers} 
              setMembers={setExecutionMembers} 
            />
          )}
        </div>

        <footer className="app-footer">
          <p>
            Powered by Google Gemini AI • 
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              API Documentation
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

