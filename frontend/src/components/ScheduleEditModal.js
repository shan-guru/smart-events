import React, { useState, useEffect } from 'react';

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High', class: 'priority-high' },
  { value: 'medium', label: 'Medium', class: 'priority-medium' },
  { value: 'low', label: 'Low', class: 'priority-low' },
];

const ScheduleEditModal = ({ task, isOpen, onClose, onSave }) => {
  // Helper function to parse datetime string into date, hour, and AM/PM
  const parseDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return { date: '', hour: '', ampm: 'AM' };
    try {
      const date = new Date(dateTimeStr);
      // Extract only the date part (YYYY-MM-DD) - no time component
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      let hour = date.getHours();
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      return { date: dateStr, hour: hour.toString(), ampm };
    } catch {
      return { date: '', hour: '', ampm: 'AM' };
    }
  };

  // Helper function to combine date, hour, and AM/PM into datetime string
  const combineDateTime = (date, hour, ampm) => {
    if (!date || !hour) return '';
    try {
      let hour24 = parseInt(hour);
      if (ampm === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (ampm === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      return `${date}T${hour24.toString().padStart(2, '0')}:00:00`;
    } catch {
      return '';
    }
  };

  const initialData = task || {
    title: '', priority: 'medium', duration: '', owners: [], start: '', end: ''
  };

  const startParsed = parseDateTime(initialData.start);
  const endParsed = parseDateTime(initialData.end);
  
  // Ensure dates are pure YYYY-MM-DD format with no time component
  const cleanStartDate = startParsed.date ? startParsed.date.split('T')[0].split(' ')[0] : '';
  const cleanEndDate = endParsed.date ? endParsed.date.split('T')[0].split(' ')[0] : '';

  // Default times: Start = 9 AM, End = 5 PM
  const defaultStartHour = startParsed.hour || '9';
  const defaultStartAMPM = startParsed.hour ? startParsed.ampm : 'AM';
  const defaultEndHour = endParsed.hour || '5';
  const defaultEndAMPM = endParsed.hour ? endParsed.ampm : 'PM';

  const [formData, setFormData] = useState({
    ...initialData,
    startDate: cleanStartDate,
    startHour: defaultStartHour,
    startAMPM: defaultStartAMPM,
    endDate: cleanEndDate,
    endHour: defaultEndHour,
    endAMPM: defaultEndAMPM,
  });

  const [ownerInput, setOwnerInput] = useState('');

  useEffect(() => {
    if (task) {
      const startParsed = parseDateTime(task.start);
      const endParsed = parseDateTime(task.end);
      // Ensure dates are pure YYYY-MM-DD format with no time component
      const cleanStartDate = startParsed.date ? startParsed.date.split('T')[0].split(' ')[0] : '';
      const cleanEndDate = endParsed.date ? endParsed.date.split('T')[0].split(' ')[0] : '';
      // Default times: Start = 9 AM, End = 5 PM
      const defaultStartHour = startParsed.hour || '9';
      const defaultStartAMPM = startParsed.hour ? startParsed.ampm : 'AM';
      const defaultEndHour = endParsed.hour || '5';
      const defaultEndAMPM = endParsed.hour ? endParsed.ampm : 'PM';
      setFormData({
        ...task,
        startDate: cleanStartDate,
        startHour: defaultStartHour,
        startAMPM: defaultStartAMPM,
        endDate: cleanEndDate,
        endHour: defaultEndHour,
        endAMPM: defaultEndAMPM,
      });
    }
  }, [task]);

  const handleOwnerAdd = () => {
    if (ownerInput.trim() && !formData.owners.includes(ownerInput.trim())) {
      setFormData({ ...formData, owners: [...formData.owners, ownerInput.trim()] });
      setOwnerInput('');
    }
  };

  const handleOwnerRemove = (index) => {
    setFormData({
      ...formData,
      owners: formData.owners.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    const updatedTask = {
      ...formData,
      start: combineDateTime(formData.startDate, formData.startHour, formData.startAMPM),
      end: combineDateTime(formData.endDate, formData.endHour, formData.endAMPM),
    };
    // Remove the temporary date/time fields
    delete updatedTask.startDate;
    delete updatedTask.startHour;
    delete updatedTask.startAMPM;
    delete updatedTask.endDate;
    delete updatedTask.endHour;
    delete updatedTask.endAMPM;
    onSave(updatedTask);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content rounded-xl max-w-lg w-full max-h-screen overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-gradient flex justify-between items-center px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 rounded-md p-1 transition-colors"
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50">
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority || 'medium'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owners</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ownerInput}
                  onChange={(e) => setOwnerInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleOwnerAdd())}
                  placeholder="Add owner name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleOwnerAdd}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.owners || []).map((owner, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {owner}
                    <button
                      type="button"
                      onClick={() => handleOwnerRemove(i)}
                      className="ml-1 text-gray-500 hover:text-red-600"
                      aria-label={`Remove ${owner}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.startDate ? formData.startDate.split('T')[0].split(' ')[0] : ''}
                      onChange={(e) => {
                        // Ensure only date value is set (no time) - extract just YYYY-MM-DD
                        const dateValue = e.target.value ? e.target.value.split('T')[0].split(' ')[0] : '';
                        setFormData({ ...formData, startDate: dateValue });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hour</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.startHour || ''}
                      onChange={(e) => setFormData({ ...formData, startHour: e.target.value })}
                      placeholder="Hour"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{ WebkitAppearance: 'textfield', MozAppearance: 'textfield' }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">AM/PM</label>
                    <select
                      value={formData.startAMPM || 'AM'}
                      onChange={(e) => setFormData({ ...formData, startAMPM: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.endDate ? formData.endDate.split('T')[0].split(' ')[0] : ''}
                      onChange={(e) => {
                        // Ensure only date value is set (no time) - extract just YYYY-MM-DD
                        const dateValue = e.target.value ? e.target.value.split('T')[0].split(' ')[0] : '';
                        setFormData({ ...formData, endDate: dateValue });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hour</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.endHour || ''}
                      onChange={(e) => setFormData({ ...formData, endHour: e.target.value })}
                      placeholder="Hour"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{ WebkitAppearance: 'textfield', MozAppearance: 'textfield' }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">AM/PM</label>
                    <select
                      value={formData.endAMPM || 'AM'}
                      onChange={(e) => setFormData({ ...formData, endAMPM: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-md hover:from-primary-hover hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleEditModal;
