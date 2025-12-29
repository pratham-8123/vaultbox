import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { browse, setCurrentFolder, deleteFolder, renameFolder } from '../../store/browseSlice';

/**
 * Card component for displaying a folder with navigation and actions.
 */
export default function FolderCard({ folder }) {
  const dispatch = useDispatch();
  const { selectedUserId } = useSelector((state) => state.browse);
  const { user } = useSelector((state) => state.auth);
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isOwner = folder.ownerId === user?.id;
  const canModify = isOwner || isAdmin;

  const handleNavigate = () => {
    if (!isRenaming) {
      dispatch(setCurrentFolder(folder.id));
      dispatch(browse({ parentId: folder.id, userId: selectedUserId }));
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete folder "${folder.name}" and all its contents? This cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await dispatch(deleteFolder(folder.id)).unwrap();
      } catch (error) {
        console.error('Failed to delete folder:', error);
      }
      setIsDeleting(false);
    }
    setShowMenu(false);
  };

  const handleRename = async () => {
    if (newName.trim() && newName !== folder.name) {
      try {
        await dispatch(renameFolder({ folderId: folder.id, newName: newName.trim() })).unwrap();
      } catch (error) {
        console.error('Failed to rename folder:', error);
      }
    }
    setIsRenaming(false);
    setShowMenu(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setNewName(folder.name);
      setIsRenaming(false);
    }
  };

  return (
    <div
      className={`group relative bg-slate-800/50 border border-slate-700 rounded-lg p-4 
        ${!isRenaming ? 'hover:border-cyan-500/50 hover:bg-slate-800 cursor-pointer' : ''} 
        transition-all duration-200`}
      onClick={handleNavigate}
    >
      {/* Folder icon and name */}
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <svg
            className="w-10 h-10 text-amber-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleRename}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-slate-900 border border-cyan-500 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              autoFocus
            />
          ) : (
            <p className="text-slate-200 font-medium truncate">{folder.name}</p>
          )}
          
          {isAdmin && folder.ownerEmail && (
            <p className="text-xs text-slate-500 truncate">{folder.ownerEmail}</p>
          )}
        </div>
      </div>

      {/* Actions menu */}
      {canModify && !isRenaming && (
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-slate-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {showMenu && (
            <div 
              className="absolute right-0 mt-1 w-36 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setIsRenaming(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 rounded-t-lg flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Rename
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 rounded-b-lg flex items-center disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        />
      )}
    </div>
  );
}


