import React from 'react';
import '../themes/Theme1.css';

function EventManagement() {
  return (
    <div className="theme-1">
      <div className="app-container">
        {/* Header Section */}
        <div className="header">
          <h1>Event Management System</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
            Manage your events, tasks, and team members efficiently
          </p>
        </div>

        {/* Main Content Area - Ready for Components */}
        <div className="grid-layout" style={{ marginBottom: '2rem' }}>
          {/* Stats Section */}
          <div className="stat-card">
            <div className="stat-label">Total Events</div>
            <div className="stat-value">0</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Tasks</div>
            <div className="stat-value">0</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Team Members</div>
            <div className="stat-value">0</div>
          </div>
        </div>

        {/* Content Sections - Ready for Components */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="section-title">Events</div>
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <div className="empty-state-title">No Events Yet</div>
            <div className="empty-state-description">
              Start by creating your first event
            </div>
            <button className="button-primary">Create Event</button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="section-title">Tasks</div>
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">No Tasks Yet</div>
            <div className="empty-state-description">
              Tasks will appear here once you create an event
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">Team Members</div>
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">No Members Yet</div>
            <div className="empty-state-description">
              Add team members to get started
            </div>
            <button className="button-primary">Add Member</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventManagement;

