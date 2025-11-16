import React, { useState } from 'react';
import './App.css';
import './themes/Theme1.css';
import './themes/Theme2.css';
import './themes/Theme3.css';
import EventManagement from './pages/EventManagement';
import Playground from './pages/Playground';
import EventsPage from './pages/EventsPage';
import SchedulePage from './pages/SchedulePage';
import CreateEventPage from './pages/CreateEventPage';
import CoreMembersPage from './pages/CoreMembersPage';
import TemplatesPage from './pages/TemplatesPage';
import MyTasksPage from './pages/MyTasksPage';

function App() {
  const [currentPage, setCurrentPage] = useState('events');
  const [selectedTheme, setSelectedTheme] = useState('theme-1');

  // Theme Selector Page
  if (currentPage === 'theme-selector') {
    return (
      <div className={`App ${selectedTheme}`}>
        <div className="app-container">
          <div className="header">
            <h1>Event Management System</h1>
            <p className="subtitle">Choose a theme to preview the UI design</p>
          </div>

          <div className="card">
            <div className="section-title">Select Theme</div>
            <div className="tabs">
              <button 
                className={`tab ${selectedTheme === 'theme-1' ? 'active' : ''}`}
                onClick={() => setSelectedTheme('theme-1')}
              >
                Theme 1: Modern Gradient
              </button>
              <button 
                className={`tab ${selectedTheme === 'theme-2' ? 'active' : ''}`}
                onClick={() => setSelectedTheme('theme-2')}
              >
                Theme 2: Professional Corporate
              </button>
              <button 
                className={`tab ${selectedTheme === 'theme-3' ? 'active' : ''}`}
                onClick={() => setSelectedTheme('theme-3')}
              >
                Theme 3: Minimalist Dark
              </button>
            </div>

            <div className="grid-layout" style={{ marginTop: '2rem' }}>
              <div className="stat-card">
                <div className="stat-label">Total Events</div>
                <div className="stat-value">24</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Tasks</div>
                <div className="stat-value">156</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Team Members</div>
                <div className="stat-value">42</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <div className="section-title">Action Buttons</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="button-primary">Create Event</button>
                <button className="button-secondary">View All</button>
                <button className="button-primary">Generate Tasks</button>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <div className="section-title">Form Elements</div>
              <div style={{ maxWidth: '500px' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Event Name"
                  style={{ marginBottom: '1rem' }}
                />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Event Description"
                  style={{ marginBottom: '1rem' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <div className="section-title">Badges & Chips</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="badge badge-primary">High Priority</span>
                <span className="badge badge-success">Completed</span>
                <span className="badge badge-warning">Pending</span>
                <span className="badge badge-danger">Urgent</span>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <div className="section-title">Table Preview</div>
              <div className="table-container">
                <div className="table-header">
                  <div>Event Name</div>
                  <div>Status</div>
                  <div>Date</div>
                  <div>Actions</div>
                </div>
                <div className="table-row">
                  <div>Product Launch</div>
                  <div><span className="badge badge-success">Active</span></div>
                  <div>Nov 15, 2025</div>
                  <div><button className="icon-button">✏️</button></div>
                </div>
                <div className="table-row">
                  <div>Annual Conference</div>
                  <div><span className="badge badge-warning">Planning</span></div>
                  <div>Dec 20, 2025</div>
                  <div><button className="icon-button">✏️</button></div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button 
                className="button-primary"
                onClick={() => setCurrentPage('event-management')}
              >
                Go to Event Management Page
              </button>
              <button 
                className="button-secondary"
                style={{ marginLeft: '1rem' }}
                onClick={() => setCurrentPage('playground')}
              >
                Go to Playground
              </button>
              <button 
                className="button-secondary"
                style={{ marginLeft: '1rem' }}
                onClick={() => setCurrentPage('events')}
              >
                Go to Events Page
              </button>
              <button 
                className="button-secondary"
                style={{ marginLeft: '1rem' }}
                onClick={() => setCurrentPage('schedule')}
              >
                Go to Schedule Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Navigation helper
  const navigate = (page) => {
    setCurrentPage(page);
  };

  // Events Page (Home/Landing Page)
  if (currentPage === 'events') {
    return <EventsPage navigate={navigate} />;
  }

  // Playground Page
  if (currentPage === 'playground') {
    return <Playground />;
  }

  // Schedule Page
  if (currentPage === 'schedule') {
    return <SchedulePage />;
  }

  // Create Event Page
  if (currentPage === 'create-event') {
    return <CreateEventPage navigate={navigate} />;
  }

  // Core Members Page
  if (currentPage === 'core-members') {
    return <CoreMembersPage navigate={navigate} />;
  }

  // Templates Page
  if (currentPage === 'templates') {
    return <TemplatesPage navigate={navigate} />;
  }

  // My Tasks Page
  if (currentPage === 'my-tasks') {
    return <MyTasksPage navigate={navigate} />;
  }

  // Event Management Page (Main Application)
  return <EventManagement navigate={navigate} />;
}

export default App;
