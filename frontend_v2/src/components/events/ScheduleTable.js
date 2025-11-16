import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import './ScheduleTable.css';

const ScheduleTable = ({ tasks = [], onUpdateTasks }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDateTime = (dateString, hour, ampm) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
    };
    const dateStr = date.toLocaleDateString('en-US', options);
    if (hour && ampm) {
      return `${dateStr} ${hour} ${ampm}`;
    }
    return dateStr;
  };

  const formatDuration = (quantity, unit) => {
    if (!quantity || !unit) return 'N/A';
    return `${quantity} ${unit}`;
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newTasks = [...tasks];
    const draggedTask = newTasks[draggedIndex];
    newTasks.splice(draggedIndex, 1);
    newTasks.splice(dropIndex, 0, draggedTask);
    
    if (onUpdateTasks) {
      onUpdateTasks(newTasks);
    }
    setDraggedIndex(null);
  };

  const handleEdit = (task, index) => {
    setEditingTask({ ...task, index });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedTask) => {
    const newTasks = [...tasks];
    newTasks[updatedTask.index] = {
      ...updatedTask,
      index: undefined, // Remove index from task object
    };
    if (onUpdateTasks) {
      onUpdateTasks(newTasks);
    }
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleAddNew = () => {
    const newTask = {
      taskTitle: '',
      priority: 'medium',
      durationQuantity: '',
      durationUnit: 'hours',
      owners: [],
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
    };
    setEditingTask({ ...newTask, index: tasks.length });
    setIsEditModalOpen(true);
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <div className="section-title">Schedule Tasks</div>
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem 2rem',
          color: 'var(--text-secondary)'
        }}>
          <p style={{ marginBottom: '1.5rem' }}>No tasks scheduled yet</p>
          <Button onClick={handleAddNew}>Add First Task</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="section-title">Schedule Tasks</div>
        <Button onClick={handleAddNew}>+ Add Task</Button>
      </div>

      <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
        {/* Grid Header */}
        <div className="schedule-table-header" style={{
        display: 'grid',
        gridTemplateColumns: '50px 2fr 120px 120px 150px 180px 180px 60px',
        gap: '1rem',
        padding: '1rem 1.5rem',
        background: 'var(--primary-gradient)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '0.5rem',
        alignItems: 'center',
        minWidth: '1000px',
      }}>
        <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Move</div>
        <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task Title</div>
        <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</div>
        <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</div>
        <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owners</div>
        <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Start Date & Time</div>
        <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>End Date & Time</div>
        <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Edit</div>
      </div>

      {/* Grid Rows */}
      <div>
        {tasks.map((task, index) => (
          <div
            key={index}
            className="schedule-table-row"
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            style={{
              display: 'grid',
              gridTemplateColumns: '50px 2fr 120px 120px 150px 180px 180px 60px',
              gap: '1rem',
              padding: '1.25rem 1.5rem',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '0.5rem',
              alignItems: 'center',
              cursor: 'grab',
              transition: 'all 0.2s ease',
              minWidth: '1000px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-primary)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Move Icon */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="var(--text-secondary)" 
                strokeWidth="2"
                style={{ cursor: 'grab' }}
              >
                <circle cx="9" cy="12" r="1"></circle>
                <circle cx="9" cy="5" r="1"></circle>
                <circle cx="9" cy="19" r="1"></circle>
                <circle cx="15" cy="12" r="1"></circle>
                <circle cx="15" cy="5" r="1"></circle>
                <circle cx="15" cy="19" r="1"></circle>
              </svg>
            </div>

            {/* Task Title */}
            <div style={{ 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: 0
            }}>
              <span className="mobile-label">Task Title:</span>
              <span style={{ minWidth: 0 }}>{task.taskTitle || 'Untitled Task'}</span>
            </div>

            {/* Priority */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Badge variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}>
                {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)}
              </Badge>
            </div>

            {/* Duration */}
            <div style={{ 
              color: 'var(--text-primary)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              minWidth: 0
            }}>
              <span style={{ minWidth: 0 }}>{formatDuration(task.durationQuantity, task.durationUnit)}</span>
            </div>

            {/* Owners */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="mobile-label">Owners:</span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {task.owners && task.owners.length > 0 ? (
                  task.owners.slice(0, 3).map((owner, i) => (
                    <div
                      key={i}
                      style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '50%',
                        background: i === 0 
                          ? 'var(--primary-gradient)' 
                          : i === 1 
                          ? 'var(--secondary-gradient)' 
                          : 'var(--accent-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}
                      title={owner}
                    >
                      {getInitials(owner)}
                    </div>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>No owners</span>
                )}
              </div>
            </div>

            {/* Start Date & Time */}
            <div style={{ 
              color: 'var(--text-primary)', 
              fontSize: '0.875rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              lineHeight: '1.3',
              minWidth: 0
            }}>
              <span className="mobile-label">Start:</span>
              <span style={{ minWidth: 0 }}>{formatDateTime(task.startDate, task.startHour, task.startAMPM)}</span>
            </div>

            {/* End Date & Time */}
            <div style={{ 
              color: 'var(--text-primary)', 
              fontSize: '0.875rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              lineHeight: '1.3',
              minWidth: 0
            }}>
              <span className="mobile-label">End:</span>
              <span style={{ minWidth: 0 }}>{formatDateTime(task.endDate, task.endHour, task.endAMPM)}</span>
            </div>

            {/* Edit Icon */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => handleEdit(task, index)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--primary-color)',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                aria-label="Edit task"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        title="Edit Task Schedule"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingTask(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => {
              if (editingTask) {
                handleSaveEdit(editingTask);
              }
            }}>
              Save Changes
            </Button>
          </>
        }
      >
        <ScheduleEditForm
          task={editingTask}
          onChange={(updatedTask) => setEditingTask(updatedTask)}
        />
      </Modal>
    </Card>
  );
};

const ScheduleEditForm = ({ task, onChange }) => {
  if (!task) return null;

  const handleChange = (field, value) => {
    onChange({
      ...task,
      [field]: value,
    });
  };

  return (
    <div style={{ maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', marginBottom: '1rem' }}>
        <Input
          type="text"
          label="Task Title"
          value={task.taskTitle || ''}
          onChange={(e) => handleChange('taskTitle', e.target.value)}
          required
          style={{ marginBottom: 0, width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: 'var(--text-primary)',
        }}>
          Priority
        </label>
        <select
          value={task.priority || 'medium'}
          onChange={(e) => handleChange('priority', e.target.value)}
          className="input-field"
          style={{ padding: '0.625rem 0.75rem' }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: 'var(--text-primary)',
        }}>
          Duration
        </label>
        <div className="schedule-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'end' }}>
          <div style={{ marginBottom: 0 }}>
            <Input
              type="number"
              label=""
              value={task.durationQuantity || ''}
              onChange={(e) => handleChange('durationQuantity', e.target.value)}
              placeholder="Qty"
              style={{ marginBottom: 0 }}
            />
          </div>
          <div style={{ marginBottom: 0 }}>
            <select
              value={task.durationUnit || 'hours'}
              onChange={(e) => handleChange('durationUnit', e.target.value)}
              className="input-field"
              style={{ width: '100%', marginBottom: 0, padding: '0.75rem 0.5rem' }}
            >
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1rem', width: '100%' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: 'var(--text-primary)',
        }}>
          Owners
        </label>
        <input
          type="text"
          value={task.owners ? task.owners.join(', ') : ''}
          onChange={(e) => {
            const owners = e.target.value.split(',').map(o => o.trim()).filter(o => o);
            handleChange('owners', owners);
          }}
          placeholder="John Doe, Jane Smith"
          className="input-field"
          style={{ width: '100%', marginBottom: 0, boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: 'var(--text-primary)',
        }}>
          Start Date & Time
        </label>
        <div className="schedule-form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.8fr', gap: '0.5rem', alignItems: 'end' }}>
          <div style={{ marginBottom: 0 }}>
            <Input
              type="date"
              label=""
              value={task.startDate || ''}
              onChange={(e) => handleChange('startDate', e.target.value)}
              style={{ marginBottom: 0 }}
            />
          </div>
          <div style={{ marginBottom: 0 }}>
            <Input
              type="number"
              label=""
              value={task.startHour || ''}
              onChange={(e) => handleChange('startHour', e.target.value)}
              placeholder="Hour"
              min="1"
              max="12"
              style={{ marginBottom: 0 }}
            />
          </div>
          <div style={{ marginBottom: 0 }}>
            <select
              value={task.startAMPM || 'AM'}
              onChange={(e) => handleChange('startAMPM', e.target.value)}
              className="input-field"
              style={{ width: '100%', marginBottom: 0, padding: '0.75rem 0.5rem' }}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: 'var(--text-primary)',
        }}>
          End Date & Time
        </label>
        <div className="schedule-form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.8fr', gap: '0.5rem', alignItems: 'end' }}>
          <div style={{ marginBottom: 0 }}>
            <Input
              type="date"
              label=""
              value={task.endDate || ''}
              onChange={(e) => handleChange('endDate', e.target.value)}
              style={{ marginBottom: 0 }}
            />
          </div>
          <div style={{ marginBottom: 0 }}>
            <Input
              type="number"
              label=""
              value={task.endHour || ''}
              onChange={(e) => handleChange('endHour', e.target.value)}
              placeholder="Hour"
              min="1"
              max="12"
              style={{ marginBottom: 0 }}
            />
          </div>
          <div style={{ marginBottom: 0 }}>
            <select
              value={task.endAMPM || 'PM'}
              onChange={(e) => handleChange('endAMPM', e.target.value)}
              className="input-field"
              style={{ width: '100%', marginBottom: 0, padding: '0.75rem 0.5rem' }}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

ScheduleTable.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      taskTitle: PropTypes.string,
      priority: PropTypes.oneOf(['low', 'medium', 'high']),
      durationQuantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      durationUnit: PropTypes.oneOf(['hours', 'days']),
      owners: PropTypes.arrayOf(PropTypes.string),
      startDate: PropTypes.string,
      startTime: PropTypes.string,
      startHour: PropTypes.string,
      startAMPM: PropTypes.oneOf(['AM', 'PM']),
      endDate: PropTypes.string,
      endTime: PropTypes.string,
      endHour: PropTypes.string,
      endAMPM: PropTypes.oneOf(['AM', 'PM']),
    })
  ),
  onUpdateTasks: PropTypes.func,
};

export default ScheduleTable;
