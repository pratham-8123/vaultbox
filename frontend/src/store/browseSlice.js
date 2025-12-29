import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import browseService from '../services/browseService';
import searchService from '../services/searchService';
import userService from '../services/userService';
import fileService from '../services/fileService';

const initialState = {
  // Current folder navigation
  currentFolderId: null,
  currentFolder: null,
  breadcrumb: [],
  folders: [],
  files: [],
  
  // Loading states
  isLoading: false,
  isUploading: false,
  
  // Search state
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  searchTotalCount: 0,
  searchPage: 0,
  isSearchActive: false,
  
  // Admin: user selection
  selectedUserId: null,
  users: [],
  usersLoading: false,
  
  // Error handling
  error: null,
};

// Browse folder contents
export const browse = createAsyncThunk(
  'browse/browse',
  async ({ parentId = null, userId = null }, { rejectWithValue }) => {
    try {
      return await browseService.browse(parentId, userId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load folder');
    }
  }
);

// Create folder
export const createFolder = createAsyncThunk(
  'browse/createFolder',
  async ({ name, parentId }, { rejectWithValue }) => {
    try {
      return await browseService.createFolder(name, parentId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create folder');
    }
  }
);

// Rename folder
export const renameFolder = createAsyncThunk(
  'browse/renameFolder',
  async ({ folderId, newName }, { rejectWithValue }) => {
    try {
      return await browseService.renameFolder(folderId, newName);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to rename folder');
    }
  }
);

// Delete folder
export const deleteFolder = createAsyncThunk(
  'browse/deleteFolder',
  async (folderId, { rejectWithValue }) => {
    try {
      await browseService.deleteFolder(folderId);
      return folderId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete folder');
    }
  }
);

// Upload file to current folder
export const uploadFile = createAsyncThunk(
  'browse/uploadFile',
  async ({ file, parentFolderId }, { rejectWithValue }) => {
    try {
      return await fileService.uploadFile(file, parentFolderId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload file');
    }
  }
);

// Delete file
export const deleteFile = createAsyncThunk(
  'browse/deleteFile',
  async (fileId, { rejectWithValue }) => {
    try {
      await fileService.deleteFile(fileId);
      return fileId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete file');
    }
  }
);

// Search files and folders
export const search = createAsyncThunk(
  'browse/search',
  async ({ query, type = 'all', userId = null, page = 0 }, { rejectWithValue }) => {
    try {
      return await searchService.search(query, type, userId, page);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

// Fetch users list (admin only)
export const fetchUsers = createAsyncThunk(
  'browse/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.listUsers();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

const browseSlice = createSlice({
  name: 'browse',
  initialState,
  reducers: {
    // Navigate to a folder
    setCurrentFolder: (state, action) => {
      state.currentFolderId = action.payload;
      state.isSearchActive = false;
      state.searchQuery = '';
      state.searchResults = [];
    },
    
    // Set selected user (admin)
    setSelectedUser: (state, action) => {
      state.selectedUserId = action.payload;
      state.currentFolderId = null;
      state.currentFolder = null;
      state.breadcrumb = [];
    },
    
    // Clear selected user (admin returns to own files)
    clearSelectedUser: (state) => {
      state.selectedUserId = null;
      state.currentFolderId = null;
      state.currentFolder = null;
      state.breadcrumb = [];
    },
    
    // Toggle search mode
    setSearchActive: (state, action) => {
      state.isSearchActive = action.payload;
      if (!action.payload) {
        state.searchQuery = '';
        state.searchResults = [];
        state.searchTotalCount = 0;
      }
    },
    
    // Update search query
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset browse state (for logout)
    resetBrowse: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Browse
      .addCase(browse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(browse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFolder = action.payload.currentFolder;
        state.breadcrumb = action.payload.breadcrumb;
        state.folders = action.payload.folders;
        state.files = action.payload.files;
        state.currentFolderId = action.payload.currentFolder?.id || null;
      })
      .addCase(browse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create folder
      .addCase(createFolder.fulfilled, (state, action) => {
        state.folders.push(action.payload);
        state.folders.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Rename folder
      .addCase(renameFolder.fulfilled, (state, action) => {
        const index = state.folders.findIndex(f => f.id === action.payload.id);
        if (index !== -1) {
          state.folders[index] = action.payload;
          state.folders.sort((a, b) => a.name.localeCompare(b.name));
        }
      })
      .addCase(renameFolder.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Delete folder
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.folders = state.folders.filter(f => f.id !== action.payload);
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Upload file
      .addCase(uploadFile.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.isUploading = false;
        state.files.unshift(action.payload);
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      })
      
      // Delete file
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.files = state.files.filter(f => f.id !== action.payload);
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Search
      .addCase(search.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(search.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.results;
        state.searchTotalCount = action.payload.totalCount;
        state.searchPage = action.payload.page;
      })
      .addCase(search.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      })
      
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentFolder,
  setSelectedUser,
  clearSelectedUser,
  setSearchActive,
  setSearchQuery,
  clearError,
  resetBrowse,
} = browseSlice.actions;

export default browseSlice.reducer;


