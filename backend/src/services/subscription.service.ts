import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  TransactWriteItemsCommand
} from "@aws-sdk/client-dynamodb"

import crypto from "crypto"

import {
  unmarshall
} from "@aws-sdk/util-dynamodb"

import {
  db
} from "../config/dynamodb"

import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyCapturedPayment
} from "./razorpay.service"

const TABLE =
  process.env.SUBSCRIPTIONS_TABLE_NAME || "Subscriptions"

const WEBHOOK_EVENTS_TABLE =
  process.env.WEBHOOK_EVENTS_TABLE_NAME || "WebhookEvents"

const PAYMENT_ORDERS_TABLE =
  process.env.PAYMENT_ORDERS_TABLE_NAME ||
  "PaymentOrders"


export const isWebhookEventProcessed = async (
  eventId: string
): Promise<boolean> => {
  if (!eventId) {
    throw new Error("Webhook event ID is required")
  }

  const response = await db.send(
    new GetItemCommand({
      TableName: WEBHOOK_EVENTS_TABLE,
      Key: {
        eventId: { S: eventId }
      },
      ConsistentRead: true
    })
  )

  return Boolean(response.Item)
}

export const markWebhookEventProcessed = async (
  eventId: string,
  eventType: string
) => {
  if (!eventId || !eventType) {
    throw new Error("Webhook event ID and type are required");
  }

  const now = new Date().toISOString();

  await db.send(
    new UpdateItemCommand({
      TableName: WEBHOOK_EVENTS_TABLE,
      Key: {
        eventId: { S: eventId },
      },
      UpdateExpression:
        "SET #status = :processed, eventType = :eventType, processedAt = :processedAt REMOVE leaseUntil",
      ConditionExpression: "#status = :processing",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":processed": { S: "PROCESSED" },
        ":processing": { S: "PROCESSING" },
        ":eventType": { S: eventType },
        ":processedAt": { S: now },
      },
    })
  );
};

export const claimWebhookEvent = async (
  eventId: string,
  eventType: string
): Promise<boolean> => {
  if (!eventId || !eventType) {
    throw new Error("Webhook event ID and type are required");
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const leaseUntil = new Date(
    now.getTime() + 5 * 60 * 1000
  ).toISOString();

  try {
    await db.send(
      new PutItemCommand({
        TableName: WEBHOOK_EVENTS_TABLE,
        Item: {
          eventId: { S: eventId },
          eventType: { S: eventType },
          status: { S: "PROCESSING" },
          leaseUntil: { S: leaseUntil },
          createdAt: { S: nowIso },
        },
        ConditionExpression: "attribute_not_exists(eventId)",
      })
    );

    return true;
  } catch (error: any) {
    if (error?.name !== "ConditionalCheckFailedException") {
      throw error;
    }
  }

  const existing = await db.send(
    new GetItemCommand({
      TableName: WEBHOOK_EVENTS_TABLE,
      Key: {
        eventId: { S: eventId },
      },
      ConsistentRead: true,
    })
  );

  if (!existing.Item) {
    return false;
  }

  if (existing.Item.status?.S === "PROCESSED") {
    return false;
  }

  const existingLease = existing.Item.leaseUntil?.S;

  if (!existingLease || existingLease > nowIso) {
    return false;
  }

  try {
    await db.send(
      new UpdateItemCommand({
        TableName: WEBHOOK_EVENTS_TABLE,
        Key: {
          eventId: { S: eventId },
        },
        UpdateExpression:
          "SET #status = :processing, leaseUntil = :leaseUntil, eventType = :eventType",
        ConditionExpression:
          "#status = :processing AND leaseUntil <= :now",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":processing": { S: "PROCESSING" },
          ":leaseUntil": { S: leaseUntil },
          ":eventType": { S: eventType },
          ":now": { S: nowIso },
        },
      })
    );

    return true;
  } catch (error: any) {
    if (error?.name === "ConditionalCheckFailedException") {
      return false;
    }

    throw error;
  }
}

const getPaymentOrder = async (orderId: string) => {
  if (!orderId) {
    throw new Error("Razorpay order ID is required")
  }

  const response = await db.send(
    new GetItemCommand({
      TableName: PAYMENT_ORDERS_TABLE,
      Key: {
        orderId: { S: orderId }
      },
      ConsistentRead: true
    })
  )

  if (!response.Item) {
    throw new Error("Payment order not found")
  }

  return unmarshall(response.Item)
}

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type PaymentType = "PLAN" | "BOOSTER"

