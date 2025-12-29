import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createFolder } from '../../store/browseSlice';

/**
 * Modal for creating a new folder in the current directory.
 */
export default function CreateFolderModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { currentFolderId } = useSelector((state) => state.browse);
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = folderName.trim();
    
    if (!trimmedName) {
      setError('Folder name is required');
      return;
    }

    // Check for invalid characters
    if (/[/\\:*?"<>|]/.test(trimmedName)) {
      setError('Folder name contains invalid characters');
      return;
    }

    setIsCreating(true);
    try {
      await dispatch(createFolder({ 
        name: trimmedName, 
        parentId: currentFolderId 
      })).unwrap();
      
      setFolderName('');
      onClose();
    } catch (err) {
      setError(err || 'Failed to create folder');
    }
    setIsCreating(false);
  };

  const handleClose = () => {
    setFolderName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center">
            <svg className="w-5 h-5 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
            </svg>
            New Folder
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="folderName" className="block text-sm font-medium text-slate-300 mb-2">
              Folder Name
            </label>
            <input
              type="text"
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 
                placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 
                bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !folderName.trim()}
              className="px-4 py-2 text-sm font-medium text-slate-900 bg-cyan-500 hover:bg-cyan-400 
                rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


