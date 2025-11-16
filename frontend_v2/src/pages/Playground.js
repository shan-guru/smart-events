import React, { useState } from 'react';
import '../themes/Theme1.css';

// UI Components
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Tabs from '../components/ui/Tabs';
import EmptyState from '../components/ui/EmptyState';
import StatCard from '../components/ui/StatCard';
import ToastContainer from '../components/ui/ToastContainer';

// Hooks
import useToast from '../hooks/useToast';

// Events Components
import EventList from '../components/events/EventList';
import CreateEventForm from '../components/events/CreateEventForm';
import EventWizard from '../components/events/EventWizard';
import ScheduleList from '../components/schedule/ScheduleList';

function Playground() {
  const { toasts, showSuccess, showError, showWarning, showInfo, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState('ui-components');
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [events, setEvents] = useState([
    {
      id: 1,
      eventName: 'Product Launch',
      startDate: '2025-11-15',
      endDate: '2025-11-17',
    },
    {
      id: 2,
      eventName: 'Annual Conference',
      startDate: '2025-12-20',
      endDate: '2025-12-22',
    },
  ]);
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      taskTitle: 'Morning Meeting',
      priority: 'high',
      durationQuantity: '1',
      durationUnit: 'hour',
      owners: ['John Doe', 'Jane Smith'],
      startDate: '2025-11-15',
      startHour: '9',
      startAMPM: 'AM',
      endDate: '2025-11-15',
      endHour: '10',
      endAMPM: 'AM',
    },
    {
      id: 2,
      taskTitle: 'Team Standup',
      priority: 'medium',
      durationQuantity: '30',
      durationUnit: 'minutes',
      owners: ['Alice Johnson'],
      startDate: '2025-12-20',
      startHour: '10',
      startAMPM: 'AM',
      endDate: '2025-12-20',
      endHour: '10',
      endAMPM: 'AM',
    },
  ]);
  const [showWizard, setShowWizard] = useState(false);

  const uiTabs = [
    { id: 'buttons', label: 'Buttons' },
    { id: 'cards', label: 'Cards' },
    { id: 'modals', label: 'Modals' },
    { id: 'inputs', label: 'Inputs' },
    { id: 'badges', label: 'Badges' },
    { id: 'tabs', label: 'Tabs' },
    { id: 'empty-states', label: 'Empty States' },
    { id: 'stat-cards', label: 'Stat Cards' },
    { id: 'notifications', label: 'Notifications' },
  ];

  const [activeUITab, setActiveUITab] = useState('buttons');

  const handleEventSubmit = (data) => {
    const newEvent = {
      id: Date.now(),
      ...data,
    };
    setEvents([...events, newEvent]);
    setShowWizard(false);
  };

  const handleEventDelete = (event) => {
    setEvents(events.filter(e => e.id !== event.id));
  };

  const handleScheduleDelete = (schedule) => {
    setSchedules(schedules.filter(s => s.id !== schedule.id));
  };

  const handleScheduleReorder = (reorderedSchedules) => {
    setSchedules(reorderedSchedules);
  };

  if (showWizard) {
    return (
      <EventWizard
        onComplete={handleEventSubmit}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

  return (
    <div className="theme-1">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="app-container">
        <div className="header">
          <h1>Component Playground</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
            Test and preview all components before integration
          </p>
        </div>

        <Card>
          <Tabs
            tabs={[
              { id: 'ui-components', label: 'UI Components' },
              { id: 'events-components', label: 'Events Components' },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div style={{ marginTop: '2rem' }}>
            {activeTab === 'ui-components' && (
              <div>
                <Tabs
                  tabs={uiTabs}
                  activeTab={activeUITab}
                  onTabChange={setActiveUITab}
                />

                <div style={{ marginTop: '2rem' }}>
                  {activeUITab === 'buttons' && (
                    <div>
                      <div className="section-title">Buttons</div>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        <Button>Primary Button</Button>
                        <Button variant="secondary">Secondary Button</Button>
                        <Button disabled>Disabled Button</Button>
                        <Button icon="🚀">With Icon</Button>
                      </div>
                    </div>
                  )}

                  {activeUITab === 'cards' && (
                    <div>
                      <div className="section-title">Cards</div>
                      <div className="grid-layout" style={{ marginTop: '1rem' }}>
                        <Card>
                          <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Card Title</h3>
                          <p style={{ color: 'var(--text-secondary)' }}>
                            This is a sample card with some content. Cards have hover effects and shadows.
                          </p>
                        </Card>
                        <Card>
                          <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Another Card</h3>
                          <p style={{ color: 'var(--text-secondary)' }}>
                            Cards can contain any content and are great for organizing information.
                          </p>
                        </Card>
                      </div>
                    </div>
                  )}

                  {activeUITab === 'modals' && (
                    <div>
                      <div className="section-title">Modals</div>
                      <div style={{ marginTop: '1rem' }}>
                        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
                        <Modal
                          isOpen={modalOpen}
                          onClose={() => setModalOpen(false)}
                          title="Sample Modal"
                          footer={
                            <>
                              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={() => setModalOpen(false)}>
                                Confirm
                              </Button>
                            </>
                          }
                        >
                          <p style={{ color: 'var(--text-secondary)' }}>
                            This is a sample modal. It has a header, body, and footer sections.
                            Click outside or use the close button to dismiss it.
                          </p>
                        </Modal>
                      </div>
                    </div>
                  )}

                  {activeUITab === 'inputs' && (
                    <div>
                      <div className="section-title">Inputs</div>
                      <div style={{ maxWidth: '600px', marginTop: '1rem' }}>
                        <Input
                          label="Text Input"
                          placeholder="Enter text here"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                        />
                        <Input
                          type="number"
                          label="Number Input"
                          placeholder="Enter a number"
                        />
                        <Input
                          type="date"
                          label="Date Input"
                        />
                        <Input
                          type="textarea"
                          label="Textarea"
                          placeholder="Enter multiple lines of text"
                        />
                        <Input
                          label="Input with Error"
                          placeholder="This input has an error"
                          error="This field is required"
                        />
                      </div>
                    </div>
                  )}

                  {activeUITab === 'badges' && (
                    <div>
                      <div className="section-title">Badges</div>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        <Badge variant="primary">Primary</Badge>
                        <Badge variant="success">Success</Badge>
                        <Badge variant="warning">Warning</Badge>
                        <Badge variant="danger">Danger</Badge>
                      </div>
                    </div>
                  )}

                  {activeUITab === 'tabs' && (
                    <div>
                      <div className="section-title">Tabs</div>
                      <div style={{ marginTop: '1rem' }}>
                        <Tabs
                          tabs={[
                            { id: 'tab1', label: 'Tab 1' },
                            { id: 'tab2', label: 'Tab 2' },
                            { id: 'tab3', label: 'Tab 3' },
                          ]}
                          activeTab="tab1"
                          onTabChange={(id) => console.log('Tab changed:', id)}
                        />
                      </div>
                    </div>
                  )}

                  {activeUITab === 'empty-states' && (
                    <div>
                      <div className="section-title">Empty States</div>
                      <div style={{ marginTop: '1rem' }}>
                        <Card>
                          <EmptyState
                            icon="📅"
                            title="No Events Found"
                            description="There are no events to display at this time."
                            actionLabel="Create Event"
                            onAction={() => showInfo('Create event form will open.')}
                          />
                        </Card>
                      </div>
                    </div>
                  )}

                  {activeUITab === 'stat-cards' && (
                    <div>
                      <div className="section-title">Stat Cards</div>
                      <div className="grid-layout" style={{ marginTop: '1rem' }}>
                        <StatCard label="Total Events" value="24" />
                        <StatCard label="Active Tasks" value="156" />
                        <StatCard label="Team Members" value="42" />
                      </div>
                    </div>
                  )}

                  {activeUITab === 'notifications' && (
                    <div>
                      <div className="section-title">Notifications / Toasts</div>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Click the buttons below to see different types of notifications. Notifications automatically dismiss after 5 seconds, or you can close them manually.
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        <Button onClick={() => showSuccess('Event created successfully!')}>
                          Show Success
                        </Button>
                        <Button onClick={() => showError('Failed to save event. Please try again.')}>
                          Show Error
                        </Button>
                        <Button onClick={() => showWarning('Your session will expire in 5 minutes.')}>
                          Show Warning
                        </Button>
                        <Button onClick={() => showInfo('New update available. Check the settings page.')}>
                          Show Info
                        </Button>
                      </div>
                      <div style={{ marginTop: '2rem' }}>
                        <Card>
                          <h3 style={{ marginTop: 0, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                            Sample Notifications
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <strong>Success Notification:</strong>
                              </p>
                              <Button 
                                variant="secondary" 
                                onClick={() => showSuccess('Your changes have been saved successfully!')}
                              >
                                Save Changes
                              </Button>
                            </div>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <strong>Error Notification:</strong>
                              </p>
                              <Button 
                                variant="secondary" 
                                onClick={() => showError('Unable to connect to server. Please check your internet connection.')}
                              >
                                Test Connection
                              </Button>
                            </div>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <strong>Warning Notification:</strong>
                              </p>
                              <Button 
                                variant="secondary" 
                                onClick={() => showWarning('You have unsaved changes. Are you sure you want to leave?')}
                              >
                                Leave Page
                              </Button>
                            </div>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <strong>Info Notification:</strong>
                              </p>
                              <Button 
                                variant="secondary" 
                                onClick={() => showInfo('Event "Product Launch" starts in 2 hours.')}
                              >
                                Check Event
                              </Button>
                            </div>
                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <strong>Multiple Notifications:</strong>
                              </p>
                              <Button 
                                onClick={() => {
                                  showSuccess('Task completed!');
                                  setTimeout(() => showInfo('3 new tasks assigned to you.'), 500);
                                  setTimeout(() => showWarning('Deadline approaching for "Team Standup"'), 1000);
                                }}
                              >
                                Show Multiple
                              </Button>
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <strong>Long Duration Notification:</strong>
                              </p>
                              <Button 
                                variant="secondary" 
                                onClick={() => showInfo('This notification will stay for 10 seconds.', 10000)}
                              >
                                Show Long Duration
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'events-components' && (
              <div>
                <div className="section-title">Events Components</div>
                
                <div style={{ marginTop: '2rem' }}>
                  <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Event Wizard</h3>
                      <Button onClick={() => setShowWizard(true)}>Open Event Wizard</Button>
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Click the button above to open the multi-step event creation wizard.
                    </p>
                  </Card>
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <CreateEventForm
                    onSubmit={(data) => {
                      const newEvent = {
                        id: Date.now(),
                        ...data,
                      };
                      setEvents([...events, newEvent]);
                      showSuccess('Event created successfully! Check Event List below.');
                    }}
                    onCancel={() => showInfo('Event creation cancelled.')}
                  />
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <EventList
                    events={events}
                    onEdit={(event) => showInfo(`Editing event: ${event.eventName}`)}
                    onDelete={(event) => {
                      handleEventDelete(event);
                      showSuccess(`Event "${event.eventName || event.name}" deleted successfully.`);
                    }}
                    onCreateNew={() => setShowWizard(true)}
                  />
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <ScheduleList
                    schedules={schedules}
                    onEdit={(schedule) => showInfo(`Editing schedule: ${schedule.taskTitle || schedule.scheduleName || schedule.name}`)}
                    onDelete={(schedule) => {
                      handleScheduleDelete(schedule);
                      showSuccess('Schedule deleted successfully.');
                    }}
                    onCreateNew={() => showInfo('Create schedule form will open.')}
                    onReorder={(newSchedules) => {
                      handleScheduleReorder(newSchedules);
                      showSuccess('Schedule order updated.');
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Playground;
