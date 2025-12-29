import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { browse, fetchUsers, clearSelectedUser, setSelectedUser } from '../store/browseSlice';
import Header from '../components/layout/Header';
import FileCard from '../components/files/FileCard';
import FolderCard from '../components/files/FolderCard';
import UploadModal from '../components/files/UploadModal';
import CreateFolderModal from '../components/files/CreateFolderModal';
import Breadcrumb from '../components/common/Breadcrumb';
import SearchBar from '../components/common/SearchBar';
import SearchResults from '../components/common/SearchResults';

function Dashboard() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  
  const dispatch = useDispatch();
  const { 
    folders, 
    files, 
    breadcrumb, 
    currentFolderId,
    isLoading, 
    error,
    isSearchActive,
    selectedUserId,
    users,
  } = useSelector((state) => state.browse);
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user?.role === 'ADMIN';

  // Initial load
  useEffect(() => {
    dispatch(browse({ parentId: null, userId: null }));
    
    // Load users list for admin
    if (isAdmin) {
      dispatch(fetchUsers());
    }
  }, [dispatch, isAdmin]);

  // Reload when selected user changes
  useEffect(() => {
    dispatch(browse({ parentId: currentFolderId, userId: selectedUserId }));
  }, [selectedUserId]);

  const handleUserSelect = (userId) => {
    if (userId === '') {
      dispatch(clearSelectedUser());
    } else {
      dispatch(setSelectedUser(userId));
    }
  };

  const isEmpty = folders.length === 0 && files.length === 0;
  const selectedUserInfo = users.find(u => u.id === selectedUserId);

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top section: Title + Search + Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isAdmin ? 'File Manager' : 'My Files'}
            </h1>
            <p className="text-slate-400 mt-1">
              {isAdmin 
                ? (selectedUserId ? `Viewing ${selectedUserInfo?.email || 'user'}'s files` : 'Your files')
                : 'Upload and manage your files'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search bar */}
            <div className="w-full sm:w-64">
              <SearchBar />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFolderModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-200 font-medium rounded-lg 
                  hover:bg-slate-700 transition-colors border border-slate-700"
                title="New Folder"
              >
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                </svg>
                <span className="hidden sm:inline">New Folder</span>
              </button>
              
              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 
                  text-slate-900 font-medium rounded-lg hover:from-emerald-400 hover:to-cyan-400 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Upload</span>
              </button>
            </div>
          </div>
        </div>

        {/* Admin: User selector */}
        {isAdmin && (
          <div className="mb-6 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-sm font-medium text-slate-300">
                View files as:
              </label>
              <div className="flex items-center gap-2 flex-1">
                <select
                  value={selectedUserId || ''}
                  onChange={(e) => handleUserSelect(e.target.value)}
                  className="flex-1 sm:flex-none sm:w-64 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 
                    text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">My files (Admin)</option>
                  {users
                    .filter(u => u.id !== user?.id)
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.email} ({u.username})
                      </option>
                    ))
                  }
                </select>
                
                {selectedUserId && (
                  <button
                    onClick={() => dispatch(clearSelectedUser())}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Clear selection"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Search results or Browse view */}
        {isSearchActive ? (
          <SearchResults />
        ) : (
          <>
            {/* Breadcrumb navigation */}
            <div className="mb-6">
              <Breadcrumb breadcrumb={breadcrumb} selectedUserId={selectedUserId} />
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <svg className="w-10 h-10 text-cyan-500 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-slate-400">Loading...</p>
                </div>
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {currentFolderId ? 'This folder is empty' : 'No files or folders yet'}
                </h3>
                <p className="text-slate-400 mb-6">
                  {currentFolderId 
                    ? 'Add files or create a subfolder'
                    : 'Create a folder or upload your first file'}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsFolderModalOpen(true)}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Create folder
                  </button>
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Upload file
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Folders section */}
                {folders.length > 0 && (
                  <div>
                    <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                      Folders ({folders.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {folders.map((folder) => (
                        <FolderCard key={folder.id} folder={folder} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Files section */}
                {files.length > 0 && (
                  <div>
                    <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                      Files ({files.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {files.map((file) => (
                        <FileCard key={file.id} file={file} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />
      <CreateFolderModal 
        isOpen={isFolderModalOpen} 
        onClose={() => setIsFolderModalOpen(false)} 
      />
    </div>
  );
}

export default Dashboard;