type PaymentOrderStatus =
  | "CREATED"
  | "AUTHORIZED"
  | "CAPTURED"
  | "FAILED"
  | "CANCELLED"

type PaymentOrderRecord = {
  orderId: string
  garageId: string
  paymentType: PaymentType
  amount: number
  currency: string
  status: PaymentOrderStatus
  createdAt: string
  updatedAt: string

  planCode?: string
  billingCycle?: BillingCycle

  boosterCode?: string
  boosterJobs?: number

  paymentId?: string
  activatedAt?: string
}

type BillingCycle =
  | "MONTHLY"
  | "ANNUAL"

type CreatePaymentOrderRecord = {
  orderId: string
  garageId: string
  paymentType: PaymentType
  amount: number // Razorpay amount in paise
  currency: string
  status: "CREATED"
  createdAt: string
  updatedAt: string
  planCode?: string
  billingCycle?: BillingCycle
  boosterCode?: string
  boosterJobs?: number
}

/*
|--------------------------------------------------------------------------
| PLANS
|--------------------------------------------------------------------------
*/

export const PLANS = {

  FREE: {
    code: "FREE",
    name: "Free",

    monthlyPrice: 0,
    annualPricePerMonth: 0,

    jobsPerMonth: 20,
    workers: 1,

    inventory: "Basic",
    invoicing: false,

    reports: "Basic",
    backup: "Manual",

    prioritySupport: false
  },

  BASIC: {
    code: "BASIC",
    name: "Basic",

    monthlyPrice: 299,
    annualPricePerMonth: 199,

    jobsPerMonth: 100,
    workers: 3,

    inventory: "Full",
    invoicing: true,

    reports: "Standard",
    backup: "Daily",

    prioritySupport: false
  },

  GROWTH: {
    code: "GROWTH",
    name: "Growth",

    monthlyPrice: 549,
    annualPricePerMonth: 399,

    jobsPerMonth: 250,
    workers: 6,

    inventory: "Full",
    invoicing: true,

    reports: "Advanced",
    backup: "Daily",

    prioritySupport: true
  },

  CORPORATE: {
    code: "CORPORATE",
    name: "Corporate",

    monthlyPrice: 899,
    annualPricePerMonth: 629,

    jobsPerMonth: -1,
    workers: -1,

    inventory: "Full",
    invoicing: true,

    reports: "Advanced",
    backup: "Real-time",

    prioritySupport: true
  }

} as const


/*
|--------------------------------------------------------------------------
| BOOSTERS
|--------------------------------------------------------------------------
*/

export const BOOSTERS = {

  MINI: {
    code: "MINI_BOOST",
    jobs: 20,
    price: 49
  },

  STANDARD: {
    code: "STANDARD_BOOST",
    jobs: 50,
    price: 99
  },

  BIG: {
    code: "BIG_BOOST",
    jobs: 150,
    price: 249
  }

} as const


/*
|--------------------------------------------------------------------------
| GET SUBSCRIPTION
|--------------------------------------------------------------------------
*/

export const getSubscription =
async (
  garageId: string
) => {

  const response =
    await db.send(
      new GetItemCommand({

        TableName: TABLE,

        Key: {
          garageId: {
            S: garageId
          }
        }

      })
    )

  if (!response.Item) {
    return null
  }

  return unmarshall(
    response.Item
  )

}


/*
|--------------------------------------------------------------------------
| CREATE DEFAULT SUBSCRIPTION
|--------------------------------------------------------------------------
*/

