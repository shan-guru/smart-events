import api from './api';

class MemberService {
  // Get all members
  async getAllMembers(type = null) {
    const params = type ? { type } : {};
    return await api.get('/api/members', params);
  }

  // Get member by ID
  async getMemberById(id) {
    return await api.get(`/api/members/${id}`);
  }

  // Create a new member
  async createMember(memberData) {
    return await api.post('/api/members', memberData);
  }

  // Update member (if needed in future)
  async updateMember(id, memberData) {
    return await api.put(`/api/members/${id}`, memberData);
  }

  // Delete member
  async deleteMember(id) {
    return await api.delete(`/api/members/${id}`);
  }

  // Import members from file
  async importMembers(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return await api.post('/api/members/import', formData);
  }
}

export default new MemberService();

