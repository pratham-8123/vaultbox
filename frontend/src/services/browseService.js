import api from './api';

const browseService = {
  /**
   * Browse folder contents
   * @param {string|null} parentId - Folder ID to browse, null for root
   * @param {string|null} userId - Target user ID (admin only)
   */
  async browse(parentId = null, userId = null) {
    const params = new URLSearchParams();
    if (parentId) params.append('parentId', parentId);
    if (userId) params.append('userId', userId);
    
    const response = await api.get(`/browse?${params.toString()}`);
    return response.data;
  },

  /**
   * Create a new folder
   */
  async createFolder(name, parentId = null) {
    const response = await api.post('/folders', { name, parentId });
    return response.data;
  },

  /**
   * Rename a folder
   */
  async renameFolder(folderId, newName) {
    const response = await api.patch(`/folders/${folderId}/rename`, { name: newName });
    return response.data;
  },

  /**
   * Delete a folder and its contents
   */
  async deleteFolder(folderId) {
    const response = await api.delete(`/folders/${folderId}`);
    return response.data;
  },

  /**
   * Get folder details
   */
  async getFolder(folderId) {
    const response = await api.get(`/folders/${folderId}`);
    return response.data;
  },
};

export default browseService;


