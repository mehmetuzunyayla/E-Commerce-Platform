import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Product } from '../../types/product';
import api from '../../lib/api';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: { size?: string; color?: string } | null;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunks for API integration
export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check if user is authenticated
      const state = getState() as any;
      const isAuthenticated = state.auth.isAuthenticated;
      
      // Use different endpoints based on authentication status
      const endpoint = isAuthenticated ? '/carts' : '/carts/guest';
      
      const response = await api.get(endpoint);
      
      // Transform backend cart items to frontend format
      const items = response.data.items?.map((item: any) => ({
        product: item.product,
        quantity: item.quantity,
        selectedVariant: item.selectedVariant || null,
      })) || [];
      
      return items;
    } catch (err: any) {
      console.error('Fetch cart error:', err);
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  'cart/addItem',
  async ({ product, quantity = 1, selectedVariant }: { product: Product; quantity?: number; selectedVariant?: { size?: string; color?: string } | null }, { rejectWithValue, getState }) => {
    try {
      // Check if user is authenticated
      const state = getState() as any;
      const isAuthenticated = state.auth.isAuthenticated;
      
      // Use different endpoints based on authentication status
      const endpoint = isAuthenticated ? '/carts/items' : '/carts/guest/items';
      
      const response = await api.post(endpoint, {
        product: product._id,
        quantity,
        selectedVariant,
      });
      
      return { product, quantity, selectedVariant };
    } catch (err: any) {
      console.error('Add to cart error:', err);
      return rejectWithValue(err.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

export const updateCartItemAsync = createAsyncThunk(
  'cart/updateItem',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const isAuthenticated = state.auth.isAuthenticated;
      
      if (isAuthenticated) {
        await api.patch(`/carts/items/${productId}`, { quantity });
      } else {
        // For guest users, just return success (no backend persistence)
      }
      return { productId, quantity };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update cart item');
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  'cart/removeItem',
  async (productId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const isAuthenticated = state.auth.isAuthenticated;
      
      if (isAuthenticated) {
        await api.delete(`/carts/items/${productId}`);
      } else {
        // For guest users, just return success (no backend persistence)
      }
      return productId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove item from cart');
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const isAuthenticated = state.auth.isAuthenticated;
      
      if (isAuthenticated) {
        await api.delete('/carts/clear');
      } else {
        // For guest users, just return success (no backend persistence)
      }
      return true;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to clear cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Local state updates (for immediate UI feedback)
    addToCart(state, action: PayloadAction<{ product: Product; quantity?: number }>) {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((item) => item.product._id === product._id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.product._id !== action.payload);
    },
    updateQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const item = state.items.find((item) => item.product._id === action.payload.productId);
      if (item) item.quantity = action.payload.quantity;
    },
    clearCart(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add to cart
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { product, quantity, selectedVariant } = action.payload;
        const existing = state.items.find((item) => item.product._id === product._id);
        if (existing) {
          existing.quantity += quantity;
        } else {
          state.items.push({ product, quantity, selectedVariant });
        }
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update cart item
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        const { productId, quantity } = action.payload;
        const item = state.items.find((item) => item.product._id === productId);
        if (item) {
          item.quantity = quantity;
        }
      })
      // Remove from cart
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.product._id !== action.payload);
      })
      // Clear cart
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
