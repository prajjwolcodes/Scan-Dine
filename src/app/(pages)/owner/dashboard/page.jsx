"use client";

import { logout } from "@/app/store/authSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChartNoAxesGantt,
  ChefHat,
  Download,
  Hamburger,
  House,
  LogOut,
  Pencil,
  Plus,
  Printer,
  QrCode,
  Search,
  Trash,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback, memo } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const NAV = [
  { key: "overview", label: "Overview", icon: <House /> },
  { key: "categories", label: "Categories", icon: <ChartNoAxesGantt /> },
  { key: "items", label: "Menu Items", icon: <Hamburger /> },
  { key: "chefs", label: "Chefs", icon: <ChefHat /> },
  { key: "qr", label: "Generate QR", icon: <QrCode /> },
];

// Extracted RestaurantEditModal outside the component to prevent re-creation
const RestaurantEditModal = memo(
  ({ isOpen, onClose, editForm, onSave, savingInfo, handlers }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Restaurant Info</h3>
              <button
                className="text-gray-500 hover:text-gray-700 transition-colors"
                onClick={onClose}
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editForm.name || ""}
                  onChange={handlers.handleNameChange}
                />

                <Label>Address</Label>
                <Input
                  value={editForm.address || ""}
                  onChange={handlers.handleAddressChange}
                />

                <Label>Phone</Label>
                <Input
                  value={editForm.phone || ""}
                  onChange={handlers.handlePhoneChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={editForm.email || ""}
                  onChange={handlers.handleEmailChange}
                />

                <Label>Opening Time</Label>
                <Input
                  type="time"
                  value={editForm.openingTime || ""}
                  onChange={handlers.handleOpeningTimeChange}
                />

                <Label>Closing Time</Label>
                <Input
                  type="time"
                  value={editForm.closingTime || ""}
                  onChange={handlers.handleClosingTimeChange}
                />

                <Label>Table Count</Label>
                <Input
                  type="number"
                  value={editForm.tableCount || 0}
                  onChange={handlers.handleTableCountChange}
                />
              </div>

              <div className="lg:col-span-2 flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={onClose} type="button">
                  Cancel
                </Button>
                <Button onClick={onSave} disabled={savingInfo}>
                  {savingInfo ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
);

RestaurantEditModal.displayName = "RestaurantEditModal";

export default function OwnerDashboard() {
  const { token, user } = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  // original states (kept)
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    tableCount: 0,
    openingTime: "",
    closingTime: "",
  });
  const [qrUrl, setQrUrl] = useState(null);

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [chefs, setChefs] = useState([]);

  const [loading, setLoading] = useState(true);

  // forms (kept)
  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    categoryId: "",
  });
  const [chefForm, setChefForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryForm, setEditCategoryForm] = useState({
    name: "",
    description: "",
  });

  const [editingMenu, setEditingMenu] = useState(null);
  const [editMenuForm, setEditMenuForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    categoryId: "",
  });

  const [uploading, setUploading] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);

  // UI state for layout & modals
  const [active, setActive] = useState("overview");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showAddChef, setShowAddChef] = useState(false);

  // search state
  const [categorySearch, setCategorySearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [itemCategoryFilter, setItemCategoryFilter] = useState("");

  const [restaurant, setRestaurant] = useState(null);

  // keep original image handlers (unchanged)
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
        setMenuForm((f) => ({ ...f, image: data.secure_url }));
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

  const openEdit = () => {
    if (!restaurant) return;
    setEditForm({
      name: restaurant.name || "",
      address: restaurant.address || "",
      phone: restaurant.phone || "",
      email: restaurant.email || "",
      tableCount: restaurant.tableCount ?? 0,
      openingTime: restaurant.openingTime || "",
      closingTime: restaurant.closingTime || "",
    });
    setIsEditOpen(true);
  };

  // save edit (PUT /restaurant/:id) - memoized to prevent re-creation
  const saveRestaurant = useCallback(async () => {
    if (!restaurant?._id) return;
    setSavingInfo(true);
    try {
      const res = await api.put(`/restaurant/${restaurant._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRestaurant(res.data.restaurant || { ...restaurant, ...editForm });
      toast.success("Restaurant info updated");
      setIsEditOpen(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update restaurant"
      );
    } finally {
      setSavingInfo(false);
    }
  }, [restaurant, token]);

  // Memoized handlers to prevent input focus loss
  const handleEditFormChange = useCallback((field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleNameChange = useCallback(
    (e) => {
      handleEditFormChange("name", e.target.value);
    },
    [handleEditFormChange]
  );

  const handleAddressChange = useCallback(
    (e) => {
      handleEditFormChange("address", e.target.value);
    },
    [handleEditFormChange]
  );

  const handlePhoneChange = useCallback(
    (e) => {
      handleEditFormChange("phone", e.target.value);
    },
    [handleEditFormChange]
  );

  const handleEmailChange = useCallback(
    (e) => {
      handleEditFormChange("email", e.target.value);
    },
    [handleEditFormChange]
  );

  const handleOpeningTimeChange = useCallback(
    (e) => {
      handleEditFormChange("openingTime", e.target.value);
    },
    [handleEditFormChange]
  );

  const handleClosingTimeChange = useCallback(
    (e) => {
      handleEditFormChange("closingTime", e.target.value);
    },
    [handleEditFormChange]
  );

  const handleTableCountChange = useCallback(
    (e) => {
      handleEditFormChange("tableCount", Number(e.target.value));
    },
    [handleEditFormChange]
  );

  // Memoized close handler to prevent re-creating on every render
  const handleCloseEditModal = useCallback(() => {
    setIsEditOpen(false);
  }, []);

  // Memoized handlers object to prevent re-creating on every render
  const editHandlers = useMemo(
    () => ({
      handleNameChange,
      handleAddressChange,
      handlePhoneChange,
      handleEmailChange,
      handleOpeningTimeChange,
      handleClosingTimeChange,
      handleTableCountChange,
    }),
    [
      handleNameChange,
      handleAddressChange,
      handlePhoneChange,
      handleEmailChange,
      handleOpeningTimeChange,
      handleClosingTimeChange,
      handleTableCountChange,
    ]
  );

  // computed booking info
  const bookedTables = useMemo(() => {
    if (!restaurant?.tables || !Array.isArray(restaurant.tables)) return 0;
    return restaurant.tables.filter((t) => t.isBooked).length;
  }, [restaurant]);

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

  // initial fetch (kept endpoints)
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [catRes, menuRes, chefRes, restaurantRes] = await Promise.all([
          api.get("/category", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/menu-items", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.post(
            "/auth/chefs",
            { restaurant: user.restaurant },
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          api.get("/restaurant/" + user._id, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setCategories(catRes.data.categories || []);
        setMenuItems(menuRes.data.menuItems || []);
        setChefs(chefRes.data.chefs || []);
        setRestaurant(restaurantRes.data.restaurant || null);
      } catch (err) {
        toast.error("Failed to fetch data from server");
      } finally {
        setLoading(false);
      }
    }
    if (token && user?.restaurant) fetchData();
  }, [token, user?.restaurant]);

  // QR generation (kept)
  const handleGenerateQr = async () => {
    try {
      const res = await api.post(
        "/qr/generate/" + user._id,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // setQrGenerated(true);
      setQrUrl(res.data.qrCodeUrl);
      toast.success("QR generated");
      setActive("qr");
    } catch (error) {
      console.log(error);
      toast.error("Failed to generate QR code");
    }
  };

  const handlePrint = () => {
    if (qrUrl) {
      const printWindow = window.open("", "_blank");
      printWindow?.document.write(`<img src="${qrUrl}" />`);
      printWindow?.print();
    }
  };

  // ---------- CATEGORY handlers (kept) ----------
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        "/category",
        { ...catForm, restaurant: user.restaurant },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories((s) => [...s, res.data.category]);
      setCatForm({ name: "", description: "" });
      setShowAddCategory(false);
      toast.success("Category created!");
      setActive("categories");
    } catch {
      toast.error("Failed to create category");
    }
  };

  const saveCategory = async (id) => {
    try {
      const res = await api.put(`/category/${id}`, editCategoryForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories((s) =>
        s.map((c) => (c._id === id ? res.data.category : c))
      );
      setEditingCategory(null);
      setShowEditCategory(false);
      toast.success("Category updated!");
    } catch {
      toast.error("Failed to update category");
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/category/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories((s) => s.filter((c) => c._id !== id));
      setMenuItems((s) => s.filter((m) => m.category?._id !== id)); // keep local sync
      toast.success("Category deleted!");
    } catch {
      toast.error("Failed to delete category");
    }
  };

  // ---------- MENU handlers (kept) ----------
  const handleMenuSubmit = async (e) => {
    e.preventDefault();
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
      setMenuItems((s) => [...s, res.data.menuItem]);
      setMenuForm({
        name: "",
        description: "",
        price: "",
        image: "",
        categoryId: "",
      });
      setShowAddItem(false);
      toast.success("Menu item created!");
    } catch {
      toast.error("Failed to create menu item");
    }
  };

  const saveMenu = async (id) => {
    try {
      const res = await api.put(`/menu-items/${id}`, editMenuForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems((s) => s.map((m) => (m._id === id ? res.data.menuItem : m)));
      setEditingMenu(null);
      setShowEditItem(false);
      toast.success("Menu updated!");
    } catch {
      toast.error("Failed to update menu item");
    }
  };

  const deleteMenu = async (id) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await api.delete(`/menu-items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems((s) => s.filter((m) => m._id !== id));
      toast.success("Menu deleted!");
    } catch {
      toast.error("Failed to delete menu item");
    }
  };

  // ---------- CHEF handlers (kept) ----------
  const handleAddChef = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        "/auth/createchef",
        { ...chefForm, restaurant: user.restaurant },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChefs((s) => [...s, res.data.chef]);
      setChefForm({ username: "", email: "", password: "" });
      setShowAddChef(false);
      toast.success("Chef added!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add chef");
    }
  };

  const removeChef = async (id) => {
    if (!confirm("Are you sure you want to remove this chef?")) return;
    try {
      await api.delete(`/auth/chef/remove/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChefs((s) => s.filter((c) => c._id !== id));
      toast.success("Chef removed!");
    } catch {
      toast.error("Failed to remove chef");
    }
  };

  // ---------- Derived filtered lists for search ----------
  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
    );
  }, [categories, categorySearch]);

  const filteredItems = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    return menuItems.filter((it) => {
      if (itemCategoryFilter && it.category?._id !== itemCategoryFilter)
        return false;
      if (!q) return true;
      return (
        (it.name || "").toLowerCase().includes(q) ||
        (it.description || "").toLowerCase().includes(q) ||
        (it.category?.name || "").toLowerCase().includes(q)
      );
    });
  }, [menuItems, itemSearch, itemCategoryFilter]);

  // ---------- small presentational components ----------
  const Sidebar = () => (
    <aside className="w-64 bg-white border-r min-h-screen hidden lg:flex flex-col">
      <div className="mb-6">
        <div className="text-xl font-bold">
          {restaurant?.name || "Your Restaurant"}
        </div>
        <div className="text-base text-gray-500 mt-1">
          {restaurant?.address}
        </div>
      </div>

      <nav className="flex-1 flex-col h-screen justify-between space-y-2">
        {NAV.map((n) => {
          const isActive = n.key === active;
          return (
            <button
              key={n.key}
              onClick={() => setActive(n.key)}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 cursor-pointer ${
                isActive ? "bg-black text-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <span className="font-medium">{n.icon}</span>
              <span className="font-medium">{n.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-1 border-t border-gray-300"> </div>
      <button
        onClick={() => dispatch(logout())}
        className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 cursor-pointer mb-12 `}
      >
        <span className="font-medium">
          <LogOut />
        </span>
        <span className="font-medium">Logout</span>
      </button>
    </aside>
  );

  const TopbarMobile = () => (
    <div className="lg:hidden bg-white border-b p-3 flex items-center justify-between">
      <div className="font-semibold">Scan & Dine</div>
      <select
        value={active}
        onChange={(e) => setActive(e.target.value)}
        className="border rounded-md p-1"
      >
        {NAV.map((n) => (
          <option key={n.key} value={n.key}>
            {n.label}
          </option>
        ))}
      </select>
    </div>
  );

  // ---------- Render Main Views ----------
  const Overview = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Total Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <div className="text-sm text-gray-500">
                Organize items by type
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Total Menu Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{menuItems.length}</div>
              <div className="text-sm text-gray-500">
                Items available in your menu
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Chefs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{chefs.length}</div>
              <div className="text-sm text-gray-500">
                People who can receive orders
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ------------ RESTAURANT INFO -------- */}
      </div>
      <motion.div>
        <Card className="w-full">
          <CardHeader className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl">{restaurant.name}</CardTitle>
              <CardDescription className="text-base">
                {" "}
                {restaurant.address}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={openEdit}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-6">Loading...</div>
            ) : restaurant ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-2">
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <div className="text-base text-gray-500">Phone</div>
                      <div className="font-medium">
                        {restaurant.phone || "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-base text-gray-500">Email</div>
                      <div className="font-medium">
                        {restaurant.email || "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-base text-gray-500">Opening</div>
                      <div className="font-medium">
                        {restaurant.openingTime || "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-base text-gray-500">Closing</div>
                      <div className="font-medium">
                        {restaurant.closingTime || "—"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md flex flex-col items-start gap-3">
                  <div className="text-base text-gray-500">Tables</div>
                  <div className="text-2xl font-bold">
                    {restaurant.tableCount ?? 0}
                  </div>
                  <div className="text-sm text-gray-500">
                    Booked: {bookedTables}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-gray-500">
                No restaurant information available.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <RestaurantEditModal
        isOpen={isEditOpen}
        onClose={handleCloseEditModal}
        editForm={editForm}
        onSave={saveRestaurant}
        savingInfo={savingInfo}
        handlers={editHandlers}
      />
    </>
  );

  const CategoriesView = () => (
    <>
      <div className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4 p-2 sm:p-4">
        <h2 className="text-xl font-semibold">Categories</h2>
        <p className="text-sm text-gray-500">
          Create and manage categories for your menu.
        </p>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="text:sm pl-10 sm:w-98"
            />
          </div>

          <Button
            onClick={() => {
              setCatForm({ name: "", description: "" });
              setShowAddCategory(true);
            }}
          >
            <Plus size={14} /> <span className="ml-2">Add Category</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCategories.length === 0 ? (
          <div className="text-gray-500">No categories found.</div>
        ) : (
          filteredCategories.map((c, index) => (
            <motion.div key={c._id} className="border rounded-md p-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  {c.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {c.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => {
                      setEditingCategory(c._id);
                      setEditCategoryForm({
                        name: c.name,
                        description: c.description || "",
                      });
                      setShowEditCategory(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteCategory(c._id)}
                    className="cursor-pointer"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </>
  );

  const ItemsView = () => (
    <>
      <div className="flex items-center justify-between mb-4 p-4">
        <div>
          <h2 className="text-xl font-semibold">Menu Items</h2>
          <p className="text-sm text-gray-500">
            Add menu items and assign them to categories.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search items..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              className="pl-10 w-92 "
            />
          </div>

          <select
            className="border rounded-md p-2"
            value={itemCategoryFilter}
            onChange={(e) => setItemCategoryFilter(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <Button
            onClick={() => {
              setMenuForm({
                name: "",
                description: "",
                price: "",
                image: "",
                categoryId: categories[0]?._id || "",
              });
              setShowAddItem(true);
            }}
          >
            <Plus size={14} /> <span className="ml-2">Add Item</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredItems.length === 0 ? (
          <div className="text-gray-500 col-span-full">No items found.</div>
        ) : (
          filteredItems.map((it, index) => (
            <motion.div key={it._id}>
              <div className="w-full h-52 bg-gray-50 rounded-md overflow-hidden mb-3 flex items-center justify-center">
                {it.image ? (
                  <img
                    src={it.image}
                    alt={it.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-sm text-gray-400">No image</div>
                )}
              </div>

              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{it.name}</h4>
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {it.description}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-medium">Rs {it.price}</div>
                  <div className="text-xs text-gray-400">
                    {it.category?.name} •{" "}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => {
                      setEditingMenu(it._id);
                      setEditMenuForm({
                        name: it.name,
                        description: it.description,
                        price: it.price,
                        image: it.image,
                        categoryId: it.category?._id || "",
                      });
                      setShowEditItem(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMenu(it._id)}
                    className="cursor-pointer"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </>
  );

  const ChefsView = () => (
    <>
      <div className="flex items-center justify-between mb-4 p-4">
        <div>
          <h2 className="text-xl font-semibold">Chefs</h2>
          <p className="text-sm text-gray-500">
            Add people who can receive orders and work in your kitchen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowAddChef(true)}
            className="cursor-pointer"
          >
            <Plus size={14} /> <span className="ml-2">Add Chef</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1  gap-4">
        {chefs.length === 0 ? (
          <div className="text-gray-500">No chefs yet.</div>
        ) : (
          chefs.map((c, index) => (
            <div
              key={index}
              className="border rounded-md p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{c.username}</p>
                <p className="text-sm text-gray-500">{c.email}</p>
              </div>
              <div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => removeChef(c._id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );

  const QRView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-gray-200/60 bg-white/70 backdrop-blur-md shadow-sm rounded-2xl p-4 pb-16">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-800 tracking-tight">
            Generate & Manage QR
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Section */}
            <div className="flex flex-col gap-4 mb-6 md:mb-0">
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                Create a QR code for your restaurant menu. Once generated, you
                can print or download it to share on tables, flyers, or social
                media — allowing customers to instantly access your digital
                menu.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleGenerateQr}
                  disabled={loading}
                  className="text-gray-100 px-5 py-2 rounded-lg shadow-sm transition-all"
                >
                  {loading ? "Generating..." : "Generate QR"}
                </Button>

                {qrUrl && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handlePrint}
                      className="flex items-center gap-2 border-gray-300 hover:bg-gray-100 transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </Button>

                    <a href={qrUrl} download="restaurant-qr.png">
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex justify-center">
              <div className="relative w-56 h-56 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 flex items-center justify-center shadow-inner">
                {qrUrl ? (
                  <Image
                    src={qrUrl}
                    alt="QR Code"
                    width={250}
                    height={250}
                    className="rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <QrCode className="w-12 h-12 mb-2" />
                    <p className="text-sm">No QR generated yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      {/* Mobile topbar */}
      <TopbarMobile />

      <div className="lg:flex lg:items-start">
        <Sidebar />

        <main className="flex-1 lg:pl-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {active === "overview" && <Overview />}
              {active === "categories" && <CategoriesView />}
              {active === "items" && <ItemsView />}
              {active === "chefs" && <ChefsView />}
              {active === "qr" && <QRView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ---------------- Dialogs ---------------- */}

      {/* Add Category Dialog */}
      <AnimatePresence>
        {showAddCategory && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => setShowAddCategory(false)}
            />
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-2">Create Category</h3>
              <form onSubmit={handleCategorySubmit} className="space-y-3">
                <Input
                  placeholder="Name"
                  value={catForm.name}
                  onChange={(e) =>
                    setCatForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
                <Input
                  placeholder="Description"
                  value={catForm.description}
                  onChange={(e) =>
                    setCatForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
                <div className="flex justify-end gap-2 mt-3 ">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowAddCategory(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="cursor-pointer">
                    Create
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Category Dialog */}
      <AnimatePresence>
        {showEditCategory && editingCategory && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => {
                setShowEditCategory(false);
                setEditingCategory(null);
              }}
            />
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-2">Edit Category</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Name"
                  value={editCategoryForm.name}
                  onChange={(e) =>
                    setEditCategoryForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
                <Input
                  placeholder="Description"
                  value={editCategoryForm.description}
                  onChange={(e) =>
                    setEditCategoryForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    className="cursor-pointer"
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditCategory(false);
                      setEditingCategory(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => saveCategory(editingCategory)}
                    className="cursor-pointer"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Item Dialog */}
      <AnimatePresence>
        {showAddItem && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => setShowAddItem(false)}
            />
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-2">Create Menu Item</h3>
              <form
                onSubmit={handleMenuSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Name"
                    value={menuForm.name}
                    onChange={(e) =>
                      setMenuForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <Input
                    type="number"
                    placeholder="Price"
                    value={menuForm.price}
                    onChange={(e) =>
                      setMenuForm((f) => ({ ...f, price: e.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <select
                    className="w-full border rounded-md p-2"
                    value={menuForm.categoryId}
                    onChange={(e) =>
                      setMenuForm((f) => ({ ...f, categoryId: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Textarea
                    placeholder="Description"
                    value={menuForm.description}
                    onChange={(e) =>
                      setMenuForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {uploading && (
                    <div className="text-sm text-gray-500 mt-1">
                      Uploading...
                    </div>
                  )}
                  {menuForm.image && (
                    <img
                      src={menuForm.image}
                      alt="preview"
                      className="w-28 h-28 object-cover rounded-md mt-2"
                    />
                  )}
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowAddItem(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={uploading}
                    type="submit"
                    className="cursor-pointer"
                  >
                    Create
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Item Dialog */}
      <AnimatePresence>
        {showEditItem && editingMenu && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => {
                setShowEditItem(false);
                setEditingMenu(null);
              }}
            />
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-2">Edit Menu Item</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    value={editMenuForm.name}
                    onChange={(e) =>
                      setEditMenuForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <Input
                    type="number"
                    value={editMenuForm.price}
                    onChange={(e) =>
                      setEditMenuForm((f) => ({ ...f, price: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <select
                    className="w-full border rounded-md p-2"
                    value={editMenuForm.categoryId}
                    onChange={(e) =>
                      setEditMenuForm((f) => ({
                        ...f,
                        categoryId: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Textarea
                    value={editMenuForm.description}
                    onChange={(e) =>
                      setEditMenuForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label>Change Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageUpload}
                  />
                  {uploadingEdit && (
                    <div className="text-sm text-gray-500 mt-1">
                      Uploading...
                    </div>
                  )}
                  {editMenuForm.image && (
                    <img
                      src={editMenuForm.image}
                      alt="preview"
                      className="w-28 h-28 object-cover rounded-md mt-2"
                    />
                  )}
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setShowEditItem(false);
                      setEditingMenu(null);
                    }}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => saveMenu(editingMenu)}
                    className="cursor-pointer"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Chef Dialog */}
      <AnimatePresence>
        {showAddChef && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => setShowAddChef(false)}
            />
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-2">Add Chef</h3>
              <form onSubmit={handleAddChef} className="space-y-3">
                <Input
                  placeholder="Username"
                  value={chefForm.username}
                  onChange={(e) =>
                    setChefForm((f) => ({ ...f, username: e.target.value }))
                  }
                  required
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={chefForm.email}
                  onChange={(e) =>
                    setChefForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
                <Input
                  placeholder="Password"
                  type="password"
                  value={chefForm.password}
                  onChange={(e) =>
                    setChefForm((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    className="cursor-pointer"
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddChef(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="cursor-pointer">
                    Add
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
