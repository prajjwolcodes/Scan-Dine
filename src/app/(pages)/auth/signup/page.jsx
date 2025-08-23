"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { logout, signup } from "@/app/store/authSlice";
import PublicRoute from "@/components/PublicRoute";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, user, token } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(signup(form));
      if (signup.fulfilled.match(result)) {
        toast.success("Signup successful");
        setForm({ username: "", email: "", password: "" });
        router.push("/owner/restaurant-details");
      } else {
        toast.error(result.payload.message || "Signup failed");
      }
    } catch (error) {
      toast.error(error.message || "Signup failed");
    }
  };

  return (
    <PublicRoute redirectTo="/dashboard">
      <div className="flex items-center justify-center h-screen bg-gray-50">
        {user && token && (
          <button onClick={() => dispatch(logout())}>Logout</button>
        )}
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-white shadow-lg rounded-2xl space-y-4 w-80"
        >
          <h1 className="text-xl font-bold text-center">Signup</h1>
          <Input
            placeholder="Name"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <Input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Signup"}
          </Button>
        </form>
      </div>
    </PublicRoute>
  );
}
