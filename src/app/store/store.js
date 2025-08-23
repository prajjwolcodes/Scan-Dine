"use client";

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;
export const AppDispatch = store.dispatch;
