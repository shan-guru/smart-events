import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';

const CreateEventForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    eventName: initialData.eventName || '',
    eventInfo: initialData.eventInfo || '',
    startDate: initialData.startDate || '',
    endDate: initialData.endDate || '',
    eventDate: initialData.eventDate || '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!formData.eventName.trim()) {
      newErrors.eventName = 'Event name is required';
    }
    
    if (!formData.eventInfo.trim()) {
      newErrors.eventInfo = 'Event info is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <Card>
      <div className="section-title">Event Details</div>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          label="Event Name"
          placeholder="Enter event name"
          value={formData.eventName}
          onChange={(e) => handleChange('eventName', e.target.value)}
          error={errors.eventName}
          required
        />

        <Input
          type="textarea"
          label="Event Info"
          placeholder="Enter event description and details"
          value={formData.eventInfo}
          onChange={(e) => handleChange('eventInfo', e.target.value)}
          error={errors.eventInfo}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            type="date"
            label="Start Date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            error={errors.startDate}
            required
          />

          <Input
            type="date"
            label="End Date"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            error={errors.endDate}
            required
          />
        </div>

        <Input
          type="date"
          label="Event Date"
          placeholder="Optional: Specific event date"
          value={formData.eventDate}
          onChange={(e) => handleChange('eventDate', e.target.value)}
          error={errors.eventDate}
        />

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">Create Event</Button>
        </div>
      </form>
    </Card>
  );
};

CreateEventForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  initialData: PropTypes.shape({
    eventName: PropTypes.string,
    eventInfo: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    eventDate: PropTypes.string,
  }),
};

export default CreateEventForm;

