import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  TransactWriteItemsCommand
} from "@aws-sdk/client-dynamodb"

import {
  unmarshall
} from "@aws-sdk/util-dynamodb"

import {
  db
} from "../config/dynamodb"

import {
  createRazorpayOrder,
  verifyPaymentSignature
} from "./razorpay.service"


const TABLE =
  process.env.SUBSCRIPTIONS_TABLE_NAME || "Subscriptions"


/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type BillingCycle =
  | "MONTHLY"
  | "ANNUAL"


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

export const createPlanPaymentOrder =
async (
  garageId: string,
  planCode: string,
  billingCycle: BillingCycle
) => {

  const normalizedPlanCode =
    String(
      planCode || ""
    )
      .trim()
      .toUpperCase()


  const normalizedBillingCycle =
    String(
      billingCycle || ""
    )
      .trim()
      .toUpperCase() as BillingCycle


  if (
    normalizedBillingCycle !== "MONTHLY" &&
    normalizedBillingCycle !== "ANNUAL"
  ) {

    throw new Error(
      "Invalid billing cycle"
    )

  }


  const plan =
    Object.values(PLANS)
      .find(
        item =>
          item.code ===
          normalizedPlanCode
      )


  if (!plan) {

    throw new Error(
      "Invalid plan"
    )

  }


  if (
    plan.code === "FREE"
  ) {

    throw new Error(
      "Free plan does not require payment"
    )

  }


  const amount =
    normalizedBillingCycle === "MONTHLY"
      ? plan.monthlyPrice
      : plan.annualPricePerMonth * 12


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    throw new Error(
      "Invalid payment amount"
    )

  }


  const subscription =
    await getOrCreateSubscription(
      garageId
    )


  /*
   * Do not allow another payment order while
   * a previous order is still pending.
   */

  if (
    subscription.pendingOrderId &&
    subscription.paymentStatus ===
      "CREATED"
  ) {

    return {

      paymentRequired: true,

      payment: {

        orderId:
          subscription.pendingOrderId,

        amount:
          Math.round(
            Number(
              subscription.pendingAmount
            ) * 100
          ),

        currency:
          "INR",

        keyId:
          process.env.RAZORPAY_KEY_ID,

        planCode:
          subscription.pendingPlanCode,

        billingCycle:
          subscription.pendingBillingCycle

      }

    }

  }


  const receipt =
    `plan_${garageId}_${Date.now()}`


  const order =
    await createRazorpayOrder(

      amount,

      receipt,

      {

        garageId,

        paymentType:
          "PLAN",

        planCode:
          plan.code,

        billingCycle:
          normalizedBillingCycle

      }

    )


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
        `
        SET
          pendingOrderId = :orderId,
          pendingPlanCode = :planCode,
          pendingBillingCycle = :billingCycle,
          pendingAmount = :amount,
          paymentStatus = :paymentStatus,
          updatedAt = :updatedAt
        `,

      ExpressionAttributeValues: {

        ":orderId": {
          S: order.id
        },

        ":planCode": {
          S: plan.code
        },

        ":billingCycle": {
          S:
            normalizedBillingCycle
        },

        ":amount": {
          N:
            amount.toString()
        },

        ":paymentStatus": {
          S: "CREATED"
        },

        ":updatedAt": {
          S:
            now.toISOString()
        }

      }

    })
  )


  return {

    paymentRequired: true,

    payment: {

      orderId:
        order.id,

      amount:
        order.amount,

      currency:
        order.currency,

      keyId:
        process.env.RAZORPAY_KEY_ID,

      planCode:
        plan.code,

      billingCycle:
        normalizedBillingCycle

    }

  }

}


/*
|--------------------------------------------------------------------------
| ACTIVATE PLAN
|--------------------------------------------------------------------------
*/

