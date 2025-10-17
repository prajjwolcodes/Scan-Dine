// Utilities to manage guest order persistence and expiry

const GUEST_ORDER_KEY = "guestOrder";
const GUEST_ORDER_COMPLETED_AT_KEY = "guestOrderCompletedAt";

// Save or update guest order basic info
export function saveGuestOrder({ id, restaurantId, status }) {
  try {
    const payload = {
      id,
      restaurantId,
      status,
      createdAt: Date.now(),
    };
    localStorage.setItem(GUEST_ORDER_KEY, JSON.stringify(payload));
    return payload;
  } catch (_) {}
}

export function getGuestOrder() {
  try {
    const raw = localStorage.getItem(GUEST_ORDER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function removeGuestOrder() {
  try {
    localStorage.removeItem(GUEST_ORDER_KEY);
    localStorage.removeItem(GUEST_ORDER_COMPLETED_AT_KEY);
  } catch (_) {}
}

// Mark completion timestamp for expiry countdown (15 minutes)
export function markGuestOrderCompleted(orderId) {
  try {
    const completedAt = Date.now();
    localStorage.setItem(
      GUEST_ORDER_COMPLETED_AT_KEY,
      JSON.stringify({ id: orderId, completedAt })
    );
    return completedAt;
  } catch (_) {}
}

export function getGuestOrderCompletedAt() {
  try {
    const raw = localStorage.getItem(GUEST_ORDER_COMPLETED_AT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

// Check if guestOrder is still valid considering completion expiry
export function isGuestOrderActiveForRestaurant(restaurantId) {
  const order = getGuestOrder();
  if (!order) return false;
  if (restaurantId && order.restaurantId && order.restaurantId !== restaurantId)
    return false;

  // If completed timestamp exists, ensure it's within 15 minutes
  const completed = getGuestOrderCompletedAt();
  if (completed && completed.completedAt) {
    const elapsedSec = (Date.now() - completed.completedAt) / 1000;
    if (elapsedSec >= 15 * 60) {
      removeGuestOrder();
      return false;
    }
  }
  return true;
}

// Cleanup if expired by completion time
export function cleanupExpiredGuestOrder() {
  const completed = getGuestOrderCompletedAt();
  if (!completed) return false;
  const elapsedSec = (Date.now() - completed.completedAt) / 1000;
  if (elapsedSec >= 15 * 60) {
    removeGuestOrder();
    return true;
  }
  return false;
}
