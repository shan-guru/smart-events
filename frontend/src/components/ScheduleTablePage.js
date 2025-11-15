import React, { useState, useCallback, useRef } from 'react';
import './ScheduleTable.css';
import ScheduleEditModal from './ScheduleEditModal';
import OwnersListModal from './ScheduleOwnersListModal';

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High', class: 'priority-high' },
  { value: 'medium', label: 'Medium', class: 'priority-medium' },
  { value: 'low', label: 'Low', class: 'priority-low' },
];

// Draggable Row Component
const DraggableRow = ({ task, index, moveRow, onEdit }) => {
  const ref = useRef(null);

  // Native HTML5 drag and drop
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (ref.current) {
      ref.current.style.backgroundColor = '#eef2ff';
    }
  };

  const handleDragLeave = (e) => {
    if (ref.current) {
      ref.current.style.backgroundColor = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const dropIndex = index;
    if (dragIndex !== dropIndex && !isNaN(dragIndex)) {
      moveRow(dragIndex, dropIndex);
    }
    if (ref.current) {
      ref.current.style.backgroundColor = '';
    }
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '';
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'Not set';
    try {
      const date = new Date(dateTimeStr);
      const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric'
      });
      let hour = date.getHours();
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      return `${dateStr}, ${hour} ${ampm}`;
    } catch {
      return dateTimeStr;
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div
      ref={ref}
      className="table-row-hover flex items-center border-b border-gray-200 bg-white"
      style={{ cursor: 'move' }}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      aria-label={`Task: ${task.title}`}
    >
      <div className="px-4 py-3 text-center w-12 flex-shrink-0 flex items-center justify-center">
        <div className="drag-handle text-gray-400 w-5 h-5 inline-flex items-center justify-center" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="12" r="1"></circle>
            <circle cx="9" cy="5" r="1"></circle>
            <circle cx="9" cy="19" r="1"></circle>
            <circle cx="15" cy="12" r="1"></circle>
            <circle cx="15" cy="5" r="1"></circle>
            <circle cx="15" cy="19" r="1"></circle>
          </svg>
        </div>
        <span className="sr-only">Drag to reorder</span>
      </div>
      <div className="px-4 py-3 font-medium text-gray-900 flex-1 min-w-0 flex items-center">{task.title}</div>
      <div className="px-4 py-3 w-24 flex-shrink-0 flex items-center">
        <span className={`priority-badge rounded-full text-xs font-medium border ${PRIORITY_OPTIONS.find(p => p.value === task.priority)?.class || 'priority-medium'}`}>
          {PRIORITY_OPTIONS.find(p => p.value === task.priority)?.label || 'Medium'}
        </span>
      </div>
      <div className="px-4 py-3 text-gray-600 w-24 flex-shrink-0 flex items-center">{task.duration} hrs</div>
      <div className="px-4 py-3 w-32 flex-shrink-0 flex items-center">
        {task.owners && task.owners.length > 0 ? (
          <button
            onClick={() => onEdit && onEdit.showOwners ? onEdit.showOwners(task.owners) : null}
            className="flex -space-x-2 items-center cursor-pointer hover:opacity-80 transition-opacity group border-0 bg-transparent p-0"
            style={{ border: 'none', outline: 'none' }}
            aria-label={`View ${task.owners.length} owner(s)`}
          >
            {task.owners.map((owner, i) => (
              <span
                key={i}
                className={`owner-initial ${i === 0 ? 'bg-blue-600' : i === 1 ? 'bg-green-600' : 'bg-purple-600'} group-hover:ring-2 group-hover:ring-primary group-hover:ring-offset-1 transition-all`}
                style={{ border: 'none' }}
                title={owner}
                aria-label={`Owner: ${owner}`}
              >
                {getInitials(owner)}
              </span>
            ))}
          </button>
        ) : (
          <span className="text-gray-400 text-sm">None</span>
        )}
      </div>
      <div className="px-4 py-3 text-sm text-gray-600 w-40 flex-shrink-0 whitespace-nowrap flex items-center">{formatDateTime(task.start)}</div>
      <div className="px-4 py-3 text-sm text-gray-600 w-40 flex-shrink-0 whitespace-nowrap flex items-center">{formatDateTime(task.end)}</div>
      <div className="px-4 py-3 text-center w-12 flex-shrink-0 flex items-center justify-center">
        <button
          onClick={() => onEdit && onEdit.edit ? onEdit.edit(task) : null}
          className="text-primary hover:text-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 p-1 border-0 bg-transparent"
          style={{ border: 'none', outline: 'none' }}
          aria-label="Edit task"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

const ScheduleTablePage = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Design System Update', priority: 'high', duration: 8, owners: ['Alice Johnson', 'Bob Lee'], start: '2025-11-15T09:00', end: '2025-11-15T17:00' },
    { id: 2, title: 'API Integration', priority: 'medium', duration: 6, owners: ['Charlie Kim'], start: '2025-11-16T10:00', end: '2025-11-16T16:00' },
    { id: 3, title: 'User Testing Session', priority: 'low', duration: 4, owners: ['Diana Prince', 'Eve Adams'], start: '2025-11-17T13:00', end: '2025-11-17T17:00' },
  ]);

  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ownersModalOpen, setOwnersModalOpen] = useState(false);
  const [selectedOwners, setSelectedOwners] = useState([]);

  const moveRow = useCallback((fromIndex, toIndex) => {
    setTasks((prevTasks) => {
      const newTasks = [...prevTasks];
      const [moved] = newTasks.splice(fromIndex, 1);
      newTasks.splice(toIndex, 0, moved);
      return newTasks;
    });
  }, []);

  const handleEdit = (task) => {
    setEditingTask({ ...task });
    setIsModalOpen(true);
  };

  const handleSave = (updatedTask) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? { ...updatedTask, id: t.id } : t));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleShowOwners = (owners) => {
    setSelectedOwners(owners || []);
    setOwnersModalOpen(true);
  };

  const handleCloseOwnersModal = () => {
    setOwnersModalOpen(false);
    setSelectedOwners([]);
  };

  return (
    <div className="schedule-table-page" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', backgroundAttachment: 'fixed', padding: '2rem 0' }}>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="table-container">
          <div className="table-header">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">Task Schedule</h1>
                <p className="text-sm text-white-90 mt-1">Drag rows to reorder tasks</p>
              </div>
              <button
                onClick={() => {
                  const newTask = {
                    id: Date.now(),
                    title: 'New Task',
                    priority: 'medium',
                    duration: 0,
                    owners: [],
                    start: '',
                    end: ''
                  };
                  setTasks([...tasks, newTask]);
                  setEditingTask({
                    ...newTask,
                    startHour: '9',
                    startAMPM: 'AM',
                    endHour: '5',
                    endAMPM: 'PM'
                  });
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-white text-primary rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold"
              >
                + Add Row
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <div className="overflow-x-auto">
              {/* Header Row */}
              <div className="table-header-bg border-b-2 border-gray-300 flex items-center sticky top-0 z-10">
                <div className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12 flex-shrink-0">
                  <span className="sr-only">Reorder</span>
                </div>
                <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex-1 min-w-0">Task Title</div>
                <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 flex-shrink-0">Priority</div>
                <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 flex-shrink-0">Duration</div>
                <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 flex-shrink-0">Owners</div>
                <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 flex-shrink-0 whitespace-nowrap">Start</div>
                <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 flex-shrink-0 whitespace-nowrap">End</div>
                <div className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12 flex-shrink-0">
                  <span className="sr-only">Actions</span>
                </div>
              </div>
              
              {/* Draggable Rows */}
              <div className="bg-white">
                {tasks.map((task, index) => (
                  <DraggableRow
                    key={task.id}
                    task={task}
                    index={index}
                    moveRow={moveRow}
                    onEdit={{ edit: handleEdit, showOwners: handleShowOwners }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <ScheduleEditModal
          task={editingTask}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
        />

        <OwnersListModal
          owners={selectedOwners}
          isOpen={ownersModalOpen}
          onClose={handleCloseOwnersModal}
        />
      </div>
    </div>
  );
};

export default ScheduleTablePage;
