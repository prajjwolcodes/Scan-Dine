"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { login, logout } from "@/app/store/authSlice";
import { useRouter } from "next/navigation";
import PublicRoute from "@/components/PublicRoute";
import Link from "next/link";
import { Eye, EyeClosed } from "lucide-react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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
      <div
        className={` min-h-screen flex items-center justify-center bg-white`}
      >
        <div className="w-full max-w-md px-6 py-8 space-y-6">
          {/* Logo */}
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2">
              <div className="font-bold text-xl">🏁</div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Scan & Dine
              </h1>
            </div>
            <h2 className="text-2xl font-bold mt-6 tracking-tight">
              Log in to your account
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email address*
              </Label>
              <Input
                id="email"
                type="email"
                placeholder=" "
                className="mt-1 h-11 rounded-md border-gray-300"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password*
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  className="h-11 rounded-md border-gray-300"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                {showPassword ? (
                  <EyeClosed
                    className="absolute right-3 top-3 h-5 w-5 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                ) : (
                  <Eye
                    className="absolute right-3 top-3 h-5 w-5 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                )}
              </div>
            </div>

            <div className="text-right">
              <a
                href="#"
                className="text-sm text-black font-medium hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-gray-100 hover:bg-gray-900 h-11 rounded-md font-medium tracking-wide"
              disabled={loading}
            >
              {loading ? "Loading..." : "Log in"}
            </Button>
          </form>

          {/* Sign up link */}
          <div className="text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-black hover:underline"
            >
              Create one
            </Link>
          </div>

          {/* Terms */}
          <p className="text-xs text-center text-gray-500 leading-relaxed">
            By logging in, you agree to our{" "}
            <a href="#" className="underline">
              terms of business
            </a>{" "}
            .
          </p>
        </div>
      </div>
    </PublicRoute>
  );
}
