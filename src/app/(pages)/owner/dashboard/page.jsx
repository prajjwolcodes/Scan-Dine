"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash, Download, Printer } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

export default function OwnerDashboard() {
  const [qrGenerated, setQrGenerated] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const [qrUrl, setQrUrl] = useState(null);

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
    available: true,
    categoryId: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, menuRes] = await Promise.all([
          api.get("/category", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/menu-items", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCategories(catRes.data.categories || []);
        setMenuItems(menuRes.data.menuItems || []);
      } catch (err) {
        toast.error("Failed to fetch data from server");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleGenerateQr = async () => {
    try {
      const res = await api.post(
        "/qr/generate",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

  // ----------- CATEGORY ACTIONS -----------
  const saveCategory = async (id) => {
    try {
      const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
      await api.delete(`/category/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.filter((c) => c._id !== id));
      toast.success("Category deleted!");
    } catch {
      toast.error("Failed to delete category");
    }
  };

  // ----------- MENU ACTIONS -----------
  const saveMenu = async (id) => {
    try {
      const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
      await api.delete(`/menu-items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(menuItems.filter((m) => m._id !== id));
      toast.success("Menu deleted!");
    } catch {
      toast.error("Failed to delete menu item");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* QR Code Section */}
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

      {/* Categories Section */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Categories</CardTitle>
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
                      <input
                        value={editCategoryForm.name}
                        onChange={(e) =>
                          setEditCategoryForm({
                            ...editCategoryForm,
                            name: e.target.value,
                          })
                        }
                        className="border rounded p-1 flex-1"
                      />
                      <input
                        value={editCategoryForm.description}
                        onChange={(e) =>
                          setEditCategoryForm({
                            ...editCategoryForm,
                            description: e.target.value,
                          })
                        }
                        className="border rounded p-1 flex-1"
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

      {/* Menu Items Section */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
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
                      <input
                        value={editMenuForm.name}
                        onChange={(e) =>
                          setEditMenuForm({
                            ...editMenuForm,
                            name: e.target.value,
                          })
                        }
                        className="border rounded p-1 flex-1"
                      />
                      <input
                        type="number"
                        value={editMenuForm.price}
                        onChange={(e) =>
                          setEditMenuForm({
                            ...editMenuForm,
                            price: Number(e.target.value),
                          })
                        }
                        className="border rounded p-1 w-20"
                      />
                      <input
                        value={editMenuForm.categoryId}
                        onChange={(e) =>
                          setEditMenuForm({
                            ...editMenuForm,
                            categoryId: e.target.value,
                          })
                        }
                        className="border rounded p-1 w-32"
                      />
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
