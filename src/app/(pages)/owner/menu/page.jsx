"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import api from "@/lib/axios";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "@/app/store/authSlice";
import { useRouter } from "next/navigation";

export default function RestaurantDashboard() {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // CATEGORY state
  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCatForm, setEditCatForm] = useState({ name: "", description: "" });

  // MENU state
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

  // 🔹 Fetch categories + menu items
  useEffect(() => {
    async function fetchData() {
      try {
        const resCat = await api.get(`/category`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(resCat.data.categories || []);

        const resMenu = await api.get(`/menu-items`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMenuItems(resMenu.data.menuItems || []);
      } catch (err) {
        toast.error("Failed to load data");
      }
    }
    if (user?.restaurant) fetchData();
  }, [user?.restaurant, token]);

  // 🔹 Handle Category Submit
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
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setCategoryLoading(false);
    }
  };

  // 🔹 Handle Category Edit
  const handleCategorySave = async (id) => {
    try {
      const res = await api.put(`/category/${id}`, editCatForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(
        categories.map((c) => (c._id === id ? res.data.category : c))
      );
      setEditingCategory(null);
      toast.success("Category updated!");
    } catch {
      toast.error("Failed to update category");
    }
  };

  const handleCategoryDelete = async (id) => {
    try {
      await api.delete(`/category/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.filter((c) => c._id !== id));
      toast.success("Category deleted!");
    } catch {
      toast.error("Failed to delete category");
    }
  };

  // 🔹 Handle Menu Submit
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
      setMenuItems([...menuItems, res.data.menuItem]);
      setMenuForm({
        name: "",
        description: "",
        price: "",
        image: "",
        available: true,
        categoryId: "",
      });
      toast.success("Menu item created!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create menu item");
    } finally {
      setMenuLoading(false);
    }
  };

  // 🔹 Handle Menu Edit
  const handleMenuSave = async (id) => {
    console.log(editMenuForm);
    try {
      const res = await api.put(
        `/menu-items/${id}`,
        { ...editMenuForm },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMenuItems(
        menuItems.map((i) => (i._id === id ? res.data.menuItem : i))
      );
      setEditingMenu(null);
      toast.success("Menu updated!");
    } catch {
      toast.error("Failed to update menu item");
    }
  };

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

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* ---------- CATEGORY FORM ---------- */}
      <form
        onSubmit={handleCategorySubmit}
        className="space-y-4 p-6 bg-white shadow rounded-2xl"
      >
        <h2 className="text-lg font-semibold">➕ Add Category</h2>
        <Input
          name="name"
          placeholder="Category name"
          value={catForm.name}
          onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
          required
        />
        <Textarea
          name="description"
          placeholder="Category description"
          value={catForm.description}
          onChange={(e) =>
            setCatForm({ ...catForm, description: e.target.value })
          }
        />
        <Button type="submit" disabled={categoryLoading} className="w-full">
          {categoryLoading ? "Saving..." : "Save Category"}
        </Button>
      </form>

      {/* ---------- CATEGORY LIST ---------- */}
      <div className="bg-white shadow rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">📂 Categories</h3>
        {categories.length === 0 ? (
          <p className="text-gray-500">No categories yet.</p>
        ) : (
          <ul className="space-y-3">
            {categories.map((cat) => (
              <li
                key={cat._id}
                className="flex justify-between items-center border-b pb-2"
              >
                {editingCategory === cat._id ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={editCatForm.name}
                      placeholder="Category name"
                      onChange={(e) =>
                        setEditCatForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                    <Input
                      value={editCatForm.description}
                      placeholder="Category description"
                      onChange={(e) =>
                        setEditCatForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                    />
                    <Button
                      size="sm"
                      onClick={() => handleCategorySave(cat._id)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCategory(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-sm text-gray-500">{cat.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingCategory(cat._id);
                          setEditCatForm({
                            name: cat.name,
                            description: cat.description,
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCategoryDelete(cat._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---------- MENU ITEM FORM ---------- */}
      <form
        onSubmit={handleMenuSubmit}
        className="space-y-4 p-6 bg-white shadow rounded-2xl"
      >
        <h2 className="text-lg font-semibold">➕ Add Menu Item</h2>
        <Input
          name="name"
          placeholder="Item name"
          value={menuForm.name}
          onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
          required
        />
        <Textarea
          name="description"
          placeholder="Item description"
          value={menuForm.description}
          onChange={(e) =>
            setMenuForm({ ...menuForm, description: e.target.value })
          }
        />
        <Input
          name="price"
          type="number"
          placeholder="Price"
          value={menuForm.price}
          onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
          required
        />
        <Input
          name="image"
          placeholder="Image URL"
          value={menuForm.image}
          onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
        />
        <select
          name="categoryId"
          value={menuForm.categoryId}
          onChange={(e) =>
            setMenuForm({ ...menuForm, categoryId: e.target.value })
          }
          required
          className="w-full border rounded-md p-2"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <Switch
            checked={menuForm.available}
            onCheckedChange={(val) =>
              setMenuForm({ ...menuForm, available: val })
            }
          />
          <Label>Available</Label>
        </div>
        <Button type="submit" disabled={menuLoading} className="w-full">
          {menuLoading ? "Saving..." : "Save Item"}
        </Button>
      </form>

      {/* ---------- MENU LIST ---------- */}
      <div className="bg-white shadow rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">🍽️ Menu Items</h3>
        {menuItems.length === 0 ? (
          <p className="text-gray-500">No menu items yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div
                key={item._id}
                className="border rounded-lg p-4 flex flex-col"
              >
                {editingMenu === item._id ? (
                  <>
                    <Input
                      value={editMenuForm.name}
                      placeholder="Item name"
                      onChange={(e) =>
                        setEditMenuForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Item price"
                      value={editMenuForm.price}
                      onChange={(e) =>
                        setEditMenuForm((f) => ({
                          ...f,
                          price: Number(e.target.value),
                        }))
                      }
                    />
                    <Input
                      value={editMenuForm.image}
                      placeholder="Item image URL"
                      onChange={(e) =>
                        setEditMenuForm((f) => ({
                          ...f,
                          image: e.target.value,
                        }))
                      }
                    />
                    <select
                      name="categoryId"
                      value={editMenuForm.categoryId}
                      onChange={(e) =>
                        setEditMenuForm((f) => ({
                          ...f,
                          categoryId: e.target.value,
                        }))
                      }
                      required
                      className="w-full border rounded-md p-2"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <Textarea
                      value={editMenuForm.description}
                      placeholder="Item description"
                      onChange={(e) =>
                        setEditMenuForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                    />
                    <Button
                      size="sm"
                      onClick={() => handleMenuSave(item._id)}
                      className="mt-2"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingMenu(null)}
                      className="mt-2"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-32 object-cover rounded-md mb-2"
                      />
                    )}
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.description}</p>
                    <p className="font-semibold mt-1">Rs {item.price}</p>
                    <p className="font-semibold mt-1">{item.category.name}</p>
                    <p
                      className={`text-xs mt-1 ${
                        item.available ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {item.available ? "Available" : "Not Available"}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingMenu(item._id);
                          setEditMenuForm({
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            image: item.image,
                            available: item.available,
                            categoryId: item.category._id,
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleMenuDelete(item._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => {
            dispatch(updateUser({ hasMenu: true }));
            router.push("/owner/dashboard");
          }}
          className="mt-6 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
