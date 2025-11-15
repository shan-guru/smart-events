import React, { useState } from 'react';
import './TaskList.css';

const TaskList = ({ tasks, onUpdateTasks }) => {
  const [editingId, setEditingId] = useState(null);
  const [editTask, setEditTask] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  
  const MAX_DESCRIPTION_LENGTH = 100; // Characters to show before truncation

  const handleEdit = (task, index) => {
    setEditingId(index);
    setEditTask({ ...task });
  };

  const handleSave = (index) => {
    // Normalize duration
    let duration = null;
    if (editTask.estimated_duration) {
      if (typeof editTask.estimated_duration === 'object' && editTask.estimated_duration !== null) {
        if (editTask.estimated_duration.quantity && editTask.estimated_duration.unit) {
          duration = {
            quantity: parseFloat(editTask.estimated_duration.quantity) || null,
            unit: editTask.estimated_duration.unit || 'hours',
          };
        }
      }
    }

    // Ensure task structure is consistent
    const normalizedTask = {
      task: editTask.task || '',
      description: editTask.description || '',
      priority: (editTask.priority || 'medium').toLowerCase(),
      estimated_duration: duration,
    };
    
    const updatedTasks = [...tasks];
    updatedTasks[index] = normalizedTask;
    onUpdateTasks(updatedTasks);
    setEditingId(null);
    setEditTask({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditTask({});
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const updatedTasks = tasks.filter((_, i) => i !== index);
      onUpdateTasks(updatedTasks);
    }
  };

  const handleAdd = () => {
    const newTask = {
      task: '',
      description: '',
      priority: 'medium',
      estimated_duration: {
        quantity: null,
        unit: 'hours',
      },
    };
    const updatedTasks = [...tasks, newTask];
    onUpdateTasks(updatedTasks);
    setEditingId(tasks.length);
    setEditTask(newTask);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      case 'medium':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.2L22 10l-6 5.8 1.4 8.2L12 19.8 6.6 24l1.4-8.2L2 10l7.6-.8L12 2z"/>
          </svg>
        );
      case 'low':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l1.5 4.5L18 8l-3 2.9 0.9 5.1L12 15.4 8.1 16l0.9-5.1L6 8l4.5-1.5L12 2z"/>
          </svg>
        );
      default:
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="3"/>
          </svg>
        );
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '';
    
    // Handle new format: {quantity, unit}
    if (typeof duration === 'object' && duration !== null) {
      if (duration.quantity && duration.unit) {
        return `${duration.quantity} ${duration.unit}`;
      }
      return '';
    }
    
    // Handle legacy string format
    if (typeof duration === 'string') {
      let trimmed = duration
        .replace(/\s*\([^)]*\)/g, '')
        .replace(/\s*lead\s*time/gi, '')
        .replace(/\s*estimated/gi, '')
        .trim();
      
      if (trimmed.length > 15) {
        trimmed = trimmed.split(/[,\-]/)[0].trim();
      }
      return trimmed;
    }
    
    return '';
  };

  if (tasks.length === 0) {
    return (
      <div className="task-list-container">
        <div className="empty-state">
          <p>No tasks yet. Generate tasks or add one manually.</p>
          <button onClick={handleAdd} className="btn btn-primary">
            Add First Task
          </button>
        </div>
      </div>
    );
  }

  const truncateDescription = (text) => {
    if (!text) return '';
    if (text.length <= MAX_DESCRIPTION_LENGTH) return text;
    return text.substring(0, MAX_DESCRIPTION_LENGTH) + '...';
  };

  const toggleExpand = (index) => {
    setExpandedId(expandedId === index ? null : index);
  };

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <div className="header-content">
          <div className="header-title-section">
            <h2>Tasks</h2>
            <span className="task-count-badge">{tasks.length}</span>
          </div>
          <button onClick={handleAdd} className="btn btn-primary btn-add">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Task
          </button>
        </div>
      </div>

      <div className="tasks-grid">
        {tasks.map((task, index) => (
          <div key={index} className="task-card">
            {editingId === index ? (
              <div className="task-edit-form">
                <div className="form-group">
                  <label>Task *</label>
                  <input
                    type="text"
                    value={editTask.task || ''}
                    onChange={(e) =>
                      setEditTask({ ...editTask, task: e.target.value })
                    }
                    placeholder="Task name/title"
                    className="task-input"
                  />
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={editTask.description || ''}
                    onChange={(e) =>
                      setEditTask({ ...editTask, description: e.target.value })
                    }
                    placeholder="Detailed description of the task"
                    className="task-input"
                    rows="3"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={editTask.priority || 'medium'}
                      onChange={(e) =>
                        setEditTask({ ...editTask, priority: e.target.value })
                      }
                      className="select-input"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Estimated Duration</label>
                    <div className="duration-input-group">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={editTask.estimated_duration?.quantity || ''}
                        onChange={(e) =>
                          setEditTask({
                            ...editTask,
                            estimated_duration: {
                              ...(editTask.estimated_duration || { unit: 'hours' }),
                              quantity: e.target.value ? parseFloat(e.target.value) : null,
                            },
                          })
                        }
                        placeholder="Quantity"
                        className="text-input duration-quantity"
                      />
                      <input
                        type="text"
                        value={editTask.estimated_duration?.unit || ''}
                        onChange={(e) =>
                          setEditTask({
                            ...editTask,
                            estimated_duration: {
                              ...(editTask.estimated_duration || { quantity: null }),
                              unit: e.target.value,
                            },
                          })
                        }
                        placeholder="Unit (hours/days)"
                        className="text-input duration-unit"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    onClick={() => handleSave(index)}
                    className="btn btn-success"
                    disabled={!editTask.task?.trim() || !editTask.description?.trim()}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div 
                  className="task-content"
                  onClick={() => toggleExpand(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3 className="task-title">{task.task}</h3>
                  <p className="task-description">
                    {expandedId === index 
                      ? task.description 
                      : truncateDescription(task.description)}
                    {task.description && task.description.length > MAX_DESCRIPTION_LENGTH && (
                      <span className="expand-dots" title={expandedId === index ? 'Click to collapse' : 'Click to expand'}>
                        <span className="dots">⋯</span>
                      </span>
                    )}
                  </p>
                  <div className="task-meta-row" onClick={(e) => e.stopPropagation()}>
                    <div className="task-meta-left">
                      <span
                        className="priority-icon-wrapper"
                        style={{
                          color: getPriorityColor(task.priority),
                        }}
                      >
                        <span className="priority-icon">
                          {getPriorityIcon(task.priority)}
                        </span>
                        <span className="priority-tooltip">
                          {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'} Priority
                        </span>
                      </span>
                      {task.estimated_duration && (
                        <span className="time-badge">
                          ⏱ {formatDuration(task.estimated_duration)}
                        </span>
                      )}
                    </div>
                    <div className="task-actions">
                      <button
                        onClick={() => handleEdit(task, index)}
                        className="btn-icon btn-edit"
                        title="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="btn-icon btn-delete"
                        title="Delete"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;

