"use client";

import { updatePaymentStatus } from "@/app/store/paymentSlice";
import { Card, CardContent } from "@/components/ui/card";
import { decodeEsewaData } from "@/lib/decodeEsewaData"; // Adjust the import path as necessary
import { CheckCircle } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function PaymentSuccessContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pidx = searchParams.get("pidx");
  const rawData = searchParams.get("data") || "";

  const { id: orderId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("Missing order ID");
      setLoading(false);
      return;
    }
    verifyPayment();
  }, [orderId, rawData, pidx]);

  const verifyPayment = async () => {
    setLoading(true);
    setError("");
    try {
      let body = { orderId };

      if (rawData) {
        // Esewa flow
        const decoded = decodeEsewaData(rawData);
        body.status = decoded.status;
        body.transaction_uuid = decoded.transaction_uuid;
        body.amount = decoded.total_amount;
        body.gateway = "ESEWA";
      } else if (pidx) {
        // Khalti flow
        body.pidx = pidx;
        body.gateway = "KHALTI";
      } else {
        throw new Error("No payment data provided");
      }

      const response = await dispatch(updatePaymentStatus({ orderId }));

      if (response.meta.requestStatus === "fulfilled") {
        // toast.success("Payment marked as PAID");
        setTimeout(() => {
          router.push(`/orderSuccess/${orderId}`);
        }, 3000);
      } else {
        // toast.error(response.payload?.message || "Failed to update payment");
      }
    } catch (err) {
      console.error("Payment verification error:", err);
      setError("An error occurred while verifying the payment");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <p>Verifying payment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment Successful!
                </h1>
                <p className="text-gray-600 mb-6">
                  Your payment has been processed successfully.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Redirecting you to order confirmation...
                </p>
              </div>

              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
