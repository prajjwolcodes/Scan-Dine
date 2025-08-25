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

  const mockCategories = [
    { _id: "1", name: "Burgers", description: "Juicy grilled burgers" },
    { _id: "2", name: "Pizzas", description: "Cheesy and delicious pizzas" },
  ];

  const mockMenuItems = [
    {
      _id: "1",
      name: "Cheeseburger",
      description: "A delicious cheeseburger with all the fixings",
      price: 9.99,
      image: "/images/cheeseburger.jpg",
      available: true,
      categoryId: "1",
    },
    {
      _id: "2",
      name: "Pepperoni Pizza",
      description: "Classic pepperoni pizza with mozzarella cheese",
      price: 12.99,
      image: "/images/pepperoni-pizza.jpg",
      available: true,
      categoryId: "2",
    },
  ];

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

  const [categoryLoading, setCategoryLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const router = useRouter();

  // 🔹 Fetch categories + menu items when component loads
  useEffect(() => {
    async function fetchData() {
      try {
        const resCat = await api.get(`/category`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(resCat.data.categories || mockCategories);

        const resMenu = await api.get(`/menu-items`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(resMenu.data.menuItems, "menu items");
        setMenuItems(resMenu.data.menuItems || mockMenuItems);
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
            {categories.map((cat, index) => (
              <li
                key={index}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-sm text-gray-500">{cat.description}</p>
                </div>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
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
          {categories.map((cat, index) => (
            <option key={index} value={cat._id}>
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
            {menuItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 flex flex-col">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                )}
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-gray-500">{item.description}</p>
                <p className="font-semibold mt-1">₹ {item.price}</p>
                <p
                  className={`text-xs mt-1 ${
                    item.available ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.available ? "Available" : "Not Available"}
                </p>
                <Button size="sm" variant="outline" className="mt-3">
                  Edit
                </Button>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => {
            dispatch(updateUser({ hasMenu: true }));
            router.push("/owner/dashboard");
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
