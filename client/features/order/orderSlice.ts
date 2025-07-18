import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../cart/cartSlice';
import { createOrder, fetchOrders } from '../../lib/api';

interface Order {
  _id: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: string;
  status: string;
  shippingAddress: string;
  addressLabel?: string;
  addressId?: string;
  paymentMethod: string;
  isPaid: boolean;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
};

export const placeOrderAsync = createAsyncThunk(
  'order/placeOrderAsync',
  async (orderPayload: { 
    items: CartItem[]; 
    total: number; 
    addressId?: string;
    guestInfo?: {
      fullName: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }, { rejectWithValue }) => {
    try {
      const data = await createOrder(orderPayload);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


export const fetchOrdersAsync = createAsyncThunk(
  'order/fetchOrdersAsync',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchOrders();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(placeOrderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrderAsync.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(placeOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrdersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersAsync.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrdersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default orderSlice.reducer;
