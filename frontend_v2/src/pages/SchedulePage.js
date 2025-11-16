import React, { useState } from 'react';
import '../themes/Theme1.css';
import ScheduleList from '../components/schedule/ScheduleList';
import CreateScheduleForm from '../components/schedule/CreateScheduleForm';
import Modal from '../components/ui/Modal';

function SchedulePage() {
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const handleCreateNew = () => {
    setEditingSchedule(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setIsEditModalOpen(true);
  };

  const handleDelete = (schedule) => {
    if (window.confirm(`Are you sure you want to delete "${schedule.scheduleName || schedule.name}"?`)) {
      setSchedules(schedules.filter(s => s.id !== schedule.id));
    }
  };

  const handleCreateSubmit = (formData) => {
    const newSchedule = {
      id: Date.now(),
      ...formData,
    };
    setSchedules([...schedules, newSchedule]);
    setIsCreateModalOpen(false);
  };

  const handleEditSubmit = (formData) => {
    setSchedules(schedules.map(s => 
      s.id === editingSchedule.id 
        ? { ...s, ...formData }
        : s
    ));
    setIsEditModalOpen(false);
    setEditingSchedule(null);
  };

  const handleReorder = (reorderedSchedules) => {
    setSchedules(reorderedSchedules);
  };

  return (
    <div className="theme-1">
      <div className="app-container">
        <div className="header">
          <h1>Schedules</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
            Manage and organize your schedules
          </p>
        </div>

        <ScheduleList
          schedules={schedules}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateNew={handleCreateNew}
          onReorder={handleReorder}
        />

        {/* Create Schedule Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Schedule"
        >
          <CreateScheduleForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>

        {/* Edit Schedule Modal */}
        {editingSchedule && (
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingSchedule(null);
            }}
            title="Edit Schedule"
          >
            <CreateScheduleForm
              initialData={editingSchedule}
              onSubmit={handleEditSubmit}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingSchedule(null);
              }}
            />
          </Modal>
        )}
      </div>
    </div>
  );
}

export default SchedulePage;

