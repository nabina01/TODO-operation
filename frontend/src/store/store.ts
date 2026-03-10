// This file sets up the Redux store for the application using Redux Toolkit.
//store - The actual Redux store
//RootState - Type for entire app state
//AppDispatch - Type for dispatch function

import { configureStore } from '@reduxjs/toolkit';
import todoReducer from './todoSlice';

export const store = configureStore({
  reducer: {
    todos: todoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
