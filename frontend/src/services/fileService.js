import api from './api';

const fileService = {
  async listFiles() {
    const response = await api.get('/files');
    return response.data;
  },

  /**
   * Upload a file to a specific folder
   * @param {File} file - The file to upload
   * @param {string|null} parentFolderId - Target folder ID, null for root
   */
  async uploadFile(file, parentFolderId = null) {
    const formData = new FormData();
    formData.append('file', file);
    if (parentFolderId) {
      formData.append('parentFolderId', parentFolderId);
    }

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getFile(fileId) {
    const response = await api.get(`/files/${fileId}`);
    return response.data;
  },

  async deleteFile(fileId) {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },

  getDownloadUrl(fileId) {
    const token = localStorage.getItem('token');
    return `/api/files/${fileId}/download?token=${token}`;
  },

  async downloadFile(fileId, filename) {
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default fileService;
