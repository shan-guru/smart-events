import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CreateEventForm from './CreateEventForm';
import ScheduleTable from './ScheduleTable';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const EventWizard = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  
  const [eventDetails, setEventDetails] = useState({
    eventName: '',
    eventInfo: '',
    startDate: '',
    endDate: '',
    eventDate: '',
  });

  const [scheduledTasks, setScheduledTasks] = useState([
    {
      taskTitle: 'Setup Event Venue',
      priority: 'high',
      durationQuantity: '4',
      durationUnit: 'hours',
      owners: ['John Doe', 'Jane Smith'],
      startDate: '2025-11-20',
      startHour: '9',
      startAMPM: 'AM',
      endDate: '2025-11-20',
      endHour: '1',
      endAMPM: 'PM',
    },
    {
      taskTitle: 'Prepare Presentation Materials',
      priority: 'medium',
      durationQuantity: '6',
      durationUnit: 'hours',
      owners: ['Alice Johnson'],
      startDate: '2025-11-19',
      startHour: '10',
      startAMPM: 'AM',
      endDate: '2025-11-19',
      endHour: '4',
      endAMPM: 'PM',
    },
    {
      taskTitle: 'Coordinate with Vendors',
      priority: 'high',
      durationQuantity: '2',
      durationUnit: 'days',
      owners: ['Bob Lee', 'Charlie Kim', 'Diana Prince'],
      startDate: '2025-11-18',
      startHour: '8',
      startAMPM: 'AM',
      endDate: '2025-11-19',
      endHour: '5',
      endAMPM: 'PM',
    },
    {
      taskTitle: 'Final Review Meeting',
      priority: 'low',
      durationQuantity: '2',
      durationUnit: 'hours',
      owners: ['Eve Adams'],
      startDate: '2025-11-21',
      startHour: '2',
      startAMPM: 'PM',
      endDate: '2025-11-21',
      endHour: '4',
      endAMPM: 'PM',
    },
  ]);

  const steps = [
    { id: 1, title: 'Event Details', icon: '📋' },
    { id: 2, title: 'Add Tasks', icon: '✅' },
    { id: 3, title: 'Assign Members', icon: '👥' },
    { id: 4, title: 'Arrive Schedule', icon: '📅' },
    { id: 5, title: 'Finalize Plan', icon: '🎯' },
  ];

  const handleStepClick = (stepId) => {
    // Allow navigation to any step
    setCurrentStep(stepId);
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEventDetailsSubmit = (data) => {
    setEventDetails(data);
    handleNext();
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete({
        ...eventDetails,
        // Add other step data here when implemented
      });
    }
  };

  const getStepStatus = (stepId) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    if (stepId < currentStep) return 'completed';
    return 'pending';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CreateEventForm
            onSubmit={handleEventDetailsSubmit}
            initialData={eventDetails}
          />
        );
      case 2:
        return (
          <Card>
            <div className="section-title">Add Tasks</div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Task management will be implemented here
            </p>
          </Card>
        );
      case 3:
        return (
          <Card>
            <div className="section-title">Assign Members</div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Member assignment will be implemented here
            </p>
          </Card>
        );
      case 4:
        return (
          <ScheduleTable
            tasks={scheduledTasks}
            onUpdateTasks={setScheduledTasks}
          />
        );
      case 5:
        return (
          <Card>
            <div className="section-title">Finalize Plan</div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Review and finalize your event plan
            </p>
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Event Summary</h3>
              <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}><strong>Event Name:</strong> {eventDetails.eventName || 'N/A'}</p>
                <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}><strong>Start Date:</strong> {eventDetails.startDate || 'N/A'}</p>
                <p style={{ color: 'var(--text-primary)' }}><strong>End Date:</strong> {eventDetails.endDate || 'N/A'}</p>
              </div>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="theme-1">
      <div className="app-container">
        <div className="header">
          <h1>Create New Event</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
            Follow the steps below to create your event plan
          </p>
        </div>

        <Card>
          <div className="wizard-steps" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '3rem',
            position: 'relative',
            padding: '2rem 0'
          }}>
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const isCompleted = status === 'completed';
              const isCurrent = status === 'current';
              
              return (
                <React.Fragment key={step.id}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flex: 1,
                      position: 'relative',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleStepClick(step.id)}
                  >
                    <div
                      style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '50%',
                        background: isCompleted || isCurrent 
                          ? 'var(--primary-gradient)' 
                          : 'var(--bg-secondary)',
                        color: isCompleted || isCurrent ? 'white' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '1.25rem',
                        marginBottom: '0.5rem',
                        border: isCurrent ? '3px solid var(--primary-color)' : 'none',
                        boxShadow: isCurrent ? 'var(--shadow-glow)' : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {isCompleted ? '✓' : step.icon}
                    </div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: isCurrent ? '700' : '500',
                      color: isCurrent || isCompleted ? 'var(--primary-color)' : 'var(--text-secondary)',
                      textAlign: 'center'
                    }}>
                      {step.title}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '1.5rem',
                          left: 'calc(50% + 1.5rem)',
                          right: '-50%',
                          height: '2px',
                          background: isCompleted 
                            ? 'var(--primary-gradient)' 
                            : 'var(--border-color)',
                          zIndex: -1,
                        }}
                      />
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            {renderStepContent()}
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            paddingTop: '2rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div>
              {onCancel && (
                <Button variant="secondary" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {currentStep > 1 && (
                <Button variant="secondary" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
              {currentStep < steps.length ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleComplete}>
                  Complete
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

EventWizard.propTypes = {
  onComplete: PropTypes.func,
  onCancel: PropTypes.func,
};

export default EventWizard;