export const createDefaultSubscription =
async (
  garageId: string
) => {

  const now =
    new Date()

  const renewalDate =
    new Date(now)

  renewalDate.setMonth(
    renewalDate.getMonth() + 1
  )

  const plan =
    PLANS.FREE

  const item = {

    garageId: {
      S: garageId
    },

    planCode: {
      S: plan.code
    },

    planName: {
      S: plan.name
    },

    billingCycle: {
      S: "MONTHLY"
    },

    status: {
      S: "ACTIVE"
    },

    jobsUsed: {
      N: "0"
    },

    jobLimit: {
      N: plan.jobsPerMonth.toString()
    },

    boosterJobs: {
      N: "0"
    },

    renewalDate: {
      S: renewalDate.toISOString()
    },

    createdAt: {
      S: now.toISOString()
    },

    updatedAt: {
      S: now.toISOString()
    }

  }

  await db.send(
    new PutItemCommand({

      TableName: TABLE,

      Item: item,

      // Prevent two simultaneous requests from
      // creating competing subscriptions.
      ConditionExpression:
        "attribute_not_exists(garageId)"

    })
  )

  return unmarshall(item)

}


/*
|--------------------------------------------------------------------------
| GET OR CREATE
|--------------------------------------------------------------------------
*/

export const getOrCreateSubscription =
async (
  garageId: string
) => {

  const existing =
    await getSubscription(
      garageId
    )

  if (existing) {
    return existing
  }

  try {

    return await createDefaultSubscription(
      garageId
    )

  } catch (error: any) {

    // Another request may have created it
    // between GET and PUT.
    if (
      error?.name ===
      "ConditionalCheckFailedException"
    ) {

      const created =
        await getSubscription(
          garageId
        )

      if (created) {
        return created
      }

    }

    throw error

  }

}


/*
|--------------------------------------------------------------------------
| GET PLAN INFORMATION
|--------------------------------------------------------------------------
*/

export const getPlanInformation =
async (
  garageId: string
) => {

  let subscription =
    await getOrCreateSubscription(
      garageId
    )


  /*
   * ---------------------------------------------------------------
   * AUTOMATIC RENEWAL / MONTH RESET
   * ---------------------------------------------------------------
   *
   * When the renewal date has passed:
   *
   * - reset monthly usage
   * - remove consumed/old booster jobs
   * - keep the current plan
   * - create the next renewal date
   *
   */

  if (
    subscription.renewalDate &&
    new Date(subscription.renewalDate).getTime()
      <= Date.now()
  ) {

    subscription =
      await renewSubscription(
        garageId,
        subscription
      )

  }


  const plan =
    Object.values(PLANS)
      .find(
        item =>
          item.code ===
          subscription.planCode
      )


  const jobsUsed =
    Number(
      subscription.jobsUsed || 0
    )

  const jobLimit =
    Number(
      subscription.jobLimit || 0
    )

  const boosterJobs =
    Number(
      subscription.boosterJobs || 0
    )


  const totalJobsAvailable =
    jobLimit === -1
      ? -1
      : jobLimit + boosterJobs


  const jobsRemaining =
    totalJobsAvailable === -1
      ? -1
      : Math.max(
          totalJobsAvailable -
          jobsUsed,
          0
        )


  const usagePercentage =
    totalJobsAvailable === -1
      ? 0
      : Math.min(
          Math.round(
            (
              jobsUsed /
              totalJobsAvailable
            ) * 100
          ),
          100
        )


  return {

    subscription,

    plan: plan || null,

    usage: {

      jobsUsed,

      jobLimit,

      boosterJobs,

      totalJobsAvailable,

      jobsRemaining,

      usagePercentage

    },

    availablePlans:
      Object.values(PLANS),

    availableBoosters:
      Object.values(BOOSTERS)

  }

}


/*
|--------------------------------------------------------------------------
| RENEW SUBSCRIPTION
|--------------------------------------------------------------------------
*/

const renewSubscription =
async (
  garageId: string,
  subscription: any
) => {

  const currentRenewal =
    subscription.renewalDate
      ? new Date(
          subscription.renewalDate
        )
      : new Date()


  const billingCycle =
    subscription.billingCycle ===
    "ANNUAL"
      ? "ANNUAL"
      : "MONTHLY"


  const nextRenewal =
    new Date(
      currentRenewal
    )


  if (
    billingCycle ===
    "ANNUAL"
  ) {

    nextRenewal.setFullYear(
      nextRenewal.getFullYear() + 1
    )

  } else {

    nextRenewal.setMonth(
      nextRenewal.getMonth() + 1
    )

  }


  /*
   * Important:
   *
   * Booster jobs are monthly/period usage additions
   * in this implementation.
   *
   * They reset with the monthly period.
   */

  await db.send(
    new UpdateItemCommand({

      TableName: TABLE,

      Key: {
        garageId: {
          S: garageId
        }
      },

      UpdateExpression:
        `
        SET
          jobsUsed = :jobsUsed,
          boosterJobs = :boosterJobs,
          renewalDate = :renewalDate,
          updatedAt = :updatedAt
        `,

      ExpressionAttributeValues: {

        ":jobsUsed": {
          N: "0"
        },

        ":boosterJobs": {
          N: "0"
        },

        ":renewalDate": {
          S:
            nextRenewal.toISOString()
        },

        ":updatedAt": {
          S:
            new Date().toISOString()
        }

      }

    })
  )


  return getSubscription(
    garageId
  )

}


