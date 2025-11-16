import api from './api';

class EventService {
  // Get all events
  async getAllEvents() {
    return await api.get('/api/events/wizards');
  }

  // Get event by name
  async getEventByName(eventName) {
    return await api.get(`/api/events/wizard/${eventName}`);
  }

  // Create a new event
  async createEvent(eventData) {
    return await api.post('/api/events/save-wizard', eventData);
  }

  // Update event
  async updateEvent(eventName, eventData) {
    return await api.post('/api/events/save-wizard', eventData);
  }

  // Delete event
  async deleteEvent(eventName) {
    return await api.delete(`/api/events/wizard/${eventName}`);
  }

  // Import events from file
  async importEvents(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return await api.post('/api/events/import', formData);
  }
}

export default new EventService();

