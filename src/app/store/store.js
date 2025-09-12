"use client";

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import menuReducer from "./menuSlice.js";
import cartReducer from "./cartSlice.js";
import restaurantReducer from "./restaurantSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
    cart: cartReducer,
    restaurant: restaurantReducer,
  },
});

export default store;
export const AppDispatch = store.dispatch;
