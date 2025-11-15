import React, { useState } from 'react';
import './ScheduleTable.css';
import ScheduleEditModal from './ScheduleEditModal';

const EditPopupDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleEditClick = () => {
    // Sample task data matching schedule-table-pro.html
    const sampleTask = {
      id: 1,
      title: 'Design System Update',
      priority: 'high',
      duration: 8,
      owners: ['Alice Johnson', 'Bob Lee'],
      start: '2025-11-15T09:00',
      end: '2025-11-15T17:00'
    };
    setEditingTask(sampleTask);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSave = (updatedTask) => {
    console.log('Task saved:', updatedTask);
    // Here you would typically save to backend or update state
    handleClose();
  };

  return (
    <div 
      className="edit-popup-demo-page" 
      style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', 
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleEditClick}
          className="px-6 py-3 bg-white text-primary rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary shadow-md hover:shadow-lg font-semibold transition-all transform hover:-translate-y-0.5"
          style={{ 
            fontSize: '1.125rem',
            minWidth: '200px'
          }}
        >
          Edit
        </button>
      </div>

      <ScheduleEditModal
        task={editingTask}
        isOpen={isModalOpen}
        onClose={handleClose}
        onSave={handleSave}
      />
    </div>
  );
};

export default EditPopupDemo;

