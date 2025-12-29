import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteFile } from '../../store/browseSlice';
import fileService from '../../services/fileService';

function FileCard({ file }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const isOwner = file.ownerId === user?.id;
  const isAdmin = user?.role === 'ADMIN';

  const getFileIcon = () => {
    const type = file.contentType || '';
    if (type.startsWith('image/')) {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (type === 'application/json') {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    }
    if (type === 'application/pdf') {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDownload = async () => {
    try {
      await fileService.downloadFile(file.id, file.name);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleView = () => {
    navigate(`/view/${file.id}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteFile(file.id)).unwrap();
    } catch (error) {
      console.error('Delete failed:', error);
    }
    setIsDeleting(false);
    setShowConfirm(false);
  };

  return (
    <div className="group bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800 hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors">
          {getFileIcon()}
        </div>
        
        {!showConfirm ? (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {file.viewable && (
              <button
                onClick={handleView}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            )}
            <button
              onClick={handleDownload}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Download"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            {(isOwner || isAdmin) && (
              <button
                onClick={() => setShowConfirm(true)}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? '...' : 'Delete'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <h3 className="text-white font-medium truncate mb-2" title={file.name}>
        {file.name}
      </h3>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{formatSize(file.size)}</span>
        <span>{formatDate(file.uploadedAt)}</span>
      </div>

      {isAdmin && !isOwner && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <span className="text-xs text-slate-500">
            Owner: {file.ownerEmail}
          </span>
        </div>
      )}
    </div>
  );
}

export default FileCard;
