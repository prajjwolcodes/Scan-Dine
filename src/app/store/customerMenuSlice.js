import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// Fetch menu for a given restaurant
export const fetchRestaurantMenu = createAsyncThunk(
  "/menu",
  async (thunkAPI) => {
    try {
      const res = await api.get(`/menu-items`);
      return { data: res.data };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch menu"
      );
    }
  }
);

const initialState = {
  menus: {},
  loading: false,
  error: null,
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurantMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantMenu.fulfilled, (state, action) => {
        state.loading = false;
        const { restaurantId, data } = action.payload;
        state.menus[restaurantId] = {
          categories: data.categories,
          menuItems: data.menuItems,
        };
      })
      .addCase(fetchRestaurantMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default menuSlice.reducer;
