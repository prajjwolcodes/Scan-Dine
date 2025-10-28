"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { logout, signup } from "@/app/store/authSlice";
import PublicRoute from "@/components/PublicRoute";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeClosed } from "lucide-react";

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, user, token } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
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
    <PublicRoute redirectTo="/owner/dashboard">
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-6 py-8 space-y-6">
          {/* Logo */}
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2">
              <div className="font-bold text-xl">🏁</div>
              <h1 className="text-2xl font-semibold">Scan & Dine</h1>
            </div>
            <h2 className="text-2xl font-bold mt-6">Create an account</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-sm font-medium">
                Username*
              </Label>
              <Input
                id="username"
                placeholder=" "
                className="mt-1"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email address*
              </Label>
              <Input
                id="email"
                type="email"
                placeholder=" "
                className="mt-1"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Password*
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                {!showPassword ? (
                  <Eye
                    className="absolute right-3 top-2.5 h-5 w-5 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                ) : (
                  <EyeClosed
                    className="absolute right-3 top-2.5 h-5 w-5 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password*
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder=" "
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {!showConfirmPassword ? (
                  <Eye
                    className="absolute right-3 top-2.5 h-5 w-5 text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                ) : (
                  <EyeClosed
                    className="absolute right-3 top-2.5 h-5 w-5 text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-gray-100 hover:bg-gray-900"
              disabled={loading}
            >
              {loading ? "Loading..." : "Continue"}
            </Button>
          </form>

          {/* Log in link */}
          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-black hover:underline"
            >
              Log in
            </Link>
          </div>

          {/* Terms */}
          <p className="text-xs text-center text-gray-500">
            By submitting this form, you agree to our{" "}
            <a href="#" className="underline">
              terms of business
            </a>
            .
          </p>
        </div>
      </div>
    </PublicRoute>
  );
}
