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
  ChefHat,
} from "lucide-react";
import Image from "next/image";
import restro from "@/../public/restro.jpg";
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
    logo: "",
    openingTime: "",
    closingTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_UPLOAD_PRESET);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        setForm((f) => ({ ...f, logo: data.secure_url }));
        toast.success("Logo uploaded!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      toast.error("Logo upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

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
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return showWelcome ? (
    <WelcomeScreen path="/owner/restaurant-details" />
  ) : (
    <motion.div
      className="p-2 sm:pt-8 sm:px-10 min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-1 sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="w-full max-w-5xl flex flex-col md:flex-row overflow-hidden rounded-3xl shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        {/* Left Section (Image) */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="hidden sm:flex md:w-1/2 justify-center items-center p-3 pl-6"
        >
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-full">
            <Image
              src={restro}
              alt="Restaurant Setup"
              className="rounded-2xl shadow-lg w-full h-auto object-cover"
              priority
            />
          </div>
        </motion.div>

        {/* Right Section (Form) */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-1/2 px-6 sm:p-8 md:p-10 space-y-6"
        >
          <div className="text-center md:text-left space-y-1">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              <ChefHat className="inline-block mr-2" />
              Restaurant Details
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fill out the details to continue
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:gap-6">
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
                className="space-y-0"
              >
                <Label htmlFor={id} className="text-sm font-medium">
                  {label}
                </Label>
                <div className="mt-1 relative">
                  <Icon className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                  <Input
                    id={id}
                    name={id}
                    className="pl-10 py-4 rounded-xl border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-200 transition w-full text-sm sm:text-base"
                    value={form[id]}
                    onChange={handleChange}
                    {...rest}
                  />
                </div>
              </motion.div>
            ))}

            {/* Logo upload (optional) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="space-y-2"
            >
              <Label htmlFor="logo" className="text-sm font-medium">
                Logo (optional)
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="rounded-xl border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-200 transition w-full text-sm sm:text-base"
                />
                {uploadingLogo && (
                  <p className="text-sm text-gray-500 mt-1">Uploading...</p>
                )}
              </div>
            </motion.div>

            {/* Table Count */}
            <div className="space-y-1">
              <Label htmlFor="tableCount" className="text-sm font-medium">
                Number of Tables
              </Label>
              <div className="relative">
                <LayoutGrid className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                <Input
                  type="number"
                  id="tableCount"
                  name="tableCount"
                  min="1"
                  className="pl-10 rounded-xl border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-200 transition w-full text-sm sm:text-base"
                  value={form.tableCount}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Timings */}
            <div className="flex flex-col sm:flex-row gap-3">
              {["openingTime", "closingTime"].map((field, index) => (
                <div key={index} className="w-full sm:w-1/2 space-y-1">
                  <Label htmlFor={field} className="text-sm font-medium">
                    {field === "openingTime" ? "Opening Time" : "Closing Time"}
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                    <Input
                      type="time"
                      id={field}
                      name={field}
                      className="pl-10 rounded-xl border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-200 transition w-full text-sm sm:text-base"
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
