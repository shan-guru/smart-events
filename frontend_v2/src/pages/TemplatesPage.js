import React, { useState } from 'react';
import '../themes/Theme1.css';
import './TemplatesPage.css';
import Header from '../components/ui/Header';
import Menu from '../components/ui/Menu';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

function TemplatesPage({ navigate }) {
  // Sample template events with their tasks (20 tasks each for 2 events)
  const [templates, setTemplates] = useState([
    {
      id: 1,
      eventName: 'Birthday Party',
      eventInfo: 'Complete birthday party planning template',
      tasks: [
        { id: 1, task: 'Venue Booking', description: 'Book and confirm event venue', priority: 'high', durationQuantity: '2', durationUnit: 'days' },
        { id: 2, task: 'Catering Arrangement', description: 'Arrange food and beverages', priority: 'high', durationQuantity: '3', durationUnit: 'days' },
        { id: 3, task: 'Decoration Setup', description: 'Set up decorations and theme', priority: 'medium', durationQuantity: '1', durationUnit: 'day' },
        { id: 4, task: 'Entertainment Booking', description: 'Book DJ or entertainment', priority: 'medium', durationQuantity: '2', durationUnit: 'days' },
        { id: 5, task: 'Invitation Design', description: 'Design and print invitations', priority: 'medium', durationQuantity: '5', durationUnit: 'days' },
        { id: 6, task: 'Guest List Management', description: 'Create and manage guest list', priority: 'low', durationQuantity: '3', durationUnit: 'days' },
        { id: 7, task: 'Photography Booking', description: 'Book photographer for event', priority: 'medium', durationQuantity: '4', durationUnit: 'days' },
        { id: 8, task: 'Cake Ordering', description: 'Order birthday cake', priority: 'medium', durationQuantity: '7', durationUnit: 'days' },
        { id: 9, task: 'Party Favors', description: 'Prepare party favors for guests', priority: 'low', durationQuantity: '5', durationUnit: 'days' },
        { id: 10, task: 'Sound System Setup', description: 'Arrange sound system and microphones', priority: 'medium', durationQuantity: '2', durationUnit: 'days' },
        { id: 11, task: 'Lighting Arrangement', description: 'Set up lighting and special effects', priority: 'medium', durationQuantity: '2', durationUnit: 'days' },
        { id: 12, task: 'Seating Arrangement', description: 'Plan and arrange seating layout', priority: 'low', durationQuantity: '1', durationUnit: 'day' },
        { id: 13, task: 'Parking Arrangement', description: 'Coordinate parking facilities', priority: 'low', durationQuantity: '3', durationUnit: 'days' },
        { id: 14, task: 'Security Services', description: 'Arrange security if needed', priority: 'low', durationQuantity: '4', durationUnit: 'days' },
        { id: 15, task: 'Cleanup Services', description: 'Arrange post-event cleanup', priority: 'low', durationQuantity: '2', durationUnit: 'days' },
        { id: 16, task: 'Thank You Cards', description: 'Prepare thank you cards', priority: 'low', durationQuantity: '3', durationUnit: 'days' },
        { id: 17, task: 'Budget Planning', description: 'Create and manage event budget', priority: 'high', durationQuantity: '5', durationUnit: 'days' },
        { id: 18, task: 'Vendor Coordination', description: 'Coordinate with all vendors', priority: 'high', durationQuantity: '7', durationUnit: 'days' },
        { id: 19, task: 'Timeline Creation', description: 'Create detailed event timeline', priority: 'high', durationQuantity: '3', durationUnit: 'days' },
        { id: 20, task: 'Final Walkthrough', description: 'Conduct final venue walkthrough', priority: 'high', durationQuantity: '1', durationUnit: 'day' },
      ],
    },
    {
      id: 2,
      eventName: 'Corporate Conference',
      eventInfo: 'Professional conference planning template',
      tasks: [
        { id: 1, task: 'Venue Selection', description: 'Select and book conference venue', priority: 'high', durationQuantity: '5', durationUnit: 'days' },
        { id: 2, task: 'Speaker Coordination', description: 'Coordinate with speakers and schedule', priority: 'high', durationQuantity: '7', durationUnit: 'days' },
        { id: 3, task: 'AV Equipment Setup', description: 'Arrange audio-visual equipment', priority: 'high', durationQuantity: '2', durationUnit: 'days' },
        { id: 4, task: 'Registration Management', description: 'Set up registration system', priority: 'medium', durationQuantity: '3', durationUnit: 'days' },
        { id: 5, task: 'Catering Services', description: 'Arrange meals and refreshments', priority: 'medium', durationQuantity: '4', durationUnit: 'days' },
        { id: 6, task: 'Networking Setup', description: 'Arrange networking areas', priority: 'medium', durationQuantity: '2', durationUnit: 'days' },
        { id: 7, task: 'Marketing Campaign', description: 'Plan and execute marketing campaign', priority: 'high', durationQuantity: '14', durationUnit: 'days' },
        { id: 8, task: 'Sponsor Coordination', description: 'Coordinate with event sponsors', priority: 'high', durationQuantity: '10', durationUnit: 'days' },
        { id: 9, task: 'Material Printing', description: 'Print conference materials and handouts', priority: 'medium', durationQuantity: '5', durationUnit: 'days' },
        { id: 10, task: 'WiFi Setup', description: 'Arrange high-speed WiFi for attendees', priority: 'high', durationQuantity: '3', durationUnit: 'days' },
        { id: 11, task: 'Badge Printing', description: 'Design and print attendee badges', priority: 'medium', durationQuantity: '4', durationUnit: 'days' },
        { id: 12, task: 'Breakout Sessions', description: 'Organize breakout session rooms', priority: 'medium', durationQuantity: '5', durationUnit: 'days' },
        { id: 13, task: 'Live Streaming', description: 'Set up live streaming if needed', priority: 'low', durationQuantity: '3', durationUnit: 'days' },
        { id: 14, task: 'Recording Services', description: 'Arrange video recording services', priority: 'low', durationQuantity: '4', durationUnit: 'days' },
        { id: 15, task: 'Transportation', description: 'Arrange transportation for speakers', priority: 'low', durationQuantity: '7', durationUnit: 'days' },
        { id: 16, task: 'Accommodation', description: 'Book accommodation for speakers', priority: 'medium', durationQuantity: '10', durationUnit: 'days' },
        { id: 17, task: 'Feedback Collection', description: 'Set up feedback collection system', priority: 'low', durationQuantity: '2', durationUnit: 'days' },
        { id: 18, task: 'Social Media Management', description: 'Manage social media during event', priority: 'medium', durationQuantity: '3', durationUnit: 'days' },
        { id: 19, task: 'Post-Event Report', description: 'Prepare post-event report', priority: 'low', durationQuantity: '5', durationUnit: 'days' },
        { id: 20, task: 'Follow-up Communications', description: 'Send follow-up emails to attendees', priority: 'low', durationQuantity: '3', durationUnit: 'days' },
      ],
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState(null);

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

  const handleUseTemplate = (template) => {
    // Navigate to create event page with template data
    if (navigate) {
      navigate('create-event');
      // TODO: Pass template data to event wizard
    }
  };

  const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      high: 'danger',
      medium: 'warning',
      low: 'success',
    };
    return <Badge variant={variants[priority] || 'primary'}>{capitalizeFirst(priority)}</Badge>;
  };

  const formatDuration = (quantity, unit) => {
    if (!quantity) return 'N/A';
    return `${quantity} ${unit}`;
  };

  return (
    <div className="theme-1">
      <Header
        logo="https://via.placeholder.com/48x48/667eea/ffffff?text=EMS"
        title="Templates"
        subtitle="Browse and use event templates with pre-configured tasks"
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
            active: true,
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
        {templates.length === 0 ? (
          <Card>
            <EmptyState
              icon="📋"
              title="No Templates Available"
              description="Templates will appear here once they are created"
            />
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {templates.map((template) => (
              <Card key={template.id}>
                {/* Section Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '2px solid var(--border-color)',
                }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h2 style={{ 
                      margin: '0 0 0.5rem 0', 
                      color: 'var(--text-primary)',
                      fontSize: '1.5rem',
                      fontWeight: '700',
                    }}>
                      {template.eventName}
                    </h2>
                    <p style={{ 
                      margin: 0, 
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                    }}>
                      {template.eventInfo}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <Badge variant="primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                      {template.tasks.length} Tasks
                    </Badge>
                    <Button
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use This Template
                    </Button>
                  </div>
                </div>

                {/* Tasks Table Section */}
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Tasks in this template
                  </div>
                  
                  {/* Table Header */}
                  <div 
                    className="templates-task-header"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 3fr 120px 120px',
                      gap: '1rem',
                      padding: '0.875rem 1rem',
                      background: 'var(--primary-gradient)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '0.5rem',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Task
                    </div>
                    <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Description
                    </div>
                    <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Priority
                    </div>
                    <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Duration
                    </div>
                  </div>

                  {/* Scrollable Tasks List */}
                  <div 
                    className="custom-scrollbar"
                    style={{
                      maxHeight: '400px', // Shows approximately 4-5 rows
                      minHeight: '320px', // Ensures at least 4 rows are visible
                      overflowY: 'auto',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-primary)',
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'var(--border-color) var(--bg-secondary)',
                    }}
                  >
                    {template.tasks.map((task, index) => (
                      <div
                        key={task.id}
                        className="templates-task-row"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 3fr 120px 120px',
                          gap: '1rem',
                          padding: '1rem',
                          borderBottom: index < template.tasks.length - 1 ? '1px solid var(--border-color)' : 'none',
                          alignItems: 'center',
                          transition: 'background 0.2s ease',
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
                          <span className="templates-task-label">Task:</span>
                          {task.task}
                        </div>
                        <div style={{ 
                          color: 'var(--text-secondary)',
                          fontSize: '0.875rem',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                        }}>
                          <span className="templates-task-label">Description:</span>
                          {task.description}
                        </div>
                        <div>
                          {getPriorityBadge(task.priority)}
                        </div>
                        <div style={{ 
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem',
                        }}>
                          {formatDuration(task.durationQuantity, task.durationUnit)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplatesPage;

