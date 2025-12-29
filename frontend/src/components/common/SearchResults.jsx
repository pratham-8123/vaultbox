import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { browse, setCurrentFolder, setSearchActive, deleteFile, deleteFolder } from '../../store/browseSlice';
import fileService from '../../services/fileService';

/**
 * Display search results with navigation to folders and file actions.
 */
export default function SearchResults() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searchResults, searchTotalCount, searchLoading, selectedUserId } = useSelector((state) => state.browse);
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user?.role === 'ADMIN';

  const handleFolderClick = (folder) => {
    dispatch(setSearchActive(false));
    dispatch(setCurrentFolder(folder.id));
    dispatch(browse({ parentId: folder.id, userId: selectedUserId }));
  };

  const handleFileClick = (file) => {
    if (file.viewable) {
      navigate(`/view/${file.id}`);
    }
  };

  const handleDownload = async (file, e) => {
    e.stopPropagation();
    await fileService.downloadFile(file.id, file.name);
  };

  const handleDeleteFile = async (fileId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this file? This cannot be undone.')) {
      dispatch(deleteFile(fileId));
    }
  };

  const handleDeleteFolder = async (folder, e) => {
    e.stopPropagation();
    if (window.confirm(`Delete folder "${folder.name}" and all its contents? This cannot be undone.`)) {
      dispatch(deleteFolder(folder.id));
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (contentType) => {
    if (!contentType) return '📄';
    if (contentType.startsWith('image/')) return '🖼️';
    if (contentType === 'application/pdf') return '📕';
    if (contentType === 'application/json') return '📋';
    if (contentType === 'text/plain') return '📝';
    return '📄';
  };

  if (searchLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-slate-400">No results found</p>
        <p className="text-sm text-slate-500 mt-1">Try a different search term</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-slate-400 mb-4">
        Found {searchTotalCount} result{searchTotalCount !== 1 ? 's' : ''}
      </p>

      <div className="space-y-2">
        {searchResults.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            onClick={() => item.type === 'FOLDER' ? handleFolderClick(item) : handleFileClick(item)}
            className={`flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg 
              hover:border-slate-600 hover:bg-slate-800 transition-all ${item.type === 'FOLDER' || item.viewable ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {/* Icon */}
              <div className="flex-shrink-0 text-2xl">
                {item.type === 'FOLDER' ? (
                  <span className="text-amber-400">📁</span>
                ) : (
                  <span>{getFileIcon(item.contentType)}</span>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-slate-200 font-medium truncate">{item.name}</p>
                <p className="text-xs text-slate-500 truncate">{item.path}</p>
                {isAdmin && item.ownerEmail && (
                  <p className="text-xs text-slate-600">{item.ownerEmail}</p>
                )}
              </div>

              {/* Size for files */}
              {item.type === 'FILE' && item.size && (
                <span className="text-xs text-slate-500 flex-shrink-0">
                  {formatSize(item.size)}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              {item.type === 'FILE' && (
                <>
                  <button
                    onClick={(e) => handleDownload(item, e)}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 rounded transition-colors"
                    title="Download"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => handleDeleteFile(item.id, e)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
              {item.type === 'FOLDER' && (
                <button
                  onClick={(e) => handleDeleteFolder(item, e)}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


