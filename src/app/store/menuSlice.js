import api from "@/lib/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch categories & menu items for a restaurant
export const fetchRestaurantMenu = createAsyncThunk(
  "menu/fetchRestaurantMenu",
  async (restaurantId, { rejectWithValue }) => {
    try {
      // two endpoints assumed:
      // GET /api/categories/:restaurantId  -> { categories: [...] }
      // GET /api/menu-items/:restaurantId -> { menuItems: [...] }
      const [catRes, menuRes] = await Promise.all([
        api.get(`/category/customer/${restaurantId}`),
        api.get(`/menu-items/customer/${restaurantId}`),
      ]);

      return {
        categories: catRes.data.categories || [],
        menuItems: menuRes.data.menuItems || [],
        restaurant: catRes.data.restaurant || null, // optional if you include restaurant meta in categories endpoint
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch menu"
      );
    }
  }
);

const menuSlice = createSlice({
  name: "menu",
  initialState: {
    restaurant: null,
    categories: [],
    menuItems: [],
    status: "idle",
    error: null,
  },
  reducers: {
    // If you want local changes (not necessary for read-only)
    clearMenu: (state) => {
      state.restaurant = null;
      state.categories = [];
      state.menuItems = [];
      state.status = "idle";
      state.error = null;
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
        if (action.payload.restaurant)
          state.restaurant = action.payload.restaurant;
      })
      .addCase(fetchRestaurantMenu.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearMenu } = menuSlice.actions;
export default menuSlice.reducer;
