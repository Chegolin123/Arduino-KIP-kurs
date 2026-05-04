// Расположение: C:\OSPanel\domains\Arduino\client\src\store\index.js
// Конфигурация Redux Store

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import chaptersReducer from './chaptersSlice';
import productsReducer from './productsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chapters: chaptersReducer,
    products: productsReducer,
  },
});