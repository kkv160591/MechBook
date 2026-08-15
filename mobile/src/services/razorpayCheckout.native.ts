import RazorpayCheckout from "react-native-razorpay"

import type {
  RazorpayOrderPayload
} from "./subscriptionService"

export const openRazorpayCheckout =
async (
  payment: RazorpayOrderPayload
) => {

  if (!payment.keyId) {
    throw new Error(
      "Razorpay TEST key was not provided."
    )
  }

  if (!payment.orderId) {
    throw new Error(
      "Razorpay order ID was not provided."
    )
  }

  const options = {

    key: payment.keyId,

    amount: payment.amount,

    currency:
      payment.currency || "INR",

    name: "MechBook",

    description:
      payment.planCode
        ? `${payment.planCode} subscription`
        : "Subscription payment",

    order_id:
      payment.orderId,

    prefill: {
      name: "",
      email: "",
      contact: ""
    },

    theme: {
      color: "#2563EB"
    }

  }

  console.log(
    "Opening Razorpay TEST Checkout:",
    {
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency
    }
  )

  return RazorpayCheckout.open(
    options
  )
}