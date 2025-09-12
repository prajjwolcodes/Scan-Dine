// src/app/store/restaurantSlice.js
import api from "@/lib/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async Thunks
export const fetchRestaurantMenu = createAsyncThunk(
  "restaurant/fetchMenu",
  async (restaurantId, { rejectWithValue }) => {
    try {
      const [categoriesRes, menuItemsRes] = await Promise.all([
        api.get(`/category/customer/${restaurantId}`), // make sure you create this endpoint
        api.get(`/menu-items/customer/${restaurantId}`), // you already have this
      ]);

      return {
        categories: categoriesRes.data.categories || [],
        menuItems: menuItemsRes.data.menuItems || [],
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch restaurant menu"
      );
    }
  }
);

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState: {
    categories: [],
    menuItems: [],
    cart: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // --- CART MANAGEMENT ---
    addToCart: (state, action) => {
      const item = action.payload; // { id, name, price, qty, image }
      const existing = state.cart.find((i) => i.id === item.id);
      if (existing) {
        existing.qty += item.qty;
      } else {
        state.cart.push(item);
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((i) => i.id !== action.payload);
    },
    updateCartQty: (state, action) => {
      const { id, qty } = action.payload;
      const existing = state.cart.find((i) => i.id === id);
      if (existing) {
        existing.qty = qty;
      }
    },
    clearCart: (state) => {
      state.cart = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurantMenu.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRestaurantMenu.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.categories = action.payload.categories;
        state.menuItems = action.payload.menuItems;
      })
      .addCase(fetchRestaurantMenu.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { addToCart, removeFromCart, updateCartQty, clearCart } =
  restaurantSlice.actions;

export default restaurantSlice.reducer;
