# Guest Order System - Implementation Summary

## Overview
This system allows customers to place and manage orders without logging in, with automatic cleanup and the ability to add items to existing active orders.

## Features Implemented

### 1. Guest Order Persistence (localStorage)
- **Location**: `src/lib/guestOrder.js`
- Stores order info: `{ id, restaurantId, status, createdAt }`
- Tracks completion time for 15-minute expiry window
- Helper functions for save/get/remove/cleanup

### 2. Order Placement Flow
- **Location**: `src/components/CartDrawer.jsx`
- **New Order**: Requires table selection, creates new order
- **Add to Existing**: If active order exists (pending/accepted), appends items without requiring table selection
- Auto-fills customer name and phone from previous order
- Shows "Table X (Your table)" option when active order exists

### 3. Menu Page Integration
- **Location**: `src/app/(pages)/(customer)/components/Header.jsx`
- Shows user icon only when guestOrder exists for current restaurant
- "View your order" button navigates to order status page
- Listens for socket updates to sync order status
- Auto-cleanup every 10 seconds

### 4. Order Status Page
- **Location**: `src/app/(pages)/(customer)/orderSuccess/[orderId]/page.jsx`
- Real-time status updates via socket
- 15-minute countdown when order completes
- Auto-removes guestOrder after countdown expires
- Copy order link functionality

### 5. Chef Notifications (NEW)
- **Backend**: `backend/controllers/orders/orderController.js`
  - Emits `order:items-added` event when items are added to existing order
  - Includes order details, table number, and message

- **Frontend**: `src/app/(pages)/chef/dashboard/page.jsx`
  - Listens for `order:items-added` socket event
  - Shows toast notification: "Table X added more items to their order"
  - Highlights affected order with blue background and pulse animation
  - "ITEMS ADDED" badge appears next to table number
  - Highlight auto-removes after 10 seconds

## Socket Events

### Customer-Facing
- `joinOrder` - Join a specific order room
- `order:update` - Receive real-time order status updates

### Chef-Facing
- `joinRestaurant` - Join restaurant's kitchen room
- `order:new` - New order placed
- `order:update` - Order status changed
- `order:items-added` - Items added to existing order (NEW)

## Order Lifecycle

1. **Customer places first order**
   - Selects table, enters name/phone
   - Order saved to localStorage as guestOrder
   - Backend creates order, emits `order:new`

2. **Customer adds more items (order still active)**
   - Opens cart, sees "Your table" pre-selected
   - Name/phone auto-filled
   - Clicks "Place Order" → items appended via `PATCH /orders/:id/add-items`
   - Backend emits `order:items-added` to kitchen
   - Chef dashboard shows notification and highlights order

3. **Chef marks order completed**
   - Backend emits `order:update` with status "completed"
   - Customer page starts 15-minute countdown
   - guestOrderCompletedAt timestamp saved

4. **Auto-cleanup after 15 minutes**
   - Timer expires → removes guestOrder from localStorage
   - User icon disappears from menu header
   - "Your table" option removed from cart
   - Customer can place fresh order

## API Endpoints

### Orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/add-items` - Add items to existing order (NEW)
- `GET /api/orders/order/:id` - Get order details (public)
- `PATCH /api/orders/status/:id` - Update order status (chef only)

### Restaurant
- `GET /api/restaurant/:id/tables` - Get available tables

## Key Files Modified

### Backend
- `backend/controllers/orders/orderController.js` - Added `addItemsToOrder` function with notification
- `backend/routes/orderRoutes.js` - Added PATCH route for adding items

### Frontend
- `src/lib/guestOrder.js` - Guest order utilities (NEW)
- `src/components/CartDrawer.jsx` - Order placement and merge logic
- `src/app/(pages)/(customer)/components/Header.jsx` - User icon visibility
- `src/app/(pages)/(customer)/orderSuccess/[orderId]/page.jsx` - Status tracking
- `src/app/(pages)/chef/dashboard/page.jsx` - Chef notifications and highlighting

## Testing Checklist

- [ ] Place first order → check localStorage has guestOrder
- [ ] Navigate back to menu → user icon appears
- [ ] Add more items → "Your table" pre-selected, name/phone filled
- [ ] Place order → chef gets notification "Table X added more items"
- [ ] Chef dashboard shows highlighted order with "ITEMS ADDED" badge
- [ ] Highlight disappears after 10 seconds
- [ ] Mark order completed → countdown starts (15:00)
- [ ] After countdown → guestOrder removed, user icon disappears
- [ ] Try to order again → requires table selection

## Environment Setup

```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd ..
npm install
npm run dev
```

## Socket.io Server
- Default URL: `http://localhost:8000`
- Configured in: `backend/socket/io.js`

---

**Last Updated**: October 17, 2025