/*
|--------------------------------------------------------------------------
| CREATE PLAN PAYMENT ORDER
|--------------------------------------------------------------------------
*/

export const createPlanPaymentOrder = async (
  garageId: string,
  planCode: string,
  billingCycle: BillingCycle
) => {
  const normalizedPlanCode = String(planCode || "")
    .trim()
    .toUpperCase()

  const normalizedBillingCycle = String(billingCycle || "")
    .trim()
    .toUpperCase() as BillingCycle

  if (!garageId) {
    throw new Error("Garage ID is required")
  }

  if (
    normalizedBillingCycle !== "MONTHLY" &&
    normalizedBillingCycle !== "ANNUAL"
  ) {
    throw new Error("Invalid billing cycle")
  }

  const plan = Object.values(PLANS).find(
    item => item.code === normalizedPlanCode
  )

  if (!plan || plan.code === "FREE") {
    throw new Error("Invalid paid plan")
  }

  const amount =
    normalizedBillingCycle === "MONTHLY"
      ? plan.monthlyPrice
      : plan.annualPricePerMonth * 12

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid payment amount")
  }

  await getOrCreateSubscription(garageId)

  const keyId = process.env.RAZORPAY_KEY_ID

  if (!keyId) {
    throw new Error("Razorpay key ID is not configured")
  }

  const receipt = `plan_${crypto.randomUUID()}`

  const order = await createRazorpayOrder(
    amount,
    receipt,
    {
      garageId,
      paymentType: "PLAN",
      planCode: plan.code,
      billingCycle: normalizedBillingCycle
    }
  )

  if (
    !order?.id ||
    !Number.isInteger(Number(order.amount)) ||
    Number(order.amount) !== Math.round(amount * 100) ||
    order.currency !== "INR"
  ) {
    throw new Error("Razorpay returned invalid order details")
  }

  const now = new Date().toISOString()

  await savePaymentOrder({
    orderId: order.id,
    garageId,
    paymentType: "PLAN",
    planCode: plan.code,
    billingCycle: normalizedBillingCycle,
    amount: Number(order.amount),
    currency: order.currency,
    status: "CREATED",
    createdAt: now,
    updatedAt: now
  })

  return {
    paymentRequired: true,
    payment: {
      orderId: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      keyId,
      planCode: plan.code,
      billingCycle: normalizedBillingCycle
    }
  }
}


/*
|--------------------------------------------------------------------------
| ACTIVATE PLAN
|--------------------------------------------------------------------------
*/