const activatePlan =
async (
  garageId: string,
  orderId: string,
  paymentId: string
) => {

  const subscription =
    await getOrCreateSubscription(
      garageId
    )


  if (
    subscription.razorpayPaymentId ===
    paymentId
  ) {

    return subscription

  }


  if (
    subscription.pendingOrderId !==
    orderId
  ) {

    throw new Error(
      "Payment order does not match pending subscription order"
    )

  }


  const planCode =
    subscription.pendingPlanCode


  const billingCycle =
    subscription.pendingBillingCycle


  if (
    !planCode ||
    !billingCycle
  ) {

    throw new Error(
      "Pending subscription information missing"
    )

  }


  const plan =
    Object.values(PLANS)
      .find(
        item =>
          item.code ===
          planCode
      )


  if (!plan) {

    throw new Error(
      "Invalid pending plan"
    )

  }


  const now =
    new Date()


  const renewalDate =
    new Date(now)


  if (
    billingCycle ===
    "ANNUAL"
  ) {

    renewalDate.setFullYear(
      renewalDate.getFullYear() + 1
    )

  } else {

    renewalDate.setMonth(
      renewalDate.getMonth() + 1
    )

  }


  /*
   * IMPORTANT:
   *
   * Do NOT reset boosterJobs.
   *
   * A plan upgrade must preserve purchased booster
   * jobs that are still available.
   */

  const currentBoosterJobs =
    Number(
      subscription.boosterJobs || 0
    )


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
          planCode = :planCode,
          planName = :planName,
          billingCycle = :billingCycle,
          #status = :status,
          jobsUsed = :jobsUsed,
          jobLimit = :jobLimit,
          boosterJobs = :boosterJobs,
          renewalDate = :renewalDate,
          paymentStatus = :paymentStatus,
          razorpayOrderId = :razorpayOrderId,
          razorpayPaymentId = :razorpayPaymentId,
          updatedAt = :updatedAt
        REMOVE
          pendingOrderId,
          pendingPlanCode,
          pendingBillingCycle,
          pendingAmount
        `,

      ExpressionAttributeNames: {
        "#status": "status"
      },

      ExpressionAttributeValues: {

        ":planCode": {
          S: plan.code
        },

        ":planName": {
          S: plan.name
        },

        ":billingCycle": {
          S: billingCycle
        },

        ":status": {
          S: "ACTIVE"
        },

        ":jobsUsed": {
          N: String(
            Number(
              subscription.jobsUsed || 0
            )
          )
        },

        ":jobLimit": {
          N:
            plan.jobsPerMonth.toString()
        },

        ":boosterJobs": {
          N:
            currentBoosterJobs.toString()
        },

        ":renewalDate": {
          S:
            renewalDate.toISOString()
        },

        ":paymentStatus": {
          S: "CAPTURED"
        },

        ":razorpayOrderId": {
          S: orderId
        },

        ":razorpayPaymentId": {
          S: paymentId
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
| VERIFY PLAN PAYMENT
|--------------------------------------------------------------------------
*/

export const verifyPlanPayment =
async (
  garageId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) => {

  const subscription =
    await getOrCreateSubscription(
      garageId
    )


  if (
    subscription.pendingOrderId !==
    razorpayOrderId
  ) {

    throw new Error(
      "Invalid Razorpay order"
    )

  }


  const valid =
    verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    )


  if (!valid) {

    throw new Error(
      "Invalid payment signature"
    )

  }


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

export const createBoosterPaymentOrder =
async (
  garageId: string,
  boosterCode: string
) => {

  const normalizedCode =
    String(
      boosterCode || ""
    )
      .trim()
      .toUpperCase()


  const booster =
    Object.values(BOOSTERS)
      .find(
        item =>
          item.code ===
          normalizedCode
      )


  if (!booster) {

    throw new Error(
      "Invalid booster"
    )

  }


  const receipt =
    `booster_${boosterCode}_${Date.now()}`


  console.log("receipt =>", receipt);
  const order =
    await createRazorpayOrder(

      booster.price,

      receipt,

      {

        garageId,

        paymentType:
          "BOOSTER",

        boosterCode:
          booster.code

      }

    )


  const now =
    new Date()


  const subscription =
    await getOrCreateSubscription(
      garageId
    )


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
          pendingOrderId = :orderId,
          pendingPaymentType = :paymentType,
          pendingBoosterCode = :boosterCode,
          pendingAmount = :amount,
          paymentStatus = :paymentStatus,
          updatedAt = :updatedAt
        `,

      ExpressionAttributeValues: {

        ":orderId": {
          S: order.id
        },

        ":paymentType": {
          S: "BOOSTER"
        },

        ":boosterCode": {
          S: booster.code
        },

        ":amount": {
          N:
            booster.price.toString()
        },

        ":paymentStatus": {
          S: "CREATED"
        },

        ":updatedAt": {
          S:
            now.toISOString()
        }

      }

    })
  )


  return {

    paymentRequired: true,

    payment: {

      orderId:
        order.id,

      amount:
        order.amount,

      currency:
        order.currency,

      keyId:
        process.env.RAZORPAY_KEY_ID,

      boosterCode:
        booster.code,

      jobs:
        booster.jobs

    }

  }

}


/*
|--------------------------------------------------------------------------
| VERIFY BOOSTER PAYMENT
|--------------------------------------------------------------------------
*/

