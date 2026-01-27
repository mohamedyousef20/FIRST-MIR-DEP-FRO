import { configureStore } from '@reduxjs/toolkit';
import { pickupPointsReducer } from './pickupPoints/pickupPointsSlice';

// Create the Redux store
export const store = configureStore({
  reducer: {
    pickupPoints: pickupPointsReducer,
    // Add other reducers here when needed
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
