import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { search, setSearchQuery, setSearchActive } from '../../store/browseSlice';

/**
 * Search bar with debounced API calls.
 * Minimum 2 characters required to trigger search.
 */
export default function SearchBar() {
  const dispatch = useDispatch();
  const { searchQuery, searchLoading, isSearchActive, selectedUserId } = useSelector((state) => state.browse);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceTimer = useRef(null);
  const inputRef = useRef(null);

  // Debounced search - 400ms after user stops typing
  const debouncedSearch = useCallback((query) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (query.length >= 2) {
        dispatch(setSearchQuery(query));
        dispatch(setSearchActive(true));
        dispatch(search({ query, userId: selectedUserId }));
      } else if (query.length === 0) {
        dispatch(setSearchActive(false));
      }
    }, 400);
  }, [dispatch, selectedUserId]);

  useEffect(() => {
    debouncedSearch(localQuery);
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [localQuery, debouncedSearch]);

  // Sync external changes to local state
  useEffect(() => {
    if (!isSearchActive && localQuery) {
      setLocalQuery('');
    }
  }, [isSearchActive]);

  const handleClear = () => {
    setLocalQuery('');
    dispatch(setSearchActive(false));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {searchLoading ? (
            <svg className="w-5 h-5 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search files and folders..."
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-10 py-2 text-sm text-slate-100 
            placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
            transition-all duration-200"
        />

        {/* Clear button */}
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Helper text */}
      {localQuery.length > 0 && localQuery.length < 2 && (
        <p className="absolute mt-1 text-xs text-slate-500">
          Type at least 2 characters to search
        </p>
      )}
    </div>
  );
}


