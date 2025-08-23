"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import { setInitialState } from "./store/authSlice";
import store from "./store/store";

const StoreInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // This code runs only on the client side
    try {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (user && token) {
        dispatch(setInitialState({ user: JSON.parse(user), token }));
      }
    } catch (error) {
      console.error("Failed to load state from localStorage:", error);
      // Handle potential errors, e.g., malformed JSON
    }
  }, [dispatch]);

  return children;
};

const Providers = ({ children }) => {
  return (
    <Provider store={store}>
      <Toaster />
      <StoreInitializer>{children}</StoreInitializer>
    </Provider>
  );
};

export default Providers;
