import type { RazorpayOrderPayload } from "./subscriptionService"

declare global {
  interface Window {
    Razorpay?: any
  }
}

const RAZORPAY_SCRIPT =
  "https://checkout.razorpay.com/v1/checkout.js"

const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve()
      return
    }

    const existingScript =
      document.querySelector(
        `script[src="${RAZORPAY_SCRIPT}"]`
      )

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => resolve()
      )

      existingScript.addEventListener(
        "error",
        () =>
          reject(
            new Error(
              "Unable to load Razorpay Checkout."
            )
          )
      )

      return
    }

    const script =
      document.createElement("script")

    script.src = RAZORPAY_SCRIPT
    script.async = true

    script.onload = () => resolve()

    script.onerror = () =>
      reject(
        new Error(
          "Unable to load Razorpay Checkout."
        )
      )

    document.body.appendChild(script)
  })
}

export const openRazorpayCheckout =
async (
  payment: RazorpayOrderPayload
): Promise<{
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}> => {

  await loadRazorpayScript()

  if (!window.Razorpay) {
    throw new Error(
      "Razorpay Checkout is unavailable."
    )
  }

  if (!payment.keyId) {
    throw new Error(
      "Razorpay TEST key was not provided by the backend."
    )
  }

  if (!payment.orderId) {
    throw new Error(
      "Razorpay order ID was not provided."
    )
  }

  console.log(
    "Opening Razorpay TEST Checkout",
    {
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      keyId: payment.keyId
    }
  )

  return new Promise(
    (resolve, reject) => {

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

        handler: (
          response: any
        ) => {

          resolve({
            razorpay_payment_id:
              response.razorpay_payment_id,

            razorpay_order_id:
              response.razorpay_order_id ||
              payment.orderId,

            razorpay_signature:
              response.razorpay_signature
          })

        },

        modal: {

          ondismiss: () => {

            reject({
              code: "PAYMENT_CANCELLED",
              message:
                "Payment was cancelled."
            })

          }

        },

        prefill: {
          name: "",
          email: "",
          contact: ""
        },

        theme: {
          color: "#2563EB"
        }

      }

      try {

        const razorpay =
          new window.Razorpay(
            options
          )

        razorpay.on(
          "payment.failed",
          (
            response: any
          ) => {

            reject({
              code: "PAYMENT_FAILED",
              message:
                response?.error?.description ||
                "Payment failed."
            })

          }
        )

        razorpay.open()

      }

      catch (error) {

        reject(error)

      }

    }
  )
}