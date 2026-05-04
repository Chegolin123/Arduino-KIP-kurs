// Расположение: C:\OSPanel\domains\Arduino\client\src\store\chaptersSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/axios';

export const fetchChapters = createAsyncThunk(
  'chapters/fetchChapters',
  async (courseId, { rejectWithValue }) => {
    try {
      const params = courseId ? { course_id: courseId } : {};
      const response = await API.get('/chapters', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки глав');
    }
  }
);

export const fetchSection = createAsyncThunk(
  'chapters/fetchSection',
  async (sectionId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/sections/${sectionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки раздела');
    }
  }
);

const initialState = {
  chapters: [],
  currentSection: null,
  loading: false,
  error: null,
};

const chaptersSlice = createSlice({
  name: 'chapters',
  initialState,
  reducers: {
    clearCurrentSection: (state) => {
      state.currentSection = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChapters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChapters.fulfilled, (state, action) => {
        state.loading = false;
        state.chapters = action.payload.chapters || [];
      })
      .addCase(fetchChapters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSection.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSection.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSection = action.payload.section;
      })
      .addCase(fetchSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentSection } = chaptersSlice.actions;
export default chaptersSlice.reducer;