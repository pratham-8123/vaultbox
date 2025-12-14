import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import fileService from '../services/fileService'

const initialState = {
  files: [],
  selectedFile: null,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
}

export const fetchFiles = createAsyncThunk(
  'files/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await fileService.getFiles()
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch files')
    }
  }
)

export const uploadFile = createAsyncThunk(
  'files/upload',
  async (file, { rejectWithValue }) => {
    try {
      return await fileService.uploadFile(file)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload file')
    }
  }
)

export const deleteFile = createAsyncThunk(
  'files/delete',
  async (fileId, { rejectWithValue }) => {
    try {
      await fileService.deleteFile(fileId)
      return fileId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete file')
    }
  }
)

const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setSelectedFile: (state, action) => {
      state.selectedFile = action.payload
    },
    clearSelectedFile: (state) => {
      state.selectedFile = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch files
      .addCase(fetchFiles.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.isLoading = false
        state.files = action.payload
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Upload file
      .addCase(uploadFile.pending, (state) => {
        state.isUploading = true
        state.error = null
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.isUploading = false
        state.files.unshift(action.payload)
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.isUploading = false
        state.error = action.payload
      })
      // Delete file
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.files = state.files.filter(f => f.id !== action.payload)
        if (state.selectedFile?.id === action.payload) {
          state.selectedFile = null
        }
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { setSelectedFile, clearSelectedFile, clearError } = fileSlice.actions
export default fileSlice.reducer

