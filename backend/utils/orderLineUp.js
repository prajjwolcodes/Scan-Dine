// utils/orderUtils.js

import MenuItem from "../models/menuItemSchema.js";

/**
 * Validates requested items, builds order items with name & unitPrice snapshot,
 * and returns { orderItems, total }.
 * @param {ObjectId} restaurantId
 * @param {Array<{ menuItemId: string, quantity: number }>} inputItems
 */
export async function buildOrderLines(restaurantId, inputItems) {
  if (!Array.isArray(inputItems) || inputItems.length === 0) {
    throw new Error("Items array is required");
  }

  const ids = inputItems.map((i) => i.menuItemId);
  const menuItems = await MenuItem.find({
    _id: { $in: ids },
    restaurant: restaurantId,
    available: true,
  });

  // Map for quick lookup
  const byId = new Map(menuItems.map((m) => [m._id.toString(), m]));

  const orderItems = [];
  let total = 0;

  for (const row of inputItems) {
    const doc = byId.get(row.menuItemId);
    if (!doc) throw new Error("One or more items are invalid/unavailable");

    const qty = Math.max(1, Number(row.quantity || 1));
    const unitPrice = Number(doc.price);

    orderItems.push({
      menuItem: doc._id,
      name: doc.name,
      unitPrice,
      quantity: qty,
    });

    total += unitPrice * qty;
  }

  return { orderItems, total };
}
