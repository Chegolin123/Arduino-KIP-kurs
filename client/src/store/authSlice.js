// Расположение: C:\OSPanel\domains\Arduino\client\src\store\authSlice.js
// Redux Slice для аутентификации

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/axios';

// Регистрация
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      return { token, user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.errors?.[0]?.msg || 
        'Ошибка регистрации'
      );
    }
  }
);

// Вход
export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/login', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      return { token, user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка входа'
      );
    }
  }
);

// Загрузка профиля
export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/auth/profile');
      return { user: response.data.user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки профиля'
      );
    }
  }
);

const token = localStorage.getItem('token');

const initialState = {
  user: null,
  token: token,
  isAuthenticated: false, // Начинаем с false, проверим при загрузке
  loading: false,
  error: null,
  initialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.initialized = true;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    setInitialized: (state) => {
      state.initialized = true;
    },
    restoreSession: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.token = localStorage.getItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      // Регистрация
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.initialized = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.initialized = true;
      })
      // Вход
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.initialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.initialized = true;
      })
      // Загрузка профиля
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Если профиль не загрузился — сбрасываем авторизацию
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.initialized = true;
        localStorage.removeItem('token');
      });
  },
});

export const { logout, clearError, setInitialized, restoreSession } = authSlice.actions;
export default authSlice.reducer;