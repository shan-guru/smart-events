import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generateTasks = async (event, eventInfo) => {
  try {
    const response = await api.post('/generate-tasks', {
      event,
      event_info: eventInfo,
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    
    // Check for network errors (server not running)
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      throw new Error(
        'Cannot connect to the API server. Please make sure the backend is running on http://localhost:8000'
      );
    }
    
    // Check for connection refused
    if (error.code === 'ECONNREFUSED' || error.message.includes('ERR_CONNECTION_REFUSED')) {
      throw new Error(
        'Connection refused. Please start the API server by running: python api.py (or ./start_api.sh)'
      );
    }
    
    throw new Error(
      error.response?.data?.detail || 'Failed to generate tasks. Please try again.'
    );
  }
};

export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'unhealthy' };
  }
};

export const saveWizardData = async (wizardData) => {
  try {
    const response = await api.post('/save-wizard', wizardData);
    return response.data;
  } catch (error) {
    console.error('API Error saving wizard:', error);
    throw new Error(
      error.response?.data?.detail || 'Failed to save wizard data. Please try again.'
    );
  }
};

export const getWizardData = async (eventName) => {
  try {
    const response = await api.get(`/wizard/${encodeURIComponent(eventName)}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // No saved data found
    }
    console.error('API Error loading wizard:', error);
    throw new Error(
      error.response?.data?.detail || 'Failed to load wizard data. Please try again.'
    );
  }
};

export const getAllWizards = async () => {
  try {
    const response = await api.get('/wizards');
    return response.data;
  } catch (error) {
    console.error('API Error loading wizards:', error);
    throw new Error(
      error.response?.data?.detail || 'Failed to load wizards. Please try again.'
    );
  }
};

export const generateSchedule = async (scheduleRequest) => {
  try {
    const response = await api.post('/generate-schedule', scheduleRequest);
    return response.data;
  } catch (error) {
    console.error('API Error generating schedule:', error);
    
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      throw new Error(
        'Cannot connect to the API server. Please make sure the backend is running on http://localhost:8000'
      );
    }
    
    throw new Error(
      error.response?.data?.detail || 'Failed to generate schedule. Please try again.'
    );
  }
};

