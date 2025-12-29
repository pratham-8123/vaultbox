import api from './api';

const userService = {
  /**
   * List all users (admin only)
   */
  async listUsers() {
    const response = await api.get('/users');
    return response.data;
  },
};

export default userService;


