import React, { useState } from 'react';
import '../themes/Theme1.css';
import Header from '../components/ui/Header';
import Menu from '../components/ui/Menu';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

function MyTasksPage({ navigate }) {
  // Sample tasks assigned to the user
  const [tasks] = useState([
    {
      id: 1,
      task: 'Venue Booking',
      event: 'Birthday Party - Sarah',
      description: 'Book and confirm event venue for birthday party',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2025-01-15',
      assignedBy: 'Event Manager',
    },
    {
      id: 2,
      task: 'Catering Arrangement',
      event: 'Birthday Party - Sarah',
      description: 'Arrange food and beverages for 50 guests',
      priority: 'high',
      status: 'pending',
      dueDate: '2025-01-18',
      assignedBy: 'Event Manager',
    },
    {
      id: 3,
      task: 'Decoration Setup',
      event: 'Birthday Party - Sarah',
      description: 'Set up decorations and theme according to plan',
      priority: 'medium',
      status: 'pending',
      dueDate: '2025-01-20',
      assignedBy: 'Event Manager',
    },
    {
      id: 4,
      task: 'Speaker Coordination',
      event: 'Corporate Conference 2025',
      description: 'Coordinate with speakers and finalize schedule',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2025-01-12',
      assignedBy: 'Conference Lead',
    },
    {
      id: 5,
      task: 'AV Equipment Setup',
      event: 'Corporate Conference 2025',
      description: 'Arrange audio-visual equipment for main hall',
      priority: 'high',
      status: 'completed',
      dueDate: '2025-01-10',
      assignedBy: 'Conference Lead',
    },
    {
      id: 6,
      task: 'Registration Management',
      event: 'Corporate Conference 2025',
      description: 'Set up and test registration system',
      priority: 'medium',
      status: 'pending',
      dueDate: '2025-01-14',
      assignedBy: 'Conference Lead',
    },
    {
      id: 7,
      task: 'Photography Booking',
      event: 'Wedding Ceremony - John & Jane',
      description: 'Book photographer for wedding ceremony',
      priority: 'medium',
      status: 'in-progress',
      dueDate: '2025-01-25',
      assignedBy: 'Wedding Planner',
    },
    {
      id: 8,
      task: 'Invitation Design',
      event: 'Birthday Party - Sarah',
      description: 'Design and approve invitation cards',
      priority: 'low',
      status: 'completed',
      dueDate: '2025-01-08',
      assignedBy: 'Event Manager',
    },
  ]);
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

  return (
    <div className="theme-1">
      <Header
        logo="https://via.placeholder.com/48x48/667eea/ffffff?text=EMS"
        title="My Tasks"
        subtitle="View and manage your assigned tasks"
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
            active: true,
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
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="section-title">My Tasks</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Badge variant="primary">{tasks.filter(t => t.status === 'pending').length} Pending</Badge>
              <Badge variant="warning">{tasks.filter(t => t.status === 'in-progress').length} In Progress</Badge>
              <Badge variant="success">{tasks.filter(t => t.status === 'completed').length} Completed</Badge>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-secondary)' }}>
              <p>No tasks assigned to you</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 2fr 120px 120px 140px 120px',
                gap: '1rem',
                padding: '0.875rem 1rem',
                background: 'var(--primary-gradient)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '0.5rem',
                alignItems: 'center',
                minWidth: '1000px',
              }}>
                <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Task
                </div>
                <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Event
                </div>
                <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Description
                </div>
                <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Priority
                </div>
                <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Status
                </div>
                <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Due Date
                </div>
                <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Actions
                </div>
              </div>

              {/* Task Rows */}
              <div>
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1.5fr 2fr 120px 120px 140px 120px',
                      gap: '1rem',
                      padding: '1rem',
                      borderBottom: index < tasks.length - 1 ? '1px solid var(--border-color)' : 'none',
                      alignItems: 'center',
                      transition: 'background 0.2s ease',
                      minWidth: '1000px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-primary)';
                    }}
                  >
                    <div style={{ 
                      fontWeight: '600', 
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                    }}>
                      {task.task}
                    </div>
                    <div style={{ 
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                    }}>
                      {task.event}
                    </div>
                    <div style={{ 
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                    }}>
                      {task.description}
                    </div>
                    <div>
                      <Badge variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}>
                        {(task.priority || '').charAt(0).toUpperCase() + (task.priority || '').slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'warning' : 'primary'}>
                        {task.status === 'in-progress' ? 'In Progress' : task.status === 'completed' ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                    <div style={{ 
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                    }}>
                      {new Date(task.dueDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <Button
                        variant="icon"
                        onClick={() => alert(`View task: ${task.task}`)}
                        title="View Details"
                        style={{ padding: '0.5rem' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default MyTasksPage;

