import api from './api';

class LabelsService {
  constructor() {
    this.labels = {};
    this.loaded = false;
  }

  // Load all labels from backend
  async loadLabels() {
    if (this.loaded && Object.keys(this.labels).length > 0) {
      return this.labels;
    }

    try {
      const labels = await api.get('/api/labels');
      this.labels = labels || {};
      this.loaded = true;
      return this.labels;
    } catch (error) {
      console.error('Failed to load labels:', error);
      // Return empty object if loading fails
      return {};
    }
  }

  // Get a specific label by key
  getLabel(key, defaultValue = null) {
    return this.labels[key] || defaultValue || key;
  }

  // Get all labels
  getAllLabels() {
    return this.labels;
  }

  // Check if labels are loaded
  isLoaded() {
    return this.loaded;
  }

  // Clear labels (useful for reloading)
  clear() {
    this.labels = {};
    this.loaded = false;
  }
}

export default new LabelsService();

