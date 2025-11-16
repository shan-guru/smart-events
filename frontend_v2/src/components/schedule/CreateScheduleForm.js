import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';

const CreateScheduleForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    scheduleName: initialData.scheduleName || '',
    scheduleInfo: initialData.scheduleInfo || '',
    startDate: initialData.startDate || '',
    endDate: initialData.endDate || '',
    scheduleDate: initialData.scheduleDate || '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!formData.scheduleName.trim()) {
      newErrors.scheduleName = 'Schedule name is required';
    }
    
    if (!formData.scheduleInfo.trim()) {
      newErrors.scheduleInfo = 'Schedule info is required';
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
      <div className="section-title">Schedule Details</div>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          label="Schedule Name"
          placeholder="Enter schedule name"
          value={formData.scheduleName}
          onChange={(e) => handleChange('scheduleName', e.target.value)}
          error={errors.scheduleName}
          required
        />

        <Input
          type="textarea"
          label="Schedule Info"
          placeholder="Enter schedule description and details"
          value={formData.scheduleInfo}
          onChange={(e) => handleChange('scheduleInfo', e.target.value)}
          error={errors.scheduleInfo}
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
          label="Schedule Date"
          placeholder="Optional: Specific schedule date"
          value={formData.scheduleDate}
          onChange={(e) => handleChange('scheduleDate', e.target.value)}
          error={errors.scheduleDate}
        />

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {initialData && initialData.id ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

CreateScheduleForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  initialData: PropTypes.shape({
    scheduleName: PropTypes.string,
    scheduleInfo: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    scheduleDate: PropTypes.string,
  }),
};

export default CreateScheduleForm;