const activatePlan = async (
  garageId: string,
  orderId: string,
  paymentId: string
) => {
  const order = await getPaymentOrder(orderId)

  // A retry after successful activation must not apply the plan twice.
  if (order.status === "ACTIVATED") {
    if (
      order.garageId === garageId &&
      order.paymentId === paymentId
    ) {
      return getSubscription(garageId)
    }

    throw new Error("Payment order has already been activated")
  }

  if (order.garageId !== garageId) {
    throw new Error("Payment order does not belong to this garage")
  }

  if (order.paymentType !== "PLAN") {
    throw new Error("This is not a plan payment order")
  }

  if (order.status !== "CREATED") {
    throw new Error("Payment order is not awaiting activation")
  }

  const planCode = order.planCode
  const billingCycle = order.billingCycle

  if (
    !planCode ||
    !["MONTHLY", "ANNUAL"].includes(billingCycle)
  ) {
    throw new Error("Plan information is missing or invalid")
  }

  const plan = Object.values(PLANS).find(
    item => item.code === planCode
  )

  if (!plan) {
    throw new Error("Invalid plan")
  }

  await getOrCreateSubscription(garageId)

  const now = new Date()
  const renewalDate = new Date(now)

  if (billingCycle === "ANNUAL") {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1)
  } else {
    renewalDate.setMonth(renewalDate.getMonth() + 1)
  }

  await db.send(
    new TransactWriteItemsCommand({
      TransactItems: [
        {
          Update: {
            TableName: TABLE,
            Key: {
              garageId: { S: garageId }
            },
            UpdateExpression: `
              SET
                planCode = :planCode,
                planName = :planName,
                billingCycle = :billingCycle,
                #status = :active,
                jobLimit = :jobLimit,
                renewalDate = :renewalDate,
                paymentStatus = :captured,
                razorpayOrderId = :orderId,
                razorpayPaymentId = :paymentId,
                updatedAt = :updatedAt
            `,
            ExpressionAttributeNames: {
              "#status": "status"
            },
            ExpressionAttributeValues: {
              ":planCode": { S: plan.code },
              ":planName": { S: plan.name },
              ":billingCycle": { S: billingCycle },
              ":active": { S: "ACTIVE" },
              ":jobLimit": { N: String(plan.jobsPerMonth) },
              ":renewalDate": { S: renewalDate.toISOString() },
              ":captured": { S: "CAPTURED" },
              ":orderId": { S: orderId },
              ":paymentId": { S: paymentId },
              ":updatedAt": { S: now.toISOString() }
            }
          }
        },
        {
          Update: {
            TableName: PAYMENT_ORDERS_TABLE,
            Key: {
              orderId: { S: orderId }
            },
            UpdateExpression: `
              SET
                #status = :activated,
                paymentId = :paymentId,
                activatedAt = :activatedAt
            `,
            ConditionExpression: `
              #status = :created AND garageId = :garageId
            `,
            ExpressionAttributeNames: {
              "#status": "status"
            },
            ExpressionAttributeValues: {
              ":activated": { S: "ACTIVATED" },
              ":created": { S: "CREATED" },
              ":garageId": { S: garageId },
              ":paymentId": { S: paymentId },
              ":activatedAt": { S: now.toISOString() }
            }
          }
        }
      ]
    })
  )

  return getSubscription(garageId)
}


/*
|--------------------------------------------------------------------------
| VERIFY PLAN PAYMENT
|--------------------------------------------------------------------------
*/

export const verifyPlanPayment = async (
  garageId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) => {
  if (!garageId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new Error("Missing payment verification details")
  }

  const order = await getPaymentOrder(razorpayOrderId)

  if (order.garageId !== garageId) {
    throw new Error("Payment order does not belong to this garage")
  }

  if (order.paymentType !== "PLAN") {
    throw new Error("This is not a plan payment order")
  }

  if (order.status !== "CREATED") {
    throw new Error("Payment order is not awaiting verification")
  }

  const valid = verifyPaymentSignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  )

  if (!valid) {
    throw new Error("Invalid payment signature")
  }

  await verifyCapturedPayment({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    expectedAmount: Number(order.amount),
    expectedCurrency: order.currency
  })

  // Activation will be migrated to PaymentOrders in the next step.
  return activatePlan(
    garageId,
    razorpayOrderId,
    razorpayPaymentId
  )
}


/*
|--------------------------------------------------------------------------
| CREATE BOOSTER PAYMENT ORDER
|--------------------------------------------------------------------------
*/

export const createBoosterPaymentOrder = async (
  garageId: string,
  boosterCode: string
) => {
  const normalizedCode = String(boosterCode || "")
    .trim()
    .toUpperCase()

  if (!garageId) {
    throw new Error("Garage ID is required")
  }

  const booster = Object.values(BOOSTERS).find(
    item => item.code === normalizedCode
  )

  if (!booster) {
    throw new Error("Invalid booster")
  }

  await getOrCreateSubscription(garageId)

  const keyId = process.env.RAZORPAY_KEY_ID

  if (!keyId) {
    throw new Error("Razorpay key ID is not configured")
  }

  const receipt = `booster_${crypto.randomUUID()}`

  const order = await createRazorpayOrder(
    booster.price,
    receipt,
    {
      garageId,
      paymentType: "BOOSTER",
      boosterCode: booster.code
    }
  )

  if (
    !order?.id ||
    !Number.isInteger(Number(order.amount)) ||
    Number(order.amount) !== Math.round(booster.price * 100) ||
    order.currency !== "INR"
  ) {
    throw new Error("Razorpay returned invalid order details")
  }

  const now = new Date().toISOString()

  await savePaymentOrder({
    orderId: order.id,
    garageId,
    paymentType: "BOOSTER",
    boosterCode: booster.code,
    boosterJobs: booster.jobs,
    amount: Number(order.amount),
    currency: order.currency,
    status: "CREATED",
    createdAt: now,
    updatedAt: now
  })

  return {
    paymentRequired: true,
    payment: {
      orderId: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      keyId,
      boosterCode: booster.code,
      jobs: booster.jobs
    }
  }
}


