import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';

const EventList = ({ events = [], onEdit, onDelete, onCreateNew }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadge = (startDate, endDate) => {
    if (!startDate || !endDate) return <Badge variant="warning">Planning</Badge>;
    
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return <Badge variant="warning">Upcoming</Badge>;
    if (now >= start && now <= end) return <Badge variant="success">Active</Badge>;
    return <Badge variant="primary">Completed</Badge>;
  };

  if (events.length === 0) {
    return (
      <Card>
        <div className="section-title">Events</div>
        <EmptyState
          icon="📅"
          title="No Events Yet"
          description="Start by creating your first event"
          actionLabel="Create Event"
          onAction={onCreateNew}
        />
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="section-title">Events</div>
        <Button onClick={onCreateNew}>Create Event</Button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div>Event Name</div>
          <div>Start Date</div>
          <div>End Date</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        {events.map((event, index) => (
          <div key={event.id || index} className="table-row">
            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
              {event.eventName || event.name || 'Unnamed Event'}
            </div>
            <div>{formatDate(event.startDate)}</div>
            <div>{formatDate(event.endDate)}</div>
            <div>{getStatusBadge(event.startDate, event.endDate)}</div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                className="icon-button"
                onClick={() => onEdit && onEdit(event)}
                aria-label="Edit event"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button
                className="icon-button"
                onClick={() => onDelete && onDelete(event)}
                aria-label="Delete event"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--error)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

EventList.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      eventName: PropTypes.string,
      name: PropTypes.string,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
    })
  ),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onCreateNew: PropTypes.func,
};

export default EventList;

