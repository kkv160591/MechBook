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
    !Number.isFinite(amountInRupees) ||
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


  return razorpay.orders.create({

    amount:
      amountInPaise,

    currency:
      "INR",

    receipt,

    notes

  })

}


/*
|--------------------------------------------------------------------------
| VERIFY CHECKOUT PAYMENT
|--------------------------------------------------------------------------
|
| Razorpay:
|
| HMAC_SHA256(
|   razorpay_order_id + "|" + razorpay_payment_id,
|   RAZORPAY_KEY_SECRET
| )
|
| This MUST happen on the server.
|
*/

export const verifyPaymentSignature =
(
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {

  const secret =
    process.env.RAZORPAY_KEY_SECRET


  if (!secret) {

    throw new Error(
      "RAZORPAY_KEY_SECRET is not configured"
    )

  }


  if (
    !orderId ||
    !paymentId ||
    !signature
  ) {

    return false

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


  const expectedBuffer =
    Buffer.from(
      expectedSignature,
      "hex"
    )


  const receivedBuffer =
    Buffer.from(
      signature,
      "hex"
    )


  if (
    expectedBuffer.length !==
    receivedBuffer.length
  ) {

    return false

  }


  return crypto.timingSafeEqual(
    expectedBuffer,
    receivedBuffer
  )

}


/*
|--------------------------------------------------------------------------
| VERIFY RAZORPAY WEBHOOK
|--------------------------------------------------------------------------
*/

export const verifyWebhookSignature =
(
  rawBody: string | Buffer,
  signature: string
): boolean => {

  const secret =
    process.env.RAZORPAY_WEBHOOK_SECRET


  if (!secret) {

    throw new Error(
      "RAZORPAY_WEBHOOK_SECRET is not configured"
    )

  }


  if (!signature) {

    return false

  }


  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        secret
      )
      .update(rawBody)
      .digest("hex")


  const expectedBuffer =
    Buffer.from(
      expectedSignature,
      "hex"
    )


  const receivedBuffer =
    Buffer.from(
      signature,
      "hex"
    )


  if (
    expectedBuffer.length !==
    receivedBuffer.length
  ) {

    return false

  }


  return crypto.timingSafeEqual(
    expectedBuffer,
    receivedBuffer
  )

}