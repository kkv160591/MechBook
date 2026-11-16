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


type VerifyCapturedPaymentParams = {
  orderId: string
  paymentId: string
  expectedAmount: number
  expectedCurrency: string
}

export const verifyCapturedPayment = async ({
  orderId,
  paymentId,
  expectedAmount,
  expectedCurrency
}: VerifyCapturedPaymentParams) => {
  if (!orderId || !paymentId) {
    throw new Error("Missing Razorpay payment details")
  }

  if (
    !Number.isInteger(expectedAmount) ||
    expectedAmount <= 0
  ) {
    throw new Error("Invalid expected payment amount")
  }

  const payment = await razorpay.payments.fetch(paymentId)

  if (payment.order_id !== orderId) {
    throw new Error("Payment does not belong to this order")
  }

  if (payment.status !== "captured") {
    throw new Error("Payment has not been captured")
  }

  if (Number(payment.amount) !== expectedAmount) {
    throw new Error("Payment amount does not match the order")
  }

  if (payment.currency !== expectedCurrency) {
    throw new Error("Payment currency does not match the order")
  }

  return payment
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