/*
|--------------------------------------------------------------------------
| VERIFY BOOSTER PAYMENT
|--------------------------------------------------------------------------
*/

export const verifyBoosterPayment = async (
  garageId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) => {
  if (!garageId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new Error("Missing payment verification details")
  }

  const order = await getPaymentOrder(razorpayOrderId)

  if (order.garageId !== garageId) {
    throw new Error("Payment order does not belong to this garage")
  }

  if (order.paymentType !== "BOOSTER") {
    throw new Error("This is not a booster payment order")
  }

  if (order.status !== "CREATED") {
    throw new Error("Payment order is not awaiting verification")
  }

  const valid = verifyPaymentSignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  )

  if (!valid) {
    throw new Error("Invalid payment signature")
  }

  // Activation will be migrated to PaymentOrders in the next step.
  return activateBooster(
    garageId,
    razorpayOrderId,
    razorpayPaymentId
  )
}

/*
|--------------------------------------------------------------------------
| ACTIVATE BOOSTER
|--------------------------------------------------------------------------
*/

const activateBooster = async (
  garageId: string,
  orderId: string,
  paymentId: string
) => {
  const order = await getPaymentOrder(orderId)

  // A retry after successful activation must not add the jobs again.
  if (order.status === "ACTIVATED") {
    if (
      order.garageId === garageId &&
      order.paymentId === paymentId
    ) {
      return getSubscription(garageId)
    }

    throw new Error("Payment order has already been activated")
  }

  if (order.garageId !== garageId) {
    throw new Error("Payment order does not belong to this garage")
  }

  if (order.paymentType !== "BOOSTER") {
    throw new Error("This is not a booster payment order")
  }

  if (order.status !== "CREATED") {
    throw new Error("Payment order is not awaiting activation")
  }

  const booster = Object.values(BOOSTERS).find(
    item => item.code === order.boosterCode
  )

  if (!booster) {
    throw new Error("Invalid booster in payment order")
  }

  if (
    Number(order.boosterJobs) !== booster.jobs
  ) {
    throw new Error("Booster job quantity does not match")
  }

  await getOrCreateSubscription(garageId)

  const now = new Date()

  await db.send(
    new TransactWriteItemsCommand({
      TransactItems: [
        {
          Update: {
            TableName: TABLE,
            Key: {
              garageId: { S: garageId }
            },
            UpdateExpression: `
              ADD boosterJobs :boosterJobs
              SET
                lastBoosterCode = :boosterCode,
                lastBoosterPaymentId = :paymentId,
                lastBoosterOrderId = :orderId,
                lastBoosterJobs = :jobs,
                lastBoosterPurchasedAt = :purchasedAt,
                paymentStatus = :captured,
                updatedAt = :updatedAt
            `,
            ExpressionAttributeValues: {
              ":boosterJobs": { N: String(booster.jobs) },
              ":boosterCode": { S: booster.code },
              ":paymentId": { S: paymentId },
              ":orderId": { S: orderId },
              ":jobs": { N: String(booster.jobs) },
              ":purchasedAt": { S: now.toISOString() },
              ":captured": { S: "CAPTURED" },
              ":updatedAt": { S: now.toISOString() }
            }
          }
        },
        {
          Update: {
            TableName: PAYMENT_ORDERS_TABLE,
            Key: {
              orderId: { S: orderId }
            },
            UpdateExpression: `
              SET
                #status = :activated,
                paymentId = :paymentId,
                activatedAt = :activatedAt
            `,
            ConditionExpression: `
              #status = :created AND garageId = :garageId
            `,
            ExpressionAttributeNames: {
              "#status": "status"
            },
            ExpressionAttributeValues: {
              ":activated": { S: "ACTIVATED" },
              ":created": { S: "CREATED" },
              ":garageId": { S: garageId },
              ":paymentId": { S: paymentId },
              ":activatedAt": { S: now.toISOString() }
            }
          }
        }
      ]
    })
  )

  return getSubscription(garageId)
}


