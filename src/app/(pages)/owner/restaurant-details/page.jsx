"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "@/app/store/authSlice";

export default function RestaurantDetailsForm() {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    tableCount: 1,
    openingTime: "",
    closingTime: "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post(
        "/restaurant",
        form, // This is the data you're sending in the request body
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(
        updateUser({ hasRestaurant: true, restaurant: res.data.restaurant._id })
      );
      toast.success("Restaurant created successfully");
      router.push("/owner/menu"); // redirect after success
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-lg shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">
            Restaurant Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Restaurant Name */}
            <div>
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            {/* Table Count */}
            <div>
              <Label htmlFor="tableCount">Table Count</Label>
              <Input
                type="number"
                id="tableCount"
                name="tableCount"
                min="1"
                value={form.tableCount}
                onChange={handleChange}
              />
            </div>

            {/* Opening Time */}
            <div>
              <Label htmlFor="openingTime">Opening Time</Label>
              <Input
                type="time"
                id="openingTime"
                name="openingTime"
                value={form.openingTime}
                onChange={handleChange}
              />
            </div>

            {/* Closing Time */}
            <div>
              <Label htmlFor="closingTime">Closing Time</Label>
              <Input
                type="time"
                id="closingTime"
                name="closingTime"
                value={form.closingTime}
                onChange={handleChange}
              />
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save & Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
