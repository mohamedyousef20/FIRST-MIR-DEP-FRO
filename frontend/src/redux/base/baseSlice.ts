import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/src/redux/store';

export interface BaseState<T> {
  items: T[];
  item: T | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export const initialState = {
  items: [],
  item: null,
  status: 'idle',
  error: null,
} as const;

export interface BaseSliceConfig<T> {
  name: string;
  initialState?: BaseState<T>;
  extraReducers?: (builder: any) => void;
}

export const createBaseSlice = <T>(config: BaseSliceConfig<T>) => {
  const slice = createSlice({
    name: config.name,
    initialState: config.initialState || initialState,
    reducers: {
      reset: (state) => {
        return { ...initialState };
      },
      clearError: (state) => {
        state.error = null;
      },
    },
    extraReducers: config.extraReducers,
  });

  return {
    slice,
    actions: slice.actions,
    selectors: {
      selectItems: (state: RootState) => state[config.name].items,
      selectItem: (state: RootState) => state[config.name].item,
      selectStatus: (state: RootState) => state[config.name].status,
      selectError: (state: RootState) => state[config.name].error,
    },
  };
};
