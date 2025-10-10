import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// Async thunk: update payment status to PAID
export const updatePaymentStatus = createAsyncThunk(
  "payment/updatePaymentStatus",
  async ({ orderId }, thunkAPI) => {
    try {
      // PATCH or PUT — depending on your backend route
      const res = await api.put(`/checkout/${orderId}/status`, {
        status: "PAID",
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: err.message }
      );
    }
  }
);

// Optional: fetch payment details
export const fetchPaymentDetails = createAsyncThunk(
  "payment/fetchPaymentDetails",
  async (orderId, thunkAPI) => {
    try {
      const res = await api.get(`/checkout/${orderId}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: err.message }
      );
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    payment: null,
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetPaymentState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // === Update Payment Status ===
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.payment = action.payload.payment; // { payment: {...} } from backend
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload.message || "Failed to update payment status";
      })

      // === Fetch Payment Details ===
      .addCase(fetchPaymentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.payment = action.payload.payment;
      })
      .addCase(fetchPaymentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  },
});

export const { resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
