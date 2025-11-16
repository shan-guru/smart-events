import React, { useState } from 'react';
import '../themes/Theme1.css';
import Header from '../components/ui/Header';
import Menu from '../components/ui/Menu';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import CreateEventForm from '../components/events/CreateEventForm';
import Modal from '../components/ui/Modal';

function EventsPage({ navigate }) {
  const [activeTab, setActiveTab] = useState('all');
  const userMenuItems = [
    {
      label: 'My Profile',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
      onClick: () => alert('My Profile clicked'),
    },
    {
      label: 'Settings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m0 4.243l4.243-4.243M4.636 4.636l4.243 4.243m0-4.243L4.636 8.879"></path>
        </svg>
      ),
      onClick: () => alert('Settings clicked'),
    },
    { divider: true },
    {
      label: 'Sign Out',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      ),
      onClick: () => alert('Sign Out clicked'),
      danger: true,
    },
  ];
  const [events, setEvents] = useState([
    {
      id: 1,
      eventName: 'Product Launch',
      startDate: '2025-11-15',
      endDate: '2025-11-17',
      eventDate: '2025-11-16',
      status: 'in-progress',
    },
    {
      id: 2,
      eventName: 'Annual Conference',
      startDate: '2025-12-20',
      endDate: '2025-12-22',
      eventDate: '2025-12-21',
      status: 'upcoming',
    },
    {
      id: 3,
      eventName: 'Team Building',
      startDate: '2025-10-10',
      endDate: '2025-10-10',
      eventDate: '2025-10-10',
      status: 'completed',
    },
    {
      id: 4,
      eventName: 'Q4 Review',
      startDate: '2025-09-30',
      endDate: '2025-09-30',
      eventDate: '2025-09-30',
      status: 'closed',
    },
  ]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const handleCreateNew = () => {
    setEditingEvent(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
  };

  const handleDelete = (event) => {
    if (window.confirm(`Are you sure you want to delete "${event.eventName || event.name}"?`)) {
      setEvents(events.filter(e => e.id !== event.id));
    }
  };

  const handleMarkClosed = (event) => {
    if (window.confirm(`Are you sure you want to mark "${event.eventName || event.name}" as closed?`)) {
      setEvents(events.map(e => 
        e.id === event.id 
          ? { ...e, status: 'closed' }
          : e
      ));
    }
  };

  const handleCreateSubmit = (formData) => {
    const newEvent = {
      id: Date.now(),
      ...formData,
      status: 'upcoming', // Default status for new events
    };
    setEvents([...events, newEvent]);
    setIsCreateModalOpen(false);
  };

  const handleEditSubmit = (formData) => {
    setEvents(events.map(e => 
      e.id === editingEvent.id 
        ? { ...e, ...formData }
        : e
    ));
    setIsEditModalOpen(false);
    setEditingEvent(null);
  };

  const getStatusBadge = (startDate, endDate, status) => {
    if (status === 'completed') return <Badge variant="success">Completed</Badge>;
    if (status === 'closed') return <Badge variant="primary">Closed</Badge>;
    if (status === 'in-progress') return <Badge variant="warning">In Progress</Badge>;
    
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return <Badge variant="warning">Upcoming</Badge>;
    if (now >= start && now <= end) return <Badge variant="success">Active</Badge>;
    return <Badge variant="primary">Completed</Badge>;
  };

  const filteredEvents = events.filter(event => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return event.status === 'completed';
    if (activeTab === 'in-progress') return event.status === 'in-progress';
    if (activeTab === 'closed') return event.status === 'closed';
    return true;
  });

  const stats = {
    total: events.length,
    completed: events.filter(e => e.status === 'completed').length,
    inProgress: events.filter(e => e.status === 'in-progress').length,
    closed: events.filter(e => e.status === 'closed').length,
  };

  return (
    <div className="theme-1">
      <Header
        logo="https://via.placeholder.com/48x48/667eea/ffffff?text=EMS"
        title="Events"
        subtitle="Overview of all your events and activities"
        userAvatar={
          <Menu
            trigger={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <img 
                  src="https://via.placeholder.com/40x40/764ba2/ffffff?text=JD" 
                  alt="John Doe" 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--primary-gradient)',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  JD
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                  John Doe
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-secondary)' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            }
            items={userMenuItems}
            placement="bottom-right"
          />
        }
        navigationItems={[
          { 
            label: 'Events', 
            icon: '📅', 
            active: true,
            onClick: () => navigate && navigate('events')
          },
          { 
            label: 'Templates', 
            icon: '📋',
            onClick: () => navigate && navigate('templates')
          },
          { 
            label: 'My Tasks', 
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
                <rect x="9" y="3" width="6" height="4" rx="1"></rect>
                <path d="M9 12h6"></path>
                <path d="M9 16h6"></path>
              </svg>
            ),
            onClick: () => navigate && navigate('my-tasks')
          },
          { 
            label: 'Core Members', 
            icon: '👥',
            onClick: () => navigate && navigate('core-members')
          },
        ]}
        actions={[
          {
            label: 'Add Event',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            ),
            onClick: () => navigate && navigate('create-event'),
            variant: 'primary',
          },
          {
            label: 'Notifications',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            ),
            onClick: () => alert('Notifications clicked'),
          },
          {
            label: 'Settings',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m0 4.243l4.243-4.243M4.636 4.636l4.243 4.243m0-4.243L4.636 8.879"></path>
              </svg>
            ),
            onClick: () => alert('Settings clicked'),
          },
        ]}
      />
      <div className="app-container">
        {/* Stats Section */}
        <div className="grid-layout" style={{ marginBottom: '2rem' }}>
          <StatCard label="Total Events" value={stats.total} icon="📅" />
          <StatCard label="Completed" value={stats.completed} icon="✅" />
          <StatCard label="In Progress" value={stats.inProgress} icon="🔄" />
          <StatCard label="Closed" value={stats.closed} icon="🔒" />
        </div>

        {/* Tabs and Events Section */}
        <Card>
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="section-title">Events</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button
                className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Events
              </button>
              <button
                className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                Completed
              </button>
              <button
                className={`tab ${activeTab === 'in-progress' ? 'active' : ''}`}
                onClick={() => setActiveTab('in-progress')}
              >
                In Progress
              </button>
              <button
                className={`tab ${activeTab === 'closed' ? 'active' : ''}`}
                onClick={() => setActiveTab('closed')}
              >
                Closed
              </button>
            </div>
          </div>

          {/* Events List */}
          {filteredEvents.length > 0 ? (
            <div className="table-container">
              <div className="table-header">
                <div>Event Name</div>
                <div>Start Date</div>
                <div>End Date</div>
                <div>Event Date</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              {filteredEvents.map((event) => (
                <div key={event.id} className="table-row">
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                    {event.eventName || event.name || 'Unnamed Event'}
                  </div>
                  <div style={{ color: 'var(--text-primary)' }}>
                    {new Date(event.startDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div style={{ color: 'var(--text-primary)' }}>
                    {new Date(event.endDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div style={{ color: 'var(--text-primary)' }}>
                    {event.eventDate 
                      ? new Date(event.eventDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : 'N/A'}
                  </div>
                  <div>
                    {getStatusBadge(event.startDate, event.endDate, event.status)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                    {event.status !== 'closed' && (
                      <button
                        className="icon-button"
                        onClick={() => handleMarkClosed(event)}
                        aria-label="Mark as closed"
                        title="Mark as closed"
                        style={{ 
                          border: 'none', 
                          background: 'transparent', 
                          cursor: 'pointer',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0.25rem',
                          borderRadius: 'var(--radius-sm)',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--bg-secondary)';
                          e.currentTarget.style.color = 'var(--primary-color)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </button>
                    )}
                    <button
                      className="icon-button"
                      onClick={() => handleEdit(event)}
                      aria-label="Edit event"
                      title="Edit event"
                      style={{ 
                        border: 'none', 
                        background: 'transparent', 
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.25rem',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                        e.currentTarget.style.color = 'var(--primary-color)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => handleDelete(event)}
                      aria-label="Delete event"
                      title="Delete event"
                      style={{ 
                        border: 'none', 
                        background: 'transparent', 
                        cursor: 'pointer', 
                        color: 'var(--error)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.25rem',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
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
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem 2rem',
              color: 'var(--text-secondary)'
            }}>
              <p>No {activeTab === 'all' ? '' : activeTab} events found</p>
            </div>
          )}
        </Card>

        {/* Create Event Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Event"
        >
          <CreateEventForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>

        {/* Edit Event Modal */}
        {editingEvent && (
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingEvent(null);
            }}
            title="Edit Event"
          >
            <CreateEventForm
              initialData={editingEvent}
              onSubmit={handleEditSubmit}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingEvent(null);
              }}
            />
          </Modal>
        )}
      </div>
    </div>
  );
}

export default EventsPage;

