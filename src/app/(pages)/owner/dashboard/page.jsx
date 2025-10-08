"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash, Download, Printer } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

export default function OwnerDashboard() {
  const { token, user } = useSelector((state) => state.auth);

  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Create forms
  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    available: true,
    categoryId: "",
  });

  const [chefs, setChefs] = useState([]);
  const [chefForm, setChefForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Edit states
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
    available: true,
    categoryId: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, menuRes, chefRes] = await Promise.all([
          api.get("/category", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/menu-items", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.post(
            "/auth/chefs",
            {
              restaurant: user.restaurant,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        setChefs(chefRes.data.chefs || []);
        setCategories(catRes.data.categories || []);
        setMenuItems(menuRes.data.menuItems || []);
      } catch (err) {
        toast.error("Failed to fetch data from server");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  // ---------- QR ----------
  const handleGenerateQr = async () => {
    try {
      const res = await api.post(
        "/qr/generate",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQrGenerated(true);
      setQrUrl(res.data.qrCodeUrl);
    } catch (error) {
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

  // ---------- CATEGORY ----------
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        "/category",
        { ...catForm, restaurant: user.restaurant },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories([...categories, res.data.category]);
      setCatForm({ name: "", description: "" });
      toast.success("Category created!");
    } catch {
      toast.error("Failed to create category");
    }
  };

  const saveCategory = async (id) => {
    try {
      const res = await api.put(`/category/${id}`, editCategoryForm, {
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

  const deleteCategory = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
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

  // ---------- MENU ----------
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
    } catch {
      toast.error("Failed to create menu item");
    }
  };

  const saveMenu = async (id) => {
    try {
      const res = await api.put(`/menu-items/${id}`, editMenuForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(
        menuItems.map((m) => (m._id === id ? res.data.menuItem : m))
      );
      setEditingMenu(null);
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
      setMenuItems(menuItems.filter((m) => m._id !== id));
      toast.success("Menu deleted!");
    } catch {
      toast.error("Failed to delete menu item");
    }
  };

  const handleAddChef = async (e) => {
    e.preventDefault();
    console.log(chefForm);
    try {
      const res = await api.post(
        "/auth/createchef",
        { ...chefForm, restaurant: user.restaurant },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(res);
      setChefs([...chefs, res.data.chef]);
      setChefForm({
        username: "",
        email: "",
        password: "",
      });
      setIsDialogOpen(false);
      toast.success("Chef added!");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message || "Failed to add chef");
    }
  };

  const removeChef = async (id) => {
    if (!confirm("Are you sure you want to remove this chef?")) return;
    try {
      const res = await api.delete(`/auth/chef/remove/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChefs(chefs.filter((c) => c._id !== id));
      toast.success("Chef removed!");
    } catch {
      toast.error("Failed to remove chef");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* ---------- QR Section ---------- */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Restaurant QR Code</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {!qrGenerated ? (
            <Button onClick={handleGenerateQr}>Generate QR</Button>
          ) : (
            <>
              {qrUrl && <img src={qrUrl} alt="QR Code" className="w-40 h-40" />}
              <div className="flex gap-2">
                <Button onClick={handlePrint} variant="secondary">
                  <Printer className="w-4 h-4 mr-2" /> Print Now
                </Button>
                <a href={qrUrl} download="restaurant-qr.png">
                  <Button>
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                </a>
                <Button onClick={handleGenerateQr}>Regenerate</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <div className="flex ictems-center justify-between">
          <CardHeader>
            <CardTitle>Chefs</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Chef</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Chef</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddChef} className="space-y-4">
                  <Input
                    placeholder="Username"
                    type="text"
                    required
                    value={chefForm.username}
                    onChange={(e) =>
                      setChefForm({ ...chefForm, username: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    required
                    value={chefForm.email}
                    onChange={(e) =>
                      setChefForm({ ...chefForm, email: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    required
                    value={chefForm.password}
                    onChange={(e) =>
                      setChefForm({ ...chefForm, password: e.target.value })
                    }
                  />
                  <Button type="submit" className="w-full">
                    Add
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </div>
        <CardContent>
          <div className="space-y-2">
            {chefs.length === 0 ? (
              <p className="text-gray-500">No chefs yet.</p>
            ) : (
              chefs.map((chef, index) => (
                <div
                  key={index}
                  className="w-full flex items-center justify-between p-2 rounded-md"
                >
                  <p className="font-semibold">
                    {chef.username} ({chef.email})
                  </p>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeChef(chef._id)}
                  >
                    Remove
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* ---------- Category List And Create ---------- */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Categories
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create Category</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Category</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <Input
                    placeholder="Name"
                    value={catForm.name}
                    onChange={(e) =>
                      setCatForm({ ...catForm, name: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Description"
                    value={catForm.description}
                    onChange={(e) =>
                      setCatForm({ ...catForm, description: e.target.value })
                    }
                  />
                  <Button type="submit" className="w-full">
                    Add
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-gray-500">No categories yet.</p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat._id}
                  className="flex items-center justify-between border p-2 rounded-md"
                >
                  {editingCategory === cat._id ? (
                    <div className="flex gap-2 flex-1">
                      <Input
                        value={editCategoryForm.name}
                        onChange={(e) =>
                          setEditCategoryForm({
                            ...editCategoryForm,
                            name: e.target.value,
                          })
                        }
                      />
                      <Input
                        value={editCategoryForm.description}
                        onChange={(e) =>
                          setEditCategoryForm({
                            ...editCategoryForm,
                            description: e.target.value,
                          })
                        }
                      />
                      <Button size="sm" onClick={() => saveCategory(cat._id)}>
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
                        <p className="font-semibold">{cat.name}</p>
                        <p className="text-sm text-gray-500">
                          {cat.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCategory(cat._id);
                            setEditCategoryForm({
                              name: cat.name,
                              description: cat.description,
                            });
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteCategory(cat._id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* ---------- Menu List ---------- */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Menu Items
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create Menu</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Menu</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleMenuSubmit} className="space-y-4">
                  <Input
                    placeholder="Name"
                    value={menuForm.name}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, name: e.target.value })
                    }
                    required
                  />
                  <Textarea
                    placeholder="Description"
                    value={menuForm.description}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, description: e.target.value })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={menuForm.price}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, price: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Image URL"
                    value={menuForm.image}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, image: e.target.value })
                    }
                  />
                  <select
                    value={menuForm.categoryId}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, categoryId: e.target.value })
                    }
                    className="w-full border rounded-md p-2"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
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
                  <Button type="submit" className="w-full">
                    Add
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {menuItems.length === 0 ? (
              <p className="text-gray-500">No menu items yet.</p>
            ) : (
              menuItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between border p-2 rounded-md"
                >
                  {editingMenu === item._id ? (
                    <div className="flex gap-2 flex-1">
                      <Input
                        value={editMenuForm.name}
                        onChange={(e) =>
                          setEditMenuForm({
                            ...editMenuForm,
                            name: e.target.value,
                          })
                        }
                      />
                      <Input
                        type="number"
                        value={editMenuForm.price}
                        onChange={(e) =>
                          setEditMenuForm({
                            ...editMenuForm,
                            price: Number(e.target.value),
                          })
                        }
                        className="w-24"
                      />
                      <select
                        value={editMenuForm.categoryId}
                        onChange={(e) =>
                          setEditMenuForm({
                            ...editMenuForm,
                            categoryId: e.target.value,
                          })
                        }
                        className="border rounded-md p-1"
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <Button size="sm" onClick={() => saveMenu(item._id)}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingMenu(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-semibold">
                          {item.name} - Rs {item.price}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.category.name} |{" "}
                          {item.available ? "Available ✅" : "Not Available ❌"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
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
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMenu(item._id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
