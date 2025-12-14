import api from './api'

const fileService = {
  async getFiles() {
    const response = await api.get('/files')
    return response.data
  },

  async getFile(id) {
    const response = await api.get(`/files/${id}`)
    return response.data
  },

  async uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async downloadFile(id, filename) {
    const response = await api.get(`/files/${id}/download`, {
      responseType: 'blob',
    })
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  async deleteFile(id) {
    const response = await api.delete(`/files/${id}`)
    return response.data
  },

  getViewUrl(id) {
    const token = localStorage.getItem('token')
    return `/api/files/${id}/download?token=${token}`
  },
}

export default fileService

