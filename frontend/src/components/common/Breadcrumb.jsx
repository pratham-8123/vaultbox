import { useDispatch } from 'react-redux';
import { browse, setCurrentFolder } from '../../store/browseSlice';

/**
 * Breadcrumb navigation showing path from root to current folder.
 * Each segment is clickable to navigate to that folder.
 */
export default function Breadcrumb({ breadcrumb, selectedUserId }) {
  const dispatch = useDispatch();

  const handleNavigate = (folderId) => {
    dispatch(setCurrentFolder(folderId));
    dispatch(browse({ parentId: folderId, userId: selectedUserId }));
  };

  if (!breadcrumb || breadcrumb.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm overflow-x-auto pb-2">
      {breadcrumb.map((item, index) => {
        const isLast = index === breadcrumb.length - 1;
        const isRoot = item.id === null;

        return (
          <span key={item.id || 'root'} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-slate-500 mx-1 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            
            {isLast ? (
              <span className="flex items-center text-slate-200 font-medium">
                {isRoot ? (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                )}
                {item.name}
              </span>
            ) : (
              <button
                onClick={() => handleNavigate(item.id)}
                className="flex items-center text-slate-400 hover:text-cyan-400 transition-colors whitespace-nowrap"
              >
                {isRoot ? (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                )}
                {item.name}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}


