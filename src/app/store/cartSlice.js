import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// --- Async Thunk to Place Order ---
export const placeOrder = createAsyncThunk(
  "cart/placeOrder",
  async (
    { restaurantId, tableNumber, customerName, customerPhone },
    { getState, rejectWithValue }
  ) => {
    try {
      const { cart } = getState(); // full cart state
      const payload = {
        restaurantId,
        tableNumber,
        items: cart.items.map((i) => ({
          menuItemId: i._id, // ✅ match backend field
          quantity: i.qty,
        })),
        total: cart.totalPrice,
        paymentMethod: "cash",
        customerName,
        customerPhone,
      };

      const res = await api.post(`/orders`, payload);

      // socket.emit("order:placed", res.data.order); // notify via socket
      return res.data; // { success, order, message }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Order failed. Try again."
      );
    }
  }
);

const loadFromLocal = () => {
  try {
    const raw = localStorage.getItem("cart");
    return raw
      ? JSON.parse(raw)
      : { items: [], totalQty: 0, totalPrice: 0, open: false };
  } catch {
    return { items: [], totalQty: 0, totalPrice: 0, open: false };
  }
};

const persist = (state) => {
  try {
    localStorage.setItem("cart", JSON.stringify(state));
  } catch {}
};

const initial = {
  ...loadFromLocal(),
  placing: false,
  lastOrder: null,
  orderError: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState: initial,
  reducers: {
    addToCart: (state, action) => {
      const item = { ...action.payload, qty: action.payload.qty || 1 };
      const existing = state.items.find((i) => i._id === item._id);
      if (existing) {
        existing.qty += item.qty;
      } else {
        state.items.push(item);
      }
      state.totalQty = state.items.reduce((s, i) => s + i.qty, 0);
      state.totalPrice = state.items.reduce((s, i) => s + i.qty * i.price, 0);
      persist(state);
    },
    increaseQty: (state, action) => {
      const id = action.payload;
      const item = state.items.find((i) => i._id === id);
      if (item) item.qty += 1;
      state.totalQty = state.items.reduce((s, i) => s + i.qty, 0);
      state.totalPrice = state.items.reduce((s, i) => s + i.qty * i.price, 0);
      persist(state);
    },
    decreaseQty: (state, action) => {
      const id = action.payload;
      const item = state.items.find((i) => i._id === id);
      if (!item) return;
      if (item.qty === 1) {
        state.items = state.items.filter((i) => i._id !== id);
      } else {
        item.qty -= 1;
      }
      state.totalQty = state.items.reduce((s, i) => s + i.qty, 0);
      state.totalPrice = state.items.reduce((s, i) => s + i.qty * i.price, 0);
      persist(state);
    },
    removeItem: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((i) => i._id !== id);
      state.totalQty = state.items.reduce((s, i) => s + i.qty, 0);
      state.totalPrice = state.items.reduce((s, i) => s + i.qty * i.price, 0);
      persist(state);
    },
    openCart: (state) => {
      state.open = true;
    },
    closeCart: (state) => {
      state.open = false;
    },
    clearCart: (state) => {
      state.items = [];
      state.totalQty = 0;
      state.totalPrice = 0;
      state.open = false;
      persist(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.placing = true;
        state.orderError = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.placing = false;
        state.lastOrder = action.payload.order;
        state.items = [];
        state.totalQty = 0;
        state.totalPrice = 0;
        state.open = false;
        persist(state);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placing = false;
        state.orderError = action.payload || "Failed to place order";
      });
  },
});

export const {
  addToCart,
  increaseQty,
  decreaseQty,
  removeItem,
  openCart,
  closeCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
