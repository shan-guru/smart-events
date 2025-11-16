import React, { createContext, useContext, useState, useEffect } from 'react';
import labelsService from '../services/labelsService';

const LabelsContext = createContext(null);

export const LabelsProvider = ({ children }) => {
  const [labels, setLabels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLabels();
  }, []);

  const loadLabels = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedLabels = await labelsService.loadLabels();
      setLabels(loadedLabels);
    } catch (err) {
      console.error('Failed to load labels:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLabel = (key, defaultValue = null) => {
    return labels[key] || defaultValue || key;
  };

  const value = {
    labels,
    loading,
    error,
    getLabel,
    reload: loadLabels,
  };

  return (
    <LabelsContext.Provider value={value}>
      {children}
    </LabelsContext.Provider>
  );
};

export const useLabels = () => {
  const context = useContext(LabelsContext);
  if (!context) {
    throw new Error('useLabels must be used within a LabelsProvider');
  }
  return context;
};

export default LabelsContext;