export const verifyBoosterPayment =
async (
  garageId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) => {

  const subscription =
    await getOrCreateSubscription(
      garageId
    )


  if (
    subscription.pendingOrderId !==
    razorpayOrderId
  ) {

    throw new Error(
      "Invalid Razorpay order"
    )

  }


  if (
    subscription.pendingPaymentType !==
    "BOOSTER"
  ) {

    throw new Error(
      "Pending payment is not a booster payment"
    )

  }


  const valid =
    verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    )


  if (!valid) {

    throw new Error(
      "Invalid payment signature"
    )

  }


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

const activateBooster =
async (
  garageId: string,
  orderId: string,
  paymentId: string
) => {

  const subscription =
    await getOrCreateSubscription(
      garageId
    )


  if (
    subscription.lastBoosterPaymentId ===
    paymentId
  ) {

    return subscription

  }


  if (
    subscription.pendingOrderId !==
    orderId
  ) {

    throw new Error(
      "Booster order does not match pending order"
    )

  }


  if (
    subscription.pendingPaymentType !==
    "BOOSTER"
  ) {

    throw new Error(
      "Pending order is not a booster"
    )

  }


  const boosterCode =
    subscription.pendingBoosterCode


  const booster =
    Object.values(BOOSTERS)
      .find(
        item =>
          item.code ===
          boosterCode
      )


  if (!booster) {

    throw new Error(
      "Invalid pending booster"
    )

  }


  const currentBoosterJobs =
    Number(
      subscription.boosterJobs || 0
    )


  const newBoosterJobs =
    currentBoosterJobs +
    booster.jobs


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
        `
        SET
          boosterJobs = :boosterJobs,
          lastBoosterCode = :boosterCode,
          lastBoosterPaymentId = :paymentId,
          lastBoosterOrderId = :orderId,
          lastBoosterJobs = :jobs,
          lastBoosterPurchasedAt = :purchasedAt,
          paymentStatus = :paymentStatus,
          updatedAt = :updatedAt
        REMOVE
          pendingOrderId,
          pendingPaymentType,
          pendingBoosterCode,
          pendingAmount
        `,

      ExpressionAttributeValues: {

        ":boosterJobs": {
          N:
            newBoosterJobs.toString()
        },

        ":boosterCode": {
          S:
            booster.code
        },

        ":paymentId": {
          S:
            paymentId
        },

        ":orderId": {
          S:
            orderId
        },

        ":jobs": {
          N:
            booster.jobs.toString()
        },

        ":purchasedAt": {
          S:
            now.toISOString()
        },

        ":paymentStatus": {
          S:
            "CAPTURED"
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

export const processRazorpayPaymentCaptured =
async (
  garageId: string,
  orderId: string,
  paymentId: string,
  amountInPaise: number
) => {

  const subscription =
    await getOrCreateSubscription(
      garageId
    )


  /*
   * Already processed.
   */

  if (
    subscription.razorpayPaymentId ===
    paymentId ||
    subscription.lastBoosterPaymentId ===
    paymentId
  ) {

    return subscription

  }


  if (
    subscription.pendingOrderId !==
    orderId
  ) {

    throw new Error(
      "Webhook order does not match pending payment"
    )

  }


  const expectedAmountInPaise =
    Math.round(
      Number(
        subscription.pendingAmount
      ) * 100
    )


  if (
    expectedAmountInPaise !==
    amountInPaise
  ) {

    throw new Error(
      "Webhook payment amount does not match pending order"
    )

  }


  if (
    subscription.pendingPaymentType ===
    "BOOSTER"
  ) {

    return activateBooster(
      garageId,
      orderId,
      paymentId
    )

  }


  /*
   * Default is PLAN.
   */

  return activatePlan(
    garageId,
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


export const processRazorpayPaymentFailed =
async (
  garageId: string,
  payment: RazorpayPaymentEntity
) => {

  const subscription =
    await getOrCreateSubscription(
      garageId
    )


  const now =
    new Date()


  const paymentId =
    payment.id ||
    "unknown"


  const orderId =
    payment.order_id ||
    "unknown"


  const errorCode =
    payment.error_code ||
    "UNKNOWN"


  const errorDescription =
    payment.error_description ||
    "Payment failed"


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
          lastPaymentId = :paymentId,
          lastPaymentOrderId = :orderId,
          lastPaymentStatus = :status,
          lastPaymentErrorCode = :errorCode,
          lastPaymentErrorDescription = :errorDescription,
          updatedAt = :updatedAt
        `,

      ExpressionAttributeValues: {

        ":paymentId": {
          S: paymentId
        },

        ":orderId": {
          S: orderId
        },

        ":status": {
          S: "FAILED"
        },

        ":errorCode": {
          S: errorCode
        },

        ":errorDescription": {
          S: errorDescription
        },

        ":updatedAt": {
          S: now.toISOString()
        }

      }

    })
  )


  return getSubscription(
    garageId
  )

}