import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import api from '../../lib/api';

export interface Address {
  _id: string;
  label: string;
  fullName: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
}

interface AddressState {
  addresses: Address[];
  selectedAddressId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  addresses: [],
  selectedAddressId: null,
  loading: false,
  error: null,
};

// Get current user ID from auth state
const getCurrentUserId = (state: RootState) => state.auth.user?._id;

// Async actions for backend integration
export const fetchAddresses = createAsyncThunk(
  'address/fetchAddresses',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userId = getCurrentUserId(state);
      if (!userId) throw new Error('User not authenticated');
      
      const { data } = await api.get(`/users/${userId}/addresses`);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addAddress = createAsyncThunk(
  'address/addAddress',
  async (address: Omit<Address, '_id'>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userId = getCurrentUserId(state);
      if (!userId) throw new Error('User not authenticated');
      
      const { data } = await api.post(`/users/${userId}/addresses`, address);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'address/deleteAddress',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userId = getCurrentUserId(state);
      if (!userId) throw new Error('User not authenticated');
      
      await api.delete(`/users/${userId}/addresses/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    selectAddress(state, action: PayloadAction<string>) {
      state.selectedAddressId = action.payload;
    },
    clearSelectedAddress(state) {
      state.selectedAddressId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.addresses.push(action.payload);
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter(a => a._id !== action.payload);
        if (state.selectedAddressId === action.payload) {
          state.selectedAddressId = null;
        }
      });
  },
});

export const { selectAddress, clearSelectedAddress } = addressSlice.actions;
export default addressSlice.reducer;
