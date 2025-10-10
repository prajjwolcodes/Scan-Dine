"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { login, logout } from "@/app/store/authSlice";
import { useRouter } from "next/navigation";
import PublicRoute from "@/components/PublicRoute";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, user, token } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(login(form));
      console.log(result);
      if (login.fulfilled.match(result)) {
        toast.success("Login successful");
        setForm({ email: "", password: "" });
        if (result.payload.user.role === "owner") {
          router.push("/owner/dashboard");
        } else {
          router.push("/chef/dashboard");
        }
      } else {
        toast.error(result.payload.message || "Login failed");
      }
    } catch (error) {
      toast.error(error.message || "Login failed");
    }
  };

  return (
    <PublicRoute redirectTo="/owner/dashboard">
      <div className="flex items-center justify-center h-screen bg-gray-50">
        {user && token && (
          <button onClick={() => dispatch(logout())}>Logout</button>
        )}
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-white shadow-lg rounded-2xl space-y-4 w-80"
        >
          <h1 className="text-xl font-bold text-center">Login</h1>
          <Input
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </Button>
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-blue-500">
              Register
            </Link>
          </p>
        </form>
      </div>
    </PublicRoute>
  );
}
