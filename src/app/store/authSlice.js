import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// Async Thunks
export const signup = createAsyncThunk(
  "auth/signup",
  async (data, thunkAPI) => {
    try {
      const res = await api.post(`/auth/signup`, data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const res = await api.post(`/auth/login`, data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response.data);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null, // Initialize with null
    token: null, // Initialize with null
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      console.log("hello");
      state.user = null;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },
    setInitialState: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(action.payload.user)); // Store objects as strings
          localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(action.payload.user)); // Store objects as strings
          localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  },
});

export const { logout, setInitialState } = authSlice.actions;
export default authSlice.reducer;
