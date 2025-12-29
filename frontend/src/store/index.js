import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import fileReducer from './fileSlice';
import browseReducer from './browseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    files: fileReducer,
    browse: browseReducer,
  },
});

export default store;
