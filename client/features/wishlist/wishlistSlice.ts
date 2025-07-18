import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

interface WishlistState {
  items: string[]; // Product IDs
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
};

// Fetch wishlist from backend
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch', 
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/wishlist');
      return res.data.items || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

// Sync wishlist to backend
export const syncWishlist = createAsyncThunk(
  'wishlist/sync', 
  async (items: string[], { rejectWithValue }) => {
    try {
      await api.post('/wishlist', { items });
      return items;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to sync wishlist');
    }
  }
);

// Add item to wishlist (with sync)
export const addToWishlistAsync = createAsyncThunk(
  'wishlist/add',
  async (productId: string, { getState, dispatch }) => {
    const state = getState() as any;
    const currentItems = state.wishlist.items;
    const newItems = [...currentItems, productId];
    
    // Update local state immediately
    dispatch(addToWishlist(productId));
    
    // Try to sync with backend
    try {
      await api.post('/wishlist', { items: newItems });
    } catch (error) {
      console.error('Failed to sync wishlist to backend:', error);
      // Don't throw error - local state is already updated
    }
    
    return productId;
  }
);

// Remove item from wishlist (with sync)
export const removeFromWishlistAsync = createAsyncThunk(
  'wishlist/remove',
  async (productId: string, { getState, dispatch }) => {
    const state = getState() as any;
    const currentItems = state.wishlist.items;
    const newItems = currentItems.filter((id: string) => id !== productId);
    
    // Update local state immediately
    dispatch(removeFromWishlist(productId));
    
    // Try to sync with backend
    try {
      await api.post('/wishlist', { items: newItems });
    } catch (error) {
      console.error('Failed to sync wishlist to backend:', error);
      // Don't throw error - local state is already updated
    }
    
    return productId;
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist(state, action: PayloadAction<string>) {
      if (!state.items.includes(action.payload)) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter(id => id !== action.payload);
    },
    clearWishlist(state) {
      state.items = [];
    },
    setWishlist(state, action: PayloadAction<string[]>) {
      state.items = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(syncWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(syncWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  addToWishlist, 
  removeFromWishlist, 
  clearWishlist, 
  setWishlist 
} = wishlistSlice.actions;
export default wishlistSlice.reducer;