/*
|--------------------------------------------------------------------------
| ADD BOOSTER
|--------------------------------------------------------------------------
|
| DO NOT expose this as a public "give me jobs" endpoint.
|
| Booster activation must happen only after payment verification.
|
*/

export const addBooster =
async (
  garageId: string,
  boosterCode: string
) => {

  throw new Error(
    "Direct booster activation is disabled. Create a booster payment order instead."
  )

}


/*
|--------------------------------------------------------------------------
| INCREMENT JOB USAGE
|--------------------------------------------------------------------------
*/

export const incrementJobUsage =
async (
  garageId: string
) => {

  const subscription =
    await getOrCreateSubscription(
      garageId
    )


  const jobsUsed =
    Number(
      subscription.jobsUsed || 0
    )

  const jobLimit =
    Number(
      subscription.jobLimit || 0
    )

  const boosterJobs =
    Number(
      subscription.boosterJobs || 0
    )


  const totalAvailable =
    jobLimit === -1
      ? -1
      : jobLimit + boosterJobs


  if (
    totalAvailable !== -1 &&
    jobsUsed >= totalAvailable
  ) {

    throw new Error(
      "Monthly job limit reached"
    )

  }


  /*
   * IMPORTANT:
   *
   * This calculation is not atomic.
   *
   * For production, the job creation flow should use
   * an atomic DynamoDB update.
   *
   * The current implementation is retained here for
   * compatibility with your existing callers.
   */

  const now =
    new Date()


  await db.send(
    new UpdateItemCommand({

      TableName: TABLE,

      Key: {
        garageId: {
          S: garageId
        }
      },

      UpdateExpression:
        "SET jobsUsed = :jobsUsed, updatedAt = :updatedAt",

      ExpressionAttributeValues: {

        ":jobsUsed": {
          N:
            (
              jobsUsed + 1
            ).toString()
        },

        ":updatedAt": {
          S:
            now.toISOString()
        }

      }

    })
  )


  return getSubscription(
    garageId
  )

}


/*
|--------------------------------------------------------------------------
| RAZORPAY CAPTURED WEBHOOK
|--------------------------------------------------------------------------
*/

export const processRazorpayPaymentCaptured = async (
  orderId: string,
  paymentId: string,
  amountInPaise: number,
  currency: string
) => {
  if (!orderId || !paymentId) {
    throw new Error("Missing webhook payment details")
  }

  // PaymentOrders is the authoritative source of ownership and purchase data.
  const order = await getPaymentOrder(orderId)

  if (!order.garageId) {
    throw new Error("Payment order has no associated garage")
  }

  if (!["PLAN", "BOOSTER"].includes(order.paymentType)) {
    throw new Error("Invalid payment order type")
  }

  if (Number(order.amount) !== amountInPaise) {
    throw new Error("Webhook amount does not match stored order")
  }

  if (order.currency !== currency) {
    throw new Error("Webhook currency does not match stored order")
  }

  // Independently confirm the payment with Razorpay.
  await verifyCapturedPayment({
    orderId,
    paymentId,
    expectedAmount: Number(order.amount),
    expectedCurrency: order.currency
  })

  // These functions use conditional DynamoDB transactions.
  // Repeated activation of the same payment is idempotent.
  if (order.paymentType === "BOOSTER") {
    return activateBooster(
      order.garageId,
      orderId,
      paymentId
    )
  }

  return activatePlan(
    order.garageId,
    orderId,
    paymentId
  )
}

/*
|--------------------------------------------------------------------------
| PAYMENT FAILED
|--------------------------------------------------------------------------
*/

type RazorpayPaymentEntity = {
  id?: string
  order_id?: string
  error_code?: string
  error_description?: string
}


