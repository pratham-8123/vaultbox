import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { deleteFile } from '../store/fileSlice'
import fileService from '../services/fileService'
import api from '../services/api'

function FileView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  
  const [file, setFile] = useState(null)
  const [content, setContent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadFile()
  }, [id])

  const loadFile = async () => {
    try {
      setIsLoading(true)
      const metadata = await fileService.getFile(id)
      setFile(metadata)

      // Load content for viewable files
      if (metadata.viewable) {
        const response = await api.get(`/files/${id}/download`, {
          responseType: metadata.contentType.startsWith('image/') ? 'blob' : 'text',
        })
        
        if (metadata.contentType.startsWith('image/')) {
          const imageUrl = URL.createObjectURL(response.data)
          setContent(imageUrl)
        } else {
          setContent(response.data)
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load file')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    fileService.downloadFile(id, file.name)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this file?')) return
    
    setIsDeleting(true)
    try {
      await dispatch(deleteFile(id)).unwrap()
      navigate('/')
    } catch (err) {
      setError(err)
      setIsDeleting(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString()
  }

  const canDelete = user?.role === 'ADMIN' || file?.ownerId === user?.id

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-10 w-10 text-indigo-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-400 mb-4">{error}</div>
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to files
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* File preview */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4 truncate">{file?.name}</h2>
            
            <div className="bg-slate-800 rounded-lg overflow-hidden min-h-[400px] flex items-center justify-center">
              {file?.contentType?.startsWith('image/') ? (
                <img 
                  src={content} 
                  alt={file.name}
                  className="max-w-full max-h-[600px] object-contain"
                />
              ) : file?.contentType === 'text/plain' || file?.contentType === 'application/json' ? (
                <pre className="w-full h-full p-4 text-sm text-slate-300 overflow-auto whitespace-pre-wrap font-mono">
                  {content}
                </pre>
              ) : (
                <div className="text-center text-slate-400">
                  <svg className="w-20 h-20 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Preview not available for this file type</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* File info sidebar */}
        <div>
          <div className="card space-y-6">
            <h3 className="text-lg font-semibold text-white">File Details</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">File Name</p>
                <p className="text-white font-medium truncate">{file?.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-400">Type</p>
                <p className="text-white font-medium">{file?.contentType}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-400">Size</p>
                <p className="text-white font-medium">{formatFileSize(file?.size)}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-400">Uploaded</p>
                <p className="text-white font-medium">{formatDate(file?.uploadedAt)}</p>
              </div>

              {user?.role === 'ADMIN' && file?.ownerEmail && (
                <div>
                  <p className="text-sm text-slate-400">Owner</p>
                  <p className="text-white font-medium">{file.ownerEmail}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-700 space-y-3">
              <button
                onClick={handleDownload}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>

              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="btn btn-danger w-full flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileView

