import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PickupPoint } from '../../types/pickup-point';
import { pickupPointService } from '@/lib/api/services/pickupPointService';

interface PickupPointsState {
  loading: boolean;
  error: string | null;
  pickupPoints: PickupPoint[];
}

const initialState: PickupPointsState = {
  loading: false,
  error: null,
  pickupPoints: [],
};

// Thunks
export const fetchPickupPoints = createAsyncThunk<PickupPoint[], void, { rejectValue: string }>(
  'pickupPoints/fetchPickupPoints',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pickupPointService.getAll();
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch pickup points');
    }
  }
);

export const createPickupPoint = createAsyncThunk<PickupPoint, Omit<PickupPoint, '_id'>, { rejectValue: string }>(
  'pickupPoints/createPickupPoint',
  async (pickupPointData, { rejectWithValue }) => {
    try {
      const response = await pickupPointService.create(pickupPointData);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create pickup point');
    }
  }
);

export const updatePickupPoint = createAsyncThunk<
  PickupPoint,
  { id: string; data: Partial<PickupPoint> },
  { rejectValue: string }
>(
  'pickupPoints/updatePickupPoint',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await pickupPointService.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update pickup point');
    }
  }
);

export const deletePickupPoint = createAsyncThunk<string, string, { rejectValue: string }>(
  'pickupPoints/deletePickupPoint',
  async (id, { rejectWithValue }) => {
    try {
      await pickupPointService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete pickup point');
    }
  }
);

const pickupPointsSlice = createSlice({
  name: 'pickupPoints',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Pickup Points
    builder
      .addCase(fetchPickupPoints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPickupPoints.fulfilled, (state, action: PayloadAction<PickupPoint[]>) => {
        state.loading = false;
        state.pickupPoints = action.payload;
      })
      .addCase(fetchPickupPoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch pickup points';
      })

      // Create Pickup Point
      .addCase(createPickupPoint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPickupPoint.fulfilled, (state, action: PayloadAction<PickupPoint>) => {
        state.loading = false;
        state.pickupPoints.push(action.payload);
      })
      .addCase(createPickupPoint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create pickup point';
      })

      // Update Pickup Point
      .addCase(updatePickupPoint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePickupPoint.fulfilled, (state, action: PayloadAction<PickupPoint>) => {
        state.loading = false;
        const index = state.pickupPoints.findIndex((pp: PickupPoint) => pp._id === action.payload._id);
        if (index !== -1) {
          state.pickupPoints[index] = action.payload;
        }
      })
      .addCase(updatePickupPoint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update pickup point';
      })

      // Delete Pickup Point
      .addCase(deletePickupPoint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePickupPoint.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.pickupPoints = state.pickupPoints.filter((pp: PickupPoint) => pp._id !== action.payload);
      })
      .addCase(deletePickupPoint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete pickup point';
      });
  },
});

export const { clearError, reset } = pickupPointsSlice.actions;
export const pickupPointsReducer = pickupPointsSlice.reducer;
