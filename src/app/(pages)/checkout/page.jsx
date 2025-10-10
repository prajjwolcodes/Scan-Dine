"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import api from "@/lib/axios";
import { CreditCard } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";

const page = () => {
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const [paymentMethod, setPaymentMethod] = useState("ESEWA");

  const handleDigitalPayment = async () => {
    setLoading(true);

    try {
      // First update shipping info and payment method
      const updateResponse = await api.put(
        `/checkout/68e7b334db11f7015247753f`,
        {
          paymentMethod,
          SUCCESS_URL: `${window.location.origin}/checkout/payment-success/68e7b334db11f7015247753f`, // {orderId here}
          FAILURE_URL: `${window.location.origin}/checkout/payment-failure/68e7b334db11f7015247753f`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (updateResponse.status === 200) {
        const updateData = updateResponse.data;
        if (updateData.url) {
          window.location.href = updateData.url;
        }
      }

      //   if (updateResponse.ok) {
      //     dispatch(
      //       setCurrentOrder({
      //         ...updateData.data.order,
      //         items: updateData.data.items,
      //       })
      //     );

      //     if (updateResponse.ok && updateData.url) {
      //       window.location.href = updateData.url;
      //     } else {
      //       setError("Failed to initiate payment");
      //     }
      //   } else {
      //     setError(updateData.message || "Failed to update order");
      //   }
    } catch (error) {
      console.error("Payment initiation error:", error);
      //   setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Payment Method
        </CardTitle>
        <CardDescription>Choose your preferred payment method</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value)}
        >
          <div className="flex items-center space-x-2 p-4 border rounded-lg">
            <RadioGroupItem value="ESEWA" id="esewa" />
            <Label htmlFor="esewa" className="flex-1 cursor-pointer">
              <div>
                <p className="font-medium">eSewa</p>
                <p className="text-sm text-gray-500">
                  Pay securely with eSewa wallet
                </p>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-4 border rounded-lg">
            <RadioGroupItem value="KHALTI" id="khalti" />
            <Label htmlFor="khalti" className="flex-1 cursor-pointer">
              <div>
                <p className="font-medium">Khalti</p>
                <p className="text-sm text-gray-500">
                  Pay securely with Khalti wallet
                </p>
              </div>
            </Label>
          </div>
        </RadioGroup>

        <div className="mt-6">
          <Button
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            onClick={() => handleDigitalPayment(paymentMethod)}
            disabled={loading}
          >
            {loading ? "Redirecting..." : `Pay Now with ${paymentMethod}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default page;
