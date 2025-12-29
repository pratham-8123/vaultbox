import api from './api';

const searchService = {
  /**
   * Search files and folders
   * @param {string} query - Search term (min 2 chars)
   * @param {string} type - 'all', 'file', or 'folder'
   * @param {string|null} userId - Target user ID (admin only)
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Page size
   */
  async search(query, type = 'all', userId = null, page = 0, size = 20) {
    const params = new URLSearchParams({
      q: query,
      type,
      page: page.toString(),
      size: size.toString(),
    });
    
    if (userId) params.append('userId', userId);
    
    const response = await api.get(`/search?${params.toString()}`);
    return response.data;
  },
};

export default searchService;


