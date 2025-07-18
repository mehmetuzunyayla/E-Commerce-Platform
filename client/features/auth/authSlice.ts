// client/features/auth/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';
import { AuthState, LoginPayload, RegisterPayload, AuthResponse, User } from '../../types/auth';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Initialize from localStorage if available
if (typeof window !== 'undefined') {
  const storedToken = localStorage.getItem('accessToken');
  const storedUser = localStorage.getItem('user');
  
  if (storedToken && storedUser) {
    try {
      initialState.accessToken = storedToken;
      initialState.user = JSON.parse(storedUser);
      initialState.isAuthenticated = true;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
    }
  }
}

export const loginThunk = createAsyncThunk<
  AuthResponse,
  LoginPayload,
  { rejectValue: string }
>('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', payload);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || 'Login failed. Please try again.'
    );
  }
});

export const registerThunk = createAsyncThunk<
  { message: string; user: User },
  RegisterPayload,
  { rejectValue: string }
>('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', payload);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || 'Register failed. Please try again.'
    );
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.user;
        state.accessToken = payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
        
        // Store token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', payload.accessToken);
          localStorage.setItem('user', JSON.stringify(payload.user));
        }
      })
      .addCase(loginThunk.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      // Register
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = null; // Don't set user until email is verified
        state.accessToken = null; // Don't set token until email is verified
        state.isAuthenticated = false; // Don't authenticate until email is verified
        state.error = null;
      })
      .addCase(registerThunk.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
