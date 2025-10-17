"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import api from "@/lib/axios";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import esewaLogo from "@/../public/esewaLogo.png";
import khaltiLogo from "@/../public/khaltiLogo.png";

export default function PaymentOptions({ orderId }) {
  const [paymentMethod, setPaymentMethod] = useState("ESEWA");
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);

  const handleDigitalPayment = async () => {
    setLoading(true);
    try {
      const res = await api.put(
        `/checkout/${orderId}`,
        {
          paymentMethod,
          SUCCESS_URL: `${window.location.origin}/checkout/payment-success/${orderId}`,
          FAILURE_URL: `${window.location.origin}/checkout/payment-failure/${orderId}`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.url) {
        toast.success(`Redirecting to ${paymentMethod}...`);
        window.location.href = res.data.url;
      } else {
        toast.error("Unable to initiate payment.");
      }
    } catch (err) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const options = [
    {
      id: "ESEWA",
      name: "eSewa",
      desc: "Pay securely via your eSewa wallet.",
      logo: esewaLogo,
      color: "from-green-600 to-green-700",
    },
    {
      id: "KHALTI",
      name: "Khalti",
      desc: "Instant payments through Khalti wallet.",
      logo: khaltiLogo,
      color: "from-purple-600 to-purple-700",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 p-1 py-4"
    >
      <div className="grid gap-4">
        {options.map((opt) => (
          <motion.div
            key={opt.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPaymentMethod(opt.id)}
            className={`cursor-pointer flex items-center justify-between p-4 rounded-xl border transition-all duration-300 shadow-sm ${
              paymentMethod === opt.id
                ? "text-white border-transparent ring-2 ring-offset-2 ring-black bg-gradient-to-r " +
                  opt.color +
                  " "
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Image
                  src={opt.logo}
                  alt={opt.name}
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div>
                <p className="font-medium">{opt.name}</p>
                <p
                  className={`text-xs ${
                    paymentMethod === opt.id ? "text-white/90" : "text-gray-500"
                  }`}
                >
                  {opt.desc}
                </p>
              </div>
            </div>

            <div
              className={`w-4 h-4 rounded-full border-2 transition ${
                paymentMethod === opt.id
                  ? "bg-white border-white"
                  : "border-gray-400"
              }`}
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-4"
      >
        <Button
          onClick={handleDigitalPayment}
          disabled={loading}
          className="w-full h-11 text-white font-semibold bg-black hover:bg-gray-800 transition-all duration-300"
        >
          {loading ? "Redirecting..." : `Pay Now with ${paymentMethod}`}
        </Button>
      </motion.div>
    </motion.div>
  );
}
