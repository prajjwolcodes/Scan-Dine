import axios from "axios";
import Order from "../../models/orderSchema.js";
import Payment from "../../models/paymentSchema.js";
import { generateHmacSha256Hash } from "../../utils/checkoutHelper.js";

export async function checkoutController(req, res) {
  try {
    const orderId = req.params.id;
    const { paymentMethod, SUCCESS_URL, FAILURE_URL } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // ✅ Step 3: Handle Payment Gateway (Esewa/Khalti)
    if (paymentMethod === "ESEWA" || paymentMethod === "KHALTI") {
      // Otherwise initiate payment
      const paymentUrl = await initiateGatewayPayment(
        order,
        paymentMethod,
        SUCCESS_URL,
        FAILURE_URL
      );

      return res.json({
        data: {
          order,
        },
        url: paymentUrl,
        message: "Redirect to payment gateway",
      });
    }

    return res.status(400).json({ message: "Invalid payment method" });
  } catch (error) {
    console.error("Checkout error:", error);
    res
      .status(500)
      .json({ message: error.message || "Internal server error on checkout" });
  }
}

// Initiate Esewa/Khalti payment
async function initiateGatewayPayment(
  order,
  paymentMethod,
  SUCCESS_URL,
  FAILURE_URL
) {
  let paymentConfig;

  let existingPayment = await Payment.findOne({
    orderId: order._id,
    method: paymentMethod,
  });

  // 2. If already paid, don't allow another
  if (existingPayment?.status === "PAID") {
    throw new Error("Payment already completed for this order.");
  }

  // 3. Reuse or generate new transaction UUID
  let transaction_uuid = existingPayment?.transaction_uuid;
  if (!transaction_uuid || existingPayment.status === "UNPAID") {
    transaction_uuid = `${order._id}-${Date.now()}`;
  }
  // 4. Prepare payment data based on gateway
  if (paymentMethod === "ESEWA") {
    const paymentData = {
      amount: order.totalAmount,
      product_delivery_charge: "0",
      product_service_charge: "0",
      product_code: process.env.ESEWA_MERCHANT_ID,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      success_url: SUCCESS_URL,
      failure_url: FAILURE_URL,
      tax_amount: "0",
      total_amount: order.totalAmount,
      transaction_uuid,
    };

    const data = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;
    const signature = generateHmacSha256Hash(data, process.env.ESEWA_SECRET);

    paymentConfig = {
      url: process.env.ESEWA_PAYMENT_URL,
      data: { ...paymentData, signature },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      responseHandler: (response) => response.request?.res?.responseUrl,
    };
  } else if (paymentMethod === "KHALTI") {
    paymentConfig = {
      url: process.env.KHALTI_PAYMENT_URL,
      data: {
        amount: order.totalAmount * 100, // paisa
        product_identity: order._id,
        product_name: `Order ${order._id}`,
        public_key: process.env.KHALTI_PUBLIC_KEY,
        return_url: SUCCESS_URL,
        failure_url: FAILURE_URL,

        website_url: process.env.FRONT_END_APP_URL,
        purchase_order_id: order._id,
        purchase_order_name: `Order ${order._id}`,
      },
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      responseHandler: (response) => response.data?.payment_url,
    };
  }

  const payment = await axios.post(paymentConfig.url, paymentConfig.data, {
    headers: paymentConfig.headers,
  });

  const paymentUrl = paymentConfig.responseHandler(payment);
  if (!paymentUrl) {
    throw new Error("Payment URL missing from gateway response");
  }

  if (existingPayment) {
    existingPayment.transaction_uuid = transaction_uuid;
    existingPayment.status = "UNPAID";
    await existingPayment.save();
  } else {
    await Payment.create({
      orderId: order._id,
      amount: order.totalAmount,
      method: paymentMethod,
      status: "UNPAID",
      transaction_uuid,
    });
  }

  return paymentUrl;
}

// Verify Esewa/Khalti payment

// ONLY RUNS AFTER PAYMENT GATEWAY CALLBACK ie frontend again calls this API with pidx/status after visiting success url
export async function verifyPayment(req, res) {
  try {
    const { orderId, transaction_uuid, amount, pidx } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const payment = await Payment.findOne({ orderId: order._id });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const gateway = payment.method;

    if (gateway !== "ESEWA" && gateway !== "KHALTI") {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    if (gateway === "ESEWA") {
      // Make sure required data is present
      if (!transaction_uuid || !amount) {
        return res
          .status(400)
          .json({ message: "Missing transaction data for Esewa" });
      }

      const response = await axios.get(
        process.env.ESEWA_PAYMENT_STATUS_CHECK_URL,
        {
          params: {
            product_code: process.env.ESEWA_MERCHANT_ID,
            total_amount: amount,
            transaction_uuid: transaction_uuid,
          },
        }
      );

      const paymentStatusCheck = response.data;

      if (paymentStatusCheck.status === "COMPLETE") {
        await finalizeOrder(order._id, "PAID", gateway); // pass order._id for consistency
        return res.status(200).json({
          message: "Esewa payment successful",
          status: "COMPLETED",
          order: order,
        });
      } else {
        await updatePayment(order._id, "UNPAID");
        return res.status(400).json({
          message: "Esewa payment failed",
          status: "FAILED",
        });
      }
    }

    if (gateway === "KHALTI") {
      if (!pidx) {
        return res.status(400).json({ message: "Missing pidx for Khalti" });
      }

      const response = await axios.post(
        process.env.KHALTI_VERIFICATION_URL,
        { pidx },
        {
          headers: {
            Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const paymentStatusCheck = response.data;

      if (paymentStatusCheck.status === "Completed") {
        await finalizeOrder(order._id, "PAID", gateway);
        return res.status(200).json({
          message: "Khalti payment successful",
          status: "COMPLETED",
          order: order,
        });
      } else {
        await updatePayment(order._id, "FAILED");
        return res.status(400).json({
          message: "Khalti payment failed",
          status: "FAILED",
        });
      }
    }
  } catch (error) {
    console.error("verifyPayment error:", error);
    return res.status(500).json({
      message: "Internal server error during payment verification",
      error: error.message || error.toString(),
    });
  }
}

// Finalize successful payment
async function finalizeOrder(order, paymentStatus, method) {
  await Payment.updateOne(
    { orderId: order._id },
    { $set: { status: paymentStatus, method } }
  );

  const payment = await Payment.findOne({ orderId: order._id });

  const existingOrder = await Order.findById(order._id);
  if (!existingOrder) {
    throw new Error("Order not found");
  }
  existingOrder.payment = payment;

  await existingOrder.save();
}

// Update failed payment
async function updatePayment(order, status) {
  await Payment.updateOne({ orderId: order._id }, { $set: { status } });
}

// PUT /api/payments/:id/status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body; // "PAID"
    const payment = await Payment.findOne({ orderId: req.params.id }).exec();
    console.log(payment, status);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.status = status;
    payment.updatedAt = Date.now();
    await payment.save();

    // Optional: also mark related order as paid
    if (status === "PAID") {
      await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: "PAID" });
    }

    res.json({
      success: true,
      message: "Payment status updated successfully",
      payment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
