import { useMemo } from 'react'

function FileCard({ file, onClick, showOwner }) {
  const fileIcon = useMemo(() => {
    if (file.contentType?.startsWith('image/')) {
      return (
        <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
    if (file.contentType === 'application/json') {
      return (
        <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    }
    if (file.contentType === 'text/plain') {
      return (
        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
    return (
      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  }, [file.contentType])

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago'
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago'
    if (diff < 604800000) return Math.floor(diff / 86400000) + ' days ago'
    
    return date.toLocaleDateString()
  }

  return (
    <div
      onClick={onClick}
      className="card hover:border-slate-600 hover:bg-slate-800/50 cursor-pointer transition-all group"
    >
      {/* File icon */}
      <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
        {fileIcon}
      </div>

      {/* File name */}
      <h3 className="font-medium text-white truncate mb-1" title={file.name}>
        {file.name}
      </h3>

      {/* Meta info */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span>{formatFileSize(file.size)}</span>
        <span>•</span>
        <span>{formatDate(file.uploadedAt)}</span>
      </div>

      {/* Owner (for admin view) */}
      {showOwner && file.ownerEmail && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <p className="text-xs text-slate-500 truncate">
            by {file.ownerEmail}
          </p>
        </div>
      )}

      {/* Viewable indicator */}
      {file.viewable && (
        <div className="absolute top-4 right-4">
          <div className="w-2 h-2 bg-emerald-400 rounded-full" title="Viewable in browser" />
        </div>
      )}
    </div>
  )
}

export default FileCard

