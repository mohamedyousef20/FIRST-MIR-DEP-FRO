import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'sonner';

// Define error action types
export const errorActions = {
  SET_ERROR: 'error/SET_ERROR',
  CLEAR_ERROR: 'error/CLEAR_ERROR',
};

// Error slice to manage error state
const errorSlice = createSlice({
  name: 'error',
  initialState: {
    message: '',
    type: '',
    visible: false,
  },
  reducers: {
    setError: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.visible = true;
    },
    clearError: (state) => {
      state.message = '';
      state.type = '';
      state.visible = false;
    },
  },
});

export const { setError, clearError } = errorSlice.actions;
export default errorSlice.reducer;

// Error middleware
export const errorMiddleware = (store) => (next) => (action) => {
  if (action.error) {
    // Handle API errors
    if (action.error.response) {
      const { status, data } = action.error.response;
      const errorMessage = data?.message || 'An error occurred';
      
      // Dispatch error to Redux store
      store.dispatch(setError({
        message: errorMessage,
        type: status >= 500 ? 'server' : 'client'
      }));

      // Show toast notification
      toast.error(errorMessage);
    } else if (action.error.message) {
      // Handle non-API errors
      store.dispatch(setError({
        message: action.error.message,
        type: 'client'
      }));
      toast.error(action.error.message);
    }

    // Clear error after 5 seconds
    setTimeout(() => {
      store.dispatch(clearError());
    }, 5000);
  }
  
  return next(action);
};
