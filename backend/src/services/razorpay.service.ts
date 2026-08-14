import crypto from "crypto"

import {
  razorpay
} from "../config/razorpay"


/*
|--------------------------------------------------------------------------
| CREATE RAZORPAY ORDER
|--------------------------------------------------------------------------
*/

export const createRazorpayOrder =
async (
  amountInRupees: number,
  receipt: string,
  notes: Record<string, string> = {}
) => {

  if (
    !Number.isFinite(
      amountInRupees
    ) ||
    amountInRupees <= 0
  ) {

    throw new Error(
      "Invalid payment amount"
    )

  }


  const amountInPaise =
    Math.round(
      amountInRupees * 100
    )


  const order =
    await razorpay.orders.create({

      amount:
        amountInPaise,

      currency:
        "INR",

      receipt,

      notes

    })


  return order

}


/*
|--------------------------------------------------------------------------
| VERIFY CHECKOUT PAYMENT
|--------------------------------------------------------------------------
*/

export const verifyPaymentSignature =
(
  orderId: string,
  paymentId: string,
  signature: string
) => {

  const secret =
    process.env.RAZORPAY_KEY_SECRET

  if (!secret) {

    throw new Error(
      "RAZORPAY_KEY_SECRET is not configured"
    )

  }

  const body =
    `${orderId}|${paymentId}`

  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        secret
      )
      .update(body)
      .digest("hex")

  const expected =
    Buffer.from(
      expectedSignature,
      "hex"
    )

  const received =
    Buffer.from(
      signature,
      "hex"
    )

  if (
    expected.length !==
    received.length
  ) {

    return false

  }

  return crypto.timingSafeEqual(
    expected,
    received
  )

}


/*
|--------------------------------------------------------------------------
| VERIFY RAZORPAY WEBHOOK
|--------------------------------------------------------------------------
*/

export const verifyWebhookSignature =
(
  rawBody: string,
  signature: string
) => {

  const secret =
    process.env.RAZORPAY_WEBHOOK_SECRET


  if (!secret) {

    throw new Error(
      "RAZORPAY_WEBHOOK_SECRET is not configured"
    )

  }


  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        secret
      )
      .update(rawBody)
      .digest("hex")


  return (
    expectedSignature ===
    signature
  )

}