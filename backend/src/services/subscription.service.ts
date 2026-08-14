import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand
} from "@aws-sdk/client-dynamodb"

import {
  unmarshall,
} from "@aws-sdk/util-dynamodb"

import {
  db
} from "../config/dynamodb"

import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature
} from "./razorpay.service"

const TABLE =
  process.env.SUBSCRIPTIONS_TABLE_NAME || "Subscriptions"


/*
|--------------------------------------------------------------------------
| PLAN DEFINITIONS
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

}


/*
|--------------------------------------------------------------------------
| BOOSTER DEFINITIONS
|--------------------------------------------------------------------------
*/

export const BOOSTERS = {

  MINI: {
    code: "MINI",
    jobs: 20,
    price: 49
  },

  STANDARD: {
    code: "STANDARD",
    jobs: 50,
    price: 99
  },

  BIG: {
    code: "BIG",
    jobs: 150,
    price: 249
  }

}


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

  const freePlan =
    PLANS.FREE

  const item = {

    garageId: {
      S: garageId
    },

    planCode: {
      S: freePlan.code
    },

    planName: {
      S: freePlan.name
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
      N: freePlan.jobsPerMonth.toString()
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

      Item: item

    })
  )

  return unmarshall(item)

}


/*
|--------------------------------------------------------------------------
| GET OR CREATE SUBSCRIPTION
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

  return createDefaultSubscription(
    garageId
  )

}


/*
|--------------------------------------------------------------------------
| CHANGE PLAN
|--------------------------------------------------------------------------
*/