export const processRazorpayPaymentFailed = async (
  orderId: string,
  payment: RazorpayPaymentEntity
) => {
  if (!orderId || !payment?.id) {
    throw new Error("Missing failed payment details")
  }

  if (payment.order_id !== orderId) {
    throw new Error("Failed payment order ID mismatch")
  }

  const order = await getPaymentOrder(orderId)

  if (!order.garageId) {
    throw new Error("Payment order has no associated garage")
  }

  // Never let a delayed failure event overwrite a successful payment.
  if (order.status === "ACTIVATED") {
    return getSubscription(order.garageId)
  }

  // Do not modify an order already marked failed or otherwise closed.
  if (order.status !== "CREATED") {
    return getSubscription(order.garageId)
  }

  const now = new Date()

  const errorCode =
    payment.error_code || "UNKNOWN"

  const errorDescription =
    payment.error_description || "Payment failed"

  await db.send(
    new UpdateItemCommand({
      TableName: PAYMENT_ORDERS_TABLE,
      Key: {
        orderId: { S: orderId }
      },
      UpdateExpression: `
        SET
          #status = :failed,
          paymentId = :paymentId,
          failureCode = :errorCode,
          failureDescription = :errorDescription,
          failedAt = :failedAt
      `,
      ConditionExpression: `
        #status = :created
        AND garageId = :garageId
      `,
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":failed": { S: "FAILED" },
        ":created": { S: "CREATED" },
        ":garageId": { S: order.garageId },
        ":paymentId": { S: payment.id },
        ":errorCode": { S: errorCode },
        ":errorDescription": { S: errorDescription },
        ":failedAt": { S: now.toISOString() }
      }
    })
  )

  // Record diagnostic information without changing subscription entitlements.
  await db.send(
    new UpdateItemCommand({
      TableName: TABLE,
      Key: {
        garageId: { S: order.garageId }
      },
      UpdateExpression: `
        SET
          lastPaymentId = :paymentId,
          lastPaymentOrderId = :orderId,
          lastPaymentStatus = :failed,
          lastPaymentErrorCode = :errorCode,
          lastPaymentErrorDescription = :errorDescription,
          updatedAt = :updatedAt
      `,
      ExpressionAttributeValues: {
        ":paymentId": { S: payment.id },
        ":orderId": { S: orderId },
        ":failed": { S: "FAILED" },
        ":errorCode": { S: errorCode },
        ":errorDescription": { S: errorDescription },
        ":updatedAt": { S: now.toISOString() }
      }
    })
  )

  return getSubscription(order.garageId)
}

const savePaymentOrder = async (
  record: CreatePaymentOrderRecord
): Promise<void> => {
  if (
    !record.orderId ||
    !record.garageId ||
    !Number.isInteger(record.amount) ||
    record.amount <= 0 ||
    record.currency !== "INR" ||
    record.status !== "CREATED"
  ) {
    throw new Error("Invalid payment order record")
  }

  if (
    record.paymentType === "PLAN" &&
    (!record.planCode || !record.billingCycle)
  ) {
    throw new Error("Plan payment order details are incomplete")
  }

  if (
    record.paymentType === "BOOSTER" &&
    (
      !record.boosterCode ||
      !Number.isInteger(record.boosterJobs) ||
      record.boosterJobs! <= 0
    )
  ) {
    throw new Error("Booster payment order details are incomplete")
  }
  await db.send(
    new PutItemCommand({
      TableName: PAYMENT_ORDERS_TABLE,
      Item: {
        orderId: { S: record.orderId },
        garageId: { S: record.garageId },
        paymentType: { S: record.paymentType },
        amount: { N: String(record.amount) },
        currency: { S: record.currency },
        status: { S: record.status },
        createdAt: { S: record.createdAt },
        updatedAt: { S: record.updatedAt },

        ...(record.planCode
          ? { planCode: { S: record.planCode } }
          : {}),

        ...(record.billingCycle
          ? { billingCycle: { S: record.billingCycle } }
          : {}),

        ...(record.boosterCode
          ? { boosterCode: { S: record.boosterCode } }
          : {}),

        ...(record.boosterJobs !== undefined
          ? { boosterJobs: { N: String(record.boosterJobs) } }
          : {})
      },
      ConditionExpression: "attribute_not_exists(orderId)"
    })
  )
}