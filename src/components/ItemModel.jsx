"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

const ItemModal = ({
  showItemModal,
  setShowItemModal,
  isEditingItem,
  menuForm,
  setMenuForm,
  editMenuForm,
  setEditMenuForm,
  editingMenu,
  categories,
  handleImageUpload,
  handleEditImageUpload,
  handleMenuSubmit,
  handleMenuSave,
  menuLoading,
  uploading,
  uploadingEdit,
}) => {
  return (
    <AnimatePresence>
      {showItemModal && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowItemModal(false)}
          />

          {/* Modal content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-[18px] font-semibold">
                {isEditingItem ? "Edit Item" : "Add Menu Item"}
              </h3>
              <button
                className="text-sm sm:text-base text-gray-500 cursor-pointer"
                onClick={() => setShowItemModal(false)}
              >
                Close
              </button>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Name */}
              <div className="sm:col-span-2 flex flex-col gap-2">
                <Label>Item name</Label>
                <Input
                  value={isEditingItem ? editMenuForm.name : menuForm.name}
                  className="text-sm sm:text-base"
                  onChange={(e) => {
                    if (isEditingItem)
                      setEditMenuForm((f) => ({ ...f, name: e.target.value }));
                    else setMenuForm((f) => ({ ...f, name: e.target.value }));
                  }}
                />
              </div>

              {/* Price */}
              <div className="flex flex-col gap-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  className="text-sm sm:text-base"
                  value={isEditingItem ? editMenuForm.price : menuForm.price}
                  onChange={(e) => {
                    if (isEditingItem)
                      setEditMenuForm((f) => ({ ...f, price: e.target.value }));
                    else setMenuForm((f) => ({ ...f, price: e.target.value }));
                  }}
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <Label className="ml-1">Category</Label>
                <select
                  value={
                    isEditingItem
                      ? editMenuForm.categoryId
                      : menuForm.categoryId
                  }
                  onChange={(e) => {
                    if (isEditingItem)
                      setEditMenuForm((f) => ({
                        ...f,
                        categoryId: e.target.value,
                      }));
                    else
                      setMenuForm((f) => ({
                        ...f,
                        categoryId: e.target.value,
                      }));
                  }}
                  className="w-full border rounded-md p-2 text-sm sm:text-base"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="sm:col-span-2 flex flex-col gap-2">
                <Label>Description</Label>
                <Input
                  className="text-sm sm:text-base"
                  value={
                    isEditingItem
                      ? editMenuForm.description
                      : menuForm.description
                  }
                  onChange={(e) => {
                    if (isEditingItem)
                      setEditMenuForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }));
                    else
                      setMenuForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }));
                  }}
                />
              </div>

              {/* Image upload */}
              <div className="flex flex-col gap-2">
                <Label>Image</Label>
                <Input
                  className="text-sm sm:text-base"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (isEditingItem) handleEditImageUpload(e);
                    else handleImageUpload(e);
                  }}
                />
                {(isEditingItem ? editMenuForm.image : menuForm.image) && (
                  <img
                    src={isEditingItem ? editMenuForm.image : menuForm.image}
                    alt="preview"
                    className="w-28 h-28 object-cover rounded-md mt-2"
                  />
                )}
                {(isEditingItem ? uploadingEdit : uploading) && (
                  <div className="text-sm text-gray-500 mt-1">Uploading...</div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowItemModal(false)}>
                Cancel
              </Button>
              {isEditingItem ? (
                <Button onClick={() => handleMenuSave(editingMenu)}>
                  Save Item
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (!menuForm.categoryId)
                      return toast.error("Please select a category");
                    const fakeEvent = { preventDefault: () => {} };
                    handleMenuSubmit(fakeEvent);
                  }}
                  disabled={menuLoading || uploading}
                >
                  {menuLoading ? "Saving..." : "Add Item"}
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ItemModal;