export const changePlan =
async (
  garageId: string,
  planCode: string,
  billingCycle: "MONTHLY" | "ANNUAL"
) => {

  const plan =
    Object.values(PLANS)
      .find(
        item =>
          item.code === planCode
      )

  if (!plan) {

    throw new Error(
      "Invalid plan"
    )

  }

  const now =
    new Date()

  const renewalDate =
    new Date(now)

  if (
    billingCycle === "ANNUAL"
  ) {

    renewalDate.setFullYear(
      renewalDate.getFullYear() + 1
    )

  } else {

    renewalDate.setMonth(
      renewalDate.getMonth() + 1
    )

  }

  const jobsUsed = 0

  const jobLimit =
    plan.jobsPerMonth

  const response =
    await db.send(
      new PutItemCommand({

        TableName: TABLE,

        Item: {

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
            S: billingCycle
          },

          status: {
            S: "ACTIVE"
          },

          jobsUsed: {
            N: jobsUsed.toString()
          },

          jobLimit: {
            N: jobLimit.toString()
          },

          boosterJobs: {
            N: "0"
          },

          renewalDate: {
            S: renewalDate.toISOString()
          },

          updatedAt: {
            S: now.toISOString()
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
*/

export const addBooster =
async (
  garageId: string,
  boosterCode: string
) => {

  const booster =
    Object.values(BOOSTERS)
      .find(
        item =>
          item.code === boosterCode
      )

  if (!booster) {

    throw new Error(
      "Invalid booster"
    )

  }

  const subscription =
    await getOrCreateSubscription(
      garageId
    )

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
        "SET boosterJobs = :boosterJobs, updatedAt = :updatedAt",

      ExpressionAttributeValues: {

        ":boosterJobs": {
          N: newBoosterJobs.toString()
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


/*
|--------------------------------------------------------------------------
| UPDATE JOB USAGE
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
          N: (
            jobsUsed + 1
          ).toString()
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


/*
|--------------------------------------------------------------------------
| GET PLAN INFORMATION
|--------------------------------------------------------------------------
*/

export const getPlanInformation =
async (
  garageId: string
) => {

  const subscription =
    await getOrCreateSubscription(
      garageId
    )

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

    plan,

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
| CREATE PLAN PAYMENT ORDER
|--------------------------------------------------------------------------
*/

export const createPlanPaymentOrder =
async (
  garageId: string,
  planCode: string,
  billingCycle: "MONTHLY" | "ANNUAL"
) => {

  const plan =
    Object.values(PLANS)
      .find(
        item =>
          item.code === planCode
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
    billingCycle === "MONTHLY"
      ? plan.monthlyPrice
      : plan.annualPricePerMonth * 12


  const receipt =
    `plan_${garageId}_${Date.now()}`


  const order =
    await createRazorpayOrder(

      amount,

      receipt,

      {

        garageId,

        planCode:

          plan.code,

        billingCycle

      }

    )


  const now =
    new Date()


  /*
   * Store pending payment information
   * in the existing subscription item.
   */

  await db.send(
    new UpdateItemCommand({

      TableName:
        TABLE,

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
          S: billingCycle
        },

        ":amount": {
          N: amount.toString()
        },

        ":paymentStatus": {
          S: "CREATED"
        },

        ":updatedAt": {
          S: now.toISOString()
        }

      }

    })
  )


  return {

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

    billingCycle

  }

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


  /*
   * Make sure the payment belongs
   * to the currently pending order.
   */

  const pendingPlanCode =
    subscription.pendingPlanCode

  const pendingBillingCycle =
    subscription.pendingBillingCycle


  if (!pendingPlanCode) {

    throw new Error(
      "No pending plan payment found"
    )

  }


  const plan =
    Object.values(PLANS)
      .find(
        item =>
          item.code ===
          pendingPlanCode
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
    pendingBillingCycle ===
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


  const jobLimit =
    plan.jobsPerMonth


  await db.send(
    new UpdateItemCommand({

      TableName:
        TABLE,

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
          status = :status,
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

      ExpressionAttributeValues: {

        ":planCode": {
          S: plan.code
        },

        ":planName": {
          S: plan.name
        },

        ":billingCycle": {
          S:
            pendingBillingCycle
        },

        ":status": {
          S: "ACTIVE"
        },

        ":jobsUsed": {
          N: "0"
        },

        ":jobLimit": {
          N:
            jobLimit.toString()
        },

        ":boosterJobs": {
          N: "0"
        },

        ":renewalDate": {
          S:
            renewalDate.toISOString()
        },

        ":paymentStatus": {
          S: "CAPTURED"
        },

        ":razorpayOrderId": {
          S:
            razorpayOrderId
        },

        ":razorpayPaymentId": {
          S:
            razorpayPaymentId
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
| PROCESS RAZORPAY PAYMENT CAPTURED WEBHOOK
|--------------------------------------------------------------------------
|
| TEST MODE
|
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
   * ---------------------------------------------------------------
   * IDEMPOTENCY
   * ---------------------------------------------------------------
   *
   * If this payment was already processed, do nothing.
   *
   */

  if (
    subscription.razorpayPaymentId ===
    paymentId
  ) {

    console.log(
      "Razorpay payment already processed:",
      paymentId
    )

    return subscription

  }


  /*
   * ---------------------------------------------------------------
   * CHECK PENDING ORDER
   * ---------------------------------------------------------------
   */

  if (
    subscription.pendingOrderId !==
    orderId
  ) {

    throw new Error(
      "Webhook order does not match pending subscription payment"
    )

  }


  /*
   * ---------------------------------------------------------------
   * CHECK AMOUNT
   * ---------------------------------------------------------------
   *
   * pendingAmount is stored in rupees.
   *
   * Razorpay webhook amount is in paise.
   *
   */

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
      "Webhook payment amount does not match subscription order"
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
      "Pending subscription payment information missing"
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


  /*
   * ---------------------------------------------------------------
   * CALCULATE RENEWAL
   * ---------------------------------------------------------------
   */

  const now =
    new Date()


  const renewalDate =
    new Date(
      now
    )


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
   * ---------------------------------------------------------------
   * UPDATE SUBSCRIPTION
   * ---------------------------------------------------------------
   */

  await db.send(
    new UpdateItemCommand({

      TableName:
        TABLE,

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
          status = :status,
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

      ExpressionAttributeValues: {

        ":planCode": {
          S:
            plan.code
        },

        ":planName": {
          S:
            plan.name
        },

        ":billingCycle": {
          S:
            billingCycle
        },

        ":status": {
          S:
            "ACTIVE"
        },

        ":jobsUsed": {
          N:
            "0"
        },

        ":jobLimit": {
          N:
            plan.jobsPerMonth.toString()
        },

        ":boosterJobs": {
          N:
            "0"
        },

        ":renewalDate": {
          S:
            renewalDate.toISOString()
        },

        ":paymentStatus": {
          S:
            "CAPTURED"
        },

        ":razorpayOrderId": {
          S:
            orderId
        },

        ":razorpayPaymentId": {
          S:
            paymentId
        },

        ":updatedAt": {
          S:
            now.toISOString()
        }

      }

    })
  )


  console.log(
    "Subscription activated from Razorpay webhook:",
    {
      garageId,
      orderId,
      paymentId,
      planCode,
      billingCycle
    }
  )


  return getSubscription(
    garageId
  )

}

/*
|--------------------------------------------------------------------------
| PROCESS RAZORPAY PAYMENT FAILED
|--------------------------------------------------------------------------
|
| TEST MODE ONLY
|
| Important:
| A failed payment should NOT change the user's subscription plan.
|
| Razorpay can send payment.failed and later payment.captured
| for the same payment attempt, especially with UPI retries.
|
| For now we only record the latest failed payment information
| inside the existing Subscriptions table.
|
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

      TableName:
        TABLE,

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