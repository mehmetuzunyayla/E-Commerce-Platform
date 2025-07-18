import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

export interface Review {
  _id: string;
  product: string;
  user: string | { _id: string; email: string };
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  canReview: boolean | null;
}

const initialState: ReviewState = {
  reviews: [],
  loading: false,
  error: null,
  canReview: null,
};

export const fetchReviews = createAsyncThunk(
  'review/fetchReviews',
  async (productId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/reviews/product/${productId}`);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addReview = createAsyncThunk(
  'review/addReview',
  async ({ productId, review }: { productId: string; review: any }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/reviews`, { ...review, product: productId });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateReview = createAsyncThunk(
  'review/updateReview',
  async ({ reviewId, review }: { reviewId: string; review: any }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/reviews/${reviewId}`, review);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteReview = createAsyncThunk(
  'review/deleteReview',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      return reviewId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const checkCanReview = createAsyncThunk(
  'review/checkCanReview',
  async (productId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/reviews/can-review/${productId}`);
      return data.canReview;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action: PayloadAction<Review[]>) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addReview.fulfilled, (state, action: PayloadAction<Review>) => {
        state.reviews.unshift(action.payload);
      })
      .addCase(updateReview.fulfilled, (state, action: PayloadAction<Review>) => {
        const index = state.reviews.findIndex(review => review._id === action.payload._id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
      })
      .addCase(deleteReview.fulfilled, (state, action: PayloadAction<string>) => {
        state.reviews = state.reviews.filter(review => review._id !== action.payload);
      })
      .addCase(checkCanReview.fulfilled, (state, action: PayloadAction<boolean>) => {
        state.canReview = action.payload;
      });
  },
});

export default reviewSlice.reducer;
