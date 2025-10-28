"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "@/app/store/authSlice";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  LayoutGrid,
  Building2,
} from "lucide-react";
import Image from "next/image";
import food from "@/../public/food.png";
import WelcomeScreen from "@/components/WelcomeScreen";

export default function RestaurantDetailsForm() {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(true);
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/restaurant", form, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(
        updateUser({ hasRestaurant: true, restaurant: res.data.restaurant._id })
      );

      toast.success("Restaurant created successfully!");
      router.push("/owner/menu");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000); // 👈 match the same duration as in WelcomeScreen

    return () => clearTimeout(timer);
  }, []);

  return showWelcome ? (
    <WelcomeScreen path="/owner/restaurant-details" />
  ) : (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-6 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="w-full max-w-5xl flex flex-col md:flex-row overflow-hidden rounded-3xl shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        {/* Left Section */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-8 space-y-5"
        >
          <Image
            src={food}
            alt="Restaurant Setup"
            width="full"
            height="full"
            className="rounded-2xl shadow-lg"
          ></Image>
          {/* <div className="bg-white/80 dark:bg-gray-900/40 p-5 rounded-2xl shadow-md">
            <UtensilsCrossed className="h-10 w-10 text-gray-800 dark:text-gray-100 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center">
            Welcome to{" "}
            <span className="text-black dark:text-gray-100">Scan & Dine</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-sm">
            Let’s set up your restaurant and start serving your customers in
            style 🍽️
          </p> */}
        </motion.div>

        {/* Right Section (Form) */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-1/2 p-8 md:p-10 space-y-6"
        >
          <div className="text-center md:text-left space-y-1">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Restaurant Details
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fill out the details to continue
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {[
              {
                id: "name",
                label: "Restaurant Name",
                icon: Building2,
                placeholder: "The Himalayan Restro",
              },
              {
                id: "address",
                label: "Address",
                icon: MapPin,
                placeholder: "Kathmandu, Nepal",
              },
              {
                id: "phone",
                label: "Phone",
                icon: Phone,
                placeholder: "+977 9812345678",
              },
              {
                id: "email",
                label: "Email",
                icon: Mail,
                placeholder: "info@restaurant.com",
                type: "email",
              },
            ].map(({ id, label, icon: Icon, ...rest }) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="space-y-2"
              >
                <Label htmlFor={id}>{label}</Label>
                <div className="mt-1 relative">
                  <Icon className="absolute left-3 top-2 text-gray-400 h-5 w-5" />
                  <Input
                    id={id}
                    name={id}
                    className="pl-10 rounded-xl border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-200 transition"
                    value={form[id]}
                    onChange={handleChange}
                    {...rest}
                  />
                </div>
              </motion.div>
            ))}

            {/* Table Count */}
            <div className="space-y-1">
              <Label htmlFor="tableCount">Number of Tables</Label>
              <div className="relative">
                <LayoutGrid className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                <Input
                  type="number"
                  id="tableCount"
                  name="tableCount"
                  min="1"
                  className="pl-10 rounded-xl border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-200 transition"
                  value={form.tableCount}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Timings */}
            <div className="flex gap-3">
              {["openingTime", "closingTime"].map(({ field, index }) => (
                <div key={field} className="w-1/2 space-y-1">
                  <Label htmlFor={field}>
                    {field === "openingTime" ? "Opening Time" : "Closing Time"}
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                    <Input
                      type="time"
                      id={field}
                      name={field}
                      className="pl-10 rounded-xl border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-200 transition"
                      value={form[field]}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-xl font-medium py-2 transition-all"
            >
              {loading ? "Saving..." : "Save & Continue"}
            </Button>
          </motion.div>
        </motion.form>
      </Card>
    </motion.div>
  );
}
