"use client";

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import customerMenuReducer from "./customerMenuSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customerMenu: customerMenuReducer,
  },
});

export default store;
export const AppDispatch = store.dispatch;
