import {
  GetCommand,
  PutCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb"

import crypto from "crypto"
import bcrypt from "bcryptjs"

import { db } from "../config/dynamodb"

const TABLE =
  process.env.PIN_RECOVERY_TABLE_NAME || "PinRecovery"

const OTP_EXPIRY_SECONDS = 5 * 60

const RESET_TOKEN_EXPIRY_SECONDS = 10 * 60

const MAX_OTP_ATTEMPTS = 5

const RESEND_COOLDOWN_SECONDS = 60

const generateOtp = (): string => {
  return crypto
    .randomInt(100000, 1000000)
    .toString()
}

const generateResetToken = (): string => {
  return crypto
    .randomBytes(32)
    .toString("hex")
}

const hashResetToken = (
  token: string
): string => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex")
}


/*
 * Create or replace OTP recovery record.
 */
export const createPinRecovery = async (
  account: {
    userId: string
    garageId: string
    role: "owner" | "worker"
    workerId?: string
    phone: string
  }
) => {

  const phone = account.phone.trim()

  const existing =
    await db.send(
      new GetCommand({
        TableName: TABLE,

        Key: {
          phone
        }
      })
    )

  const now =
    Math.floor(Date.now() / 1000)

  /*
   * Prevent OTP spam.
   */
  if (existing.Item?.lastSentAt) {

    const secondsSinceLastSend =
      now - Number(existing.Item.lastSentAt)

    if (
      secondsSinceLastSend <
      RESEND_COOLDOWN_SECONDS
    ) {
      throw new Error(
        "Please wait before requesting another OTP"
      )
    }
  }

  const otp =
    generateOtp()

  const otpHash =
    await bcrypt.hash(
      otp,
      10
    )

  const expiresAt =
    now + OTP_EXPIRY_SECONDS

  const item: any = {

    phone,

    userId:
      account.userId,

    garageId:
      account.garageId,

    role:
      account.role,

    otpHash,

    otpExpiresAt:
      expiresAt,

    attempts: 0,

    lastSentAt:
      now,

    ttl:
      expiresAt,

    used: false
  }

  if (account.workerId) {
    item.workerId =
      account.workerId
  }

  await db.send(
    new PutCommand({
      TableName: TABLE,
      Item: item
    })
  )

  /*
   * OTP is intentionally returned to the
   * SMS service instead of being stored
   * in plaintext.
   */
  return {
    otp,
    expiresAt
  }
}


/*
 * Verify OTP and issue a short-lived
 * single-purpose reset token.
 */
export const verifyPinRecoveryOtp =
  async (
    phone: string,
    otp: string
  ) => {

    const response =
      await db.send(
        new GetCommand({
          TableName: TABLE,

          Key: {
            phone: phone.trim()
          }
        })
      )

    const recovery =
      response.Item

    if (!recovery) {
      throw new Error(
        "Invalid or expired OTP"
      )
    }

    if (recovery.used === true) {
      throw new Error(
        "Invalid or expired OTP"
      )
    }

    const now =
      Math.floor(Date.now() / 1000)

    if (
      Number(recovery.otpExpiresAt) <
      now
    ) {
      throw new Error(
        "Invalid or expired OTP"
      )
    }

    const attempts =
      Number(
        recovery.attempts || 0
      )

    if (
      attempts >=
      MAX_OTP_ATTEMPTS
    ) {
      throw new Error(
        "Too many OTP attempts"
      )
    }

    const validOtp =
      await bcrypt.compare(
        otp,
        recovery.otpHash
      )

    if (!validOtp) {

      await db.send(
        new PutCommand({
          TableName: TABLE,

          Item: {
            ...recovery,

            attempts:
              attempts + 1
          }
        })
      )

      throw new Error(
        "Invalid or expired OTP"
      )
    }

    const resetToken =
      generateResetToken()

    const resetTokenHash =
      hashResetToken(
        resetToken
      )

    const resetTokenExpiresAt =
      now +
      RESET_TOKEN_EXPIRY_SECONDS

    /*
     * OTP cannot be reused after
     * successful verification.
     */
    await db.send(
      new PutCommand({
        TableName: TABLE,

        Item: {
          ...recovery,

          used: true,

          resetTokenHash,

          resetTokenExpiresAt,

          ttl:
            resetTokenExpiresAt
        }
      })
    )

    return {
      resetToken,

      userId:
        recovery.userId,

      garageId:
        recovery.garageId,

      role:
        recovery.role,

      workerId:
        recovery.workerId
    }
  }


/*
 * Consume reset token.
 */
export const consumeResetToken =
  async (
    resetToken: string
  ) => {

    const resetTokenHash =
      hashResetToken(
        resetToken
      )

    /*
     * PinRecovery is keyed by phone,
     * so reset token lookup requires a Scan.
     *
     * This is acceptable for the current
     * DynamoDB Local implementation.
     */
    const {
      ScanCommand
    } = await import(
      "@aws-sdk/lib-dynamodb"
    )

    const response =
      await db.send(
        new ScanCommand({
          TableName: TABLE,

          FilterExpression:
            "resetTokenHash = :token",

          ExpressionAttributeValues: {
            ":token":
              resetTokenHash
          }
        })
      )

    const recovery =
      response.Items?.[0]

    if (!recovery) {
      throw new Error(
        "Invalid or expired reset token"
      )
    }

    const now =
      Math.floor(Date.now() / 1000)

    if (
      Number(
        recovery.resetTokenExpiresAt
      ) < now
    ) {
      throw new Error(
        "Invalid or expired reset token"
      )
    }

    if (
      recovery.used !== true
    ) {
      throw new Error(
        "Invalid or expired reset token"
      )
    }

    return recovery
  }


/*
 * Permanently invalidate recovery record.
 */
export const deletePinRecovery =
  async (
    phone: string
  ) => {

    await db.send(
      new DeleteCommand({
        TableName: TABLE,

        Key: {
          phone:
            phone.trim()
        }
      })
    )
  }