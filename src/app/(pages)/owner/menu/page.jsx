"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import api from "@/lib/axios";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "@/app/store/authSlice";
import { useRouter } from "next/navigation";
import { Plus, Edit3, Trash2, Image as ImageIcon } from "lucide-react";
import WelcomeScreen from "@/components/WelcomeScreen";
import ItemModal from "@/components/ItemModel";

/*
  Integrated UI:
  - Sidebar: categories with Add/Edit category popups (modal).
  - Main: items grid for selected category, Add/Edit item popups (modal).
  - Uses all your original handlers & state names unchanged.
*/

export default function RestaurantDashboard() {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // CATEGORY state (from your original)
  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCatForm, setEditCatForm] = useState({ name: "", description: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);

  // MENU state (from your original)
  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    available: true,
    categoryId: "",
  });
  const [menuItems, setMenuItems] = useState([]);
  const [editingMenu, setEditingMenu] = useState(null);
  const [editMenuForm, setEditMenuForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    available: true,
    categoryId: "",
  });

  const [categoryLoading, setCategoryLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const router = useRouter();

  // NEW UI state: selected category + modals
  const [selectedCatId, setSelectedCatId] = useState("");
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);

  const [showItemModal, setShowItemModal] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);

  const [showWelcome, setShowWelcome] = useState(true);

  // ---------- Keep original image upload handlers unchanged ----------
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (data.secure_url) {
        setMenuForm({ ...menuForm, image: data.secure_url });
        toast.success("Image uploaded!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleEditImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingEdit(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_UPLOAD_PRESET);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        setEditMenuForm((f) => ({ ...f, image: data.secure_url }));
        toast.success("Image updated!");
      } else throw new Error();
    } catch {
      toast.error("Failed to upload new image");
    } finally {
      setUploadingEdit(false);
    }
  };

  // ---------- Fetch categories + menu items (kept same) ----------
  useEffect(() => {
    if (!user?.restaurant || !token) return;
    let ignore = false;
    async function fetchData() {
      try {
        const [resCat, resMenu] = await Promise.all([
          api.get(`/category`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/menu-items`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (!ignore) {
          setCategories(resCat.data.categories || []);
          setMenuItems(resMenu.data.menuItems || []);
        }
      } catch {
        toast.error("Failed to load data");
      }
    }
    fetchData();
    return () => {
      ignore = true;
    };
  }, [user?.restaurant, token]);

  // keep selected category in sync when categories update
  useEffect(() => {
    if (!selectedCatId && categories.length > 0) {
      setSelectedCatId(categories[0]._id);
    } else if (categories.length === 0) {
      setSelectedCatId("");
    } else {
      // keep selection if exists, otherwise fallback to first
      const exists = categories.find((c) => c._id === selectedCatId);
      if (!exists) setSelectedCatId(categories[0]._id);
    }
  }, [categories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000); // 👈 match the same duration as in WelcomeScreen

    return () => clearTimeout(timer);
  }, []);

  // ---------- Keep your original handlers but adapt UI triggers ----------
  // Category submit (kept)
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setCategoryLoading(true);
    try {
      const res = await api.post(
        "/category",
        { ...catForm, restaurant: user.restaurant },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories([...categories, res.data.category]);
      setCatForm({ name: "", description: "" });
      toast.success("Category created!");
      setShowAddCategoryModal(false);
      setSelectedCatId(res.data.category._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setCategoryLoading(false);
    }
  };

  // Category save (kept)
  const handleCategorySave = async (id) => {
    try {
      const res = await api.put(`/category/${id}`, editCatForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(
        categories.map((c) => (c._id === id ? res.data.category : c))
      );
      setEditingCategory(null);
      setShowEditCategoryModal(false);
      setEditCatForm({ name: "", description: "" });
      toast.success("Category updated!");
    } catch {
      toast.error("Failed to update category");
    }
  };

  // Category delete (kept)
  const handleCategoryDelete = async (id) => {
    try {
      await api.delete(`/category/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.filter((c) => c._id !== id));
      // remove items of that category locally as well
      setMenuItems(menuItems.filter((i) => i.category?._id !== id));
      if (selectedCatId === id) setSelectedCatId(categories[0]?._id || "");
      toast.success("Category deleted!");
    } catch {
      toast.error("Failed to delete category");
    }
  };

  // Menu submit (kept)
  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    setMenuLoading(true);
    try {
      const res = await api.post(
        "/menu-items",
        {
          ...menuForm,
          price: Number(menuForm.price),
          restaurant: user.restaurant,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Manually populate the category in the returned item since backend doesn't populate it
      const selectedCategory = categories.find(
        (cat) => cat._id === menuForm.categoryId
      );
      const newMenuItem = {
        ...res.data.menuItem,
        category: selectedCategory
          ? { _id: selectedCategory._id, name: selectedCategory.name }
          : null,
      };

      setMenuItems([...menuItems, newMenuItem]);
      setMenuForm({
        name: "",
        description: "",
        price: "",
        image: "",
        available: true,
        categoryId: selectedCatId, // Keep the same category selected for next item
      });
      toast.success("Menu item created!");
      setShowItemModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create menu item");
    } finally {
      setMenuLoading(false);
    }
  };

  // Menu save (kept)
  const handleMenuSave = async (id) => {
    try {
      const res = await api.put(
        `/menu-items/${id}`,
        { ...editMenuForm },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Manually populate the category in the updated item since backend doesn't populate it
      const selectedCategory = categories.find(
        (cat) => cat._id === editMenuForm.categoryId
      );
      const updatedMenuItem = {
        ...res.data.menuItem,
        category: selectedCategory
          ? { _id: selectedCategory._id, name: selectedCategory.name }
          : null,
      };

      setMenuItems(menuItems.map((i) => (i._id === id ? updatedMenuItem : i)));
      setEditingMenu(null);
      setShowItemModal(false);
      toast.success("Menu updated!");
    } catch {
      toast.error("Failed to update menu item");
    }
  };

  // Menu delete (kept)
  const handleMenuDelete = async (id) => {
    try {
      await api.delete(`/menu-items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(menuItems.filter((i) => i._id !== id));
      toast.success("Menu deleted!");
    } catch {
      toast.error("Failed to delete menu item");
    }
  };

  // Utility: open add-item modal (populate menuForm.categoryId with selected)
  const openAddItemModal = () => {
    setIsEditingItem(false);
    setEditingMenu(null);
    setMenuForm((f) => ({
      ...f,
      name: "",
      description: "",
      price: "",
      image: "",
      available: true,
      categoryId: selectedCatId,
    }));
    setShowItemModal(true);
  };

  // Utility: open edit-item modal and populate editMenuForm
  const openEditItemModal = (item) => {
    setIsEditingItem(true);
    setEditingMenu(item._id);
    setEditMenuForm({
      name: item.name || "",
      description: item.description || "",
      price: item.price || "",
      image: item.image || "",
      available: item.available ?? true,
      categoryId: item.category?._id || "",
    });
    setShowItemModal(true);
  };

  // Derived items for current category - memoized to prevent unnecessary re-renders
  const visibleItems = useMemo(
    () => menuItems.filter((it) => it.category?._id === selectedCatId),
    [menuItems, selectedCatId]
  );

  // Memoized handlers to prevent unnecessary re-renders
  const memoizedOpenEditItemModal = useCallback((item) => {
    openEditItemModal(item);
  }, []);

  const memoizedHandleMenuDelete = useCallback((id) => {
    handleMenuDelete(id);
  }, []);

  /* ----------------- Presentational subcomponents ----------------- */
  const CategoryRow = ({ cat }) => {
    const isSelected = cat._id === selectedCatId;
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={`flex  items-center justify-between gap-3 p-3 rounded-lg cursor-pointer ${
          isSelected ? "bg-black text-gray-100" : "hover:bg-gray-50"
        }`}
        onClick={() => setSelectedCatId(cat._id)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-600" />
            <div className="font-medium truncate">{cat.name}</div>
          </div>
          {cat.description && (
            <div
              className={`text-xs ${
                isSelected ? "text-gray-200" : "text-gray-500"
              } mt-1 truncate`}
            >
              {cat.description}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingCategory(cat._id);
              setEditCatForm({
                name: cat.name,
                description: cat.description || "",
              });
              setShowEditCategoryModal(true);
            }}
            className={`p-1 rounded-md ${
              isSelected ? "bg-white/10" : "hover:bg-gray-100"
            }`}
            aria-label="Edit category"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCategoryDelete(cat._id);
            }}
            className="p-1 rounded-md hover:bg-red-50 text-red-600"
            aria-label="Delete category"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </motion.div>
    );
  };

  const ItemCard = memo(({ item, onEdit, onDelete }) => (
    <motion.div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 flex flex-col">
      {/* Image Section */}
      <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="object-cover object-center transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="w-8 h-8 mb-1" />
            <span className="text-sm">No image</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 space-y-1">
        <h4 className="font-semibold text-gray-800 text-base leading-tight truncate">
          {item.name}
        </h4>
        <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
      </div>

      {/* Footer Section */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-800">
            Rs {item.price}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="text-sm border cursor-pointer border-gray-300 bg-transparent text-black rounded-lg px-4 hover:bg-gray-100"
            onClick={() => onEdit(item)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            className="text-sm cursor-pointer rounded-lg px-3 hover:bg-gray-700"
            onClick={() => onDelete(item._id)}
          >
            Delete
          </Button>
        </div>
      </div>
    </motion.div>
  ));
  /* ----------------- JSX ----------------- */
  return showWelcome ? (
    <WelcomeScreen path="/owner/menu" />
  ) : (
    <div className="h-[calc(100vh)] flex p-4 bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Categories</h3>
          <Button
            size="sm"
            onClick={() => {
              setCatForm({ name: "", description: "" });
              setShowAddCategoryModal(true);
            }}
          >
            <Plus size={14} />
          </Button>
        </div>

        <div className="overflow-auto flex-1 space-y-2 py-1">
          {categories.length === 0 ? (
            <div className="text-sm text-gray-500">
              No categories yet. Add one.
            </div>
          ) : (
            categories.map((cat) => <CategoryRow key={cat._id} cat={cat} />)
          )}
        </div>

        <div className="text-xs text-gray-400">
          Tip: create categories first, then add menu items to them.
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">
              {selectedCatId
                ? categories.find((c) => c._id === selectedCatId)?.name ??
                  "Category"
                : "Select a category"}
            </h2>
            <p className="text-sm text-gray-500">
              Add items to the selected category
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="text-sm text-gray-500"
              onClick={async () => {
                // refresh categories + items (use your existing endpoints)
                try {
                  const resCat = await api.get(`/category`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  setCategories(resCat.data.categories || []);
                  const resMenu = await api.get(`/menu-items`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  setMenuItems(resMenu.data.menuItems || []);
                  toast.success("Refreshed");
                } catch {
                  toast.error("Failed to refresh");
                }
              }}
            >
              Refresh
            </button>

            <Button onClick={openAddItemModal} disabled={!selectedCatId}>
              <Plus size={14} /> <span className="ml-2">Add Item</span>
            </Button>
          </div>
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {visibleItems.length === 0 ? (
            <div className="col-span-full text-gray-500">
              No items in this category yet.
            </div>
          ) : (
            visibleItems.map((it) => (
              <ItemCard
                key={it._id}
                item={it}
                onEdit={memoizedOpenEditItemModal}
                onDelete={memoizedHandleMenuDelete}
              />
            ))
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={() => {
              dispatch(updateUser({ hasMenu: true }));
              router.push("/owner/dashboard");
            }}
            className="absolute bottom-8 right-8 bg-gray-800 text-gray-100 p-4 py-2 rounded-md font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </main>

      {/* ---------- Add Category Modal ---------- */}
      <AnimatePresence>
        {showAddCategoryModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowAddCategoryModal(false)}
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Category</h3>
                <button
                  className="text-gray-500"
                  onClick={() => setShowAddCategoryModal(false)}
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-3">
                <Input
                  placeholder="Category name"
                  value={catForm.name}
                  onChange={(e) =>
                    setCatForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
                <Input
                  placeholder="Short description (optional)"
                  value={catForm.description}
                  onChange={(e) =>
                    setCatForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddCategoryModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={categoryLoading}>
                    {categoryLoading ? "Saving..." : "Create"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Edit Category Modal ---------- */}
      <AnimatePresence>
        {showEditCategoryModal && editingCategory && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => {
                setShowEditCategoryModal(false);
                setEditingCategory(null);
              }}
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit Category</h3>
                <button
                  className="text-gray-500"
                  onClick={() => {
                    setShowEditCategoryModal(false);
                    setEditingCategory(null);
                  }}
                >
                  Close
                </button>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="Category name"
                  value={editCatForm.name}
                  onChange={(e) =>
                    setEditCatForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
                <Input
                  placeholder="Short description (optional)"
                  value={editCatForm.description}
                  onChange={(e) =>
                    setEditCatForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditCategoryModal(false);
                      setEditingCategory(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => handleCategorySave(editingCategory)}>
                    Save
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Add/Edit Item Modal ---------- */}
      <ItemModal
        showItemModal={showItemModal}
        setShowItemModal={setShowItemModal}
        isEditingItem={isEditingItem}
        menuForm={menuForm}
        setMenuForm={setMenuForm}
        editMenuForm={editMenuForm}
        setEditMenuForm={setEditMenuForm}
        editingMenu={editingMenu}
        categories={categories}
        handleImageUpload={handleImageUpload}
        handleEditImageUpload={handleEditImageUpload}
        handleMenuSubmit={handleMenuSubmit}
        handleMenuSave={handleMenuSave}
        menuLoading={menuLoading}
        uploading={uploading}
        uploadingEdit={uploadingEdit}
      />
    </div>
  );
}
