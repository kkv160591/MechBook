import api from "./api"

/*
 * BILLING
 */

export type BillingCycle =
  | "monthly"
  | "annual"


export type BillingCycleApi =
  | "MONTHLY"
  | "ANNUAL"


/*
 * PLAN USAGE RESPONSE
 */

export type PlanUsageResponse = {

  planName?: string

  planCode?: string

  billingCycle?: string

  jobsUsed?: number

  jobsLimit?: number | string

  renewalDate?: string

  daysRemaining?: number

}


/*
 * CHANGE PLAN RESPONSE
 *
 * Keep this flexible for now because
 * backend/payment gateway response will
 * evolve later.
 */

export type RazorpayOrderPayload = {
  orderId: string
  amount: number
  currency: string
  keyId: string
  planCode?: string
  billingCycle?: BillingCycleApi
}

export type ChangePlanResponse = {
  success?: boolean
  message?: string

  planCode?: string
  planName?: string
  billingCycle?: string

  paymentRequired?: boolean
  paymentStatus?: string

  payment?: RazorpayOrderPayload

  [key: string]: unknown
}

export type BoosterResponse = {
  success?: boolean
  message?: string

  boosterCode?: string
  jobsAdded?: number

  paymentRequired?: boolean
  paymentStatus?: string

  payment?: RazorpayOrderPayload

  [key: string]: unknown
}


/*
 * API ERROR
 *
 * We don't expose Axios-specific
 * details to the screen.
 */

export type SubscriptionServiceError = {

  message: string

  status?: number

  data?: unknown

}


/*
 * CONVERT BILLING CYCLE
 */

const toApiBillingCycle = (
  billingCycle: BillingCycle
): BillingCycleApi => {

  return billingCycle === "monthly"
    ? "MONTHLY"
    : "ANNUAL"

}


/*
 * NORMALIZE SERVICE ERROR
 */

const normalizeError = (
  error: any
): SubscriptionServiceError => {

  const status =
    error?.response?.status

  const responseData =
    error?.response?.data

  const message =
    responseData?.message ||
    error?.message ||
    "Something went wrong."


  return {

    message,

    status,

    data: responseData

  }

}


/*
 * GET CURRENT PLAN / USAGE
 */

export const getPlanUsage =
async (): Promise<PlanUsageResponse> => {

  try {

    const response =
      await api.get(
        "/api/subscription"
      )

    return response.data

  }

  catch (error) {

    console.log(
      "getPlanUsage failed:",
      error
    )

    throw normalizeError(
      error
    )

  }

}

export const createSubscriptionPaymentOrder =
async (
  planCode: string,
  billingCycle: BillingCycle
): Promise<RazorpayOrderPayload> => {

  try {

    const response =
      await api.post(
        "/api/subscription/payment/order",
        {
          planCode:
            planCode.toUpperCase(),

          billingCycle:
            toApiBillingCycle(
              billingCycle
            )
        }
      )


    return response.data

  }

  catch (error) {

    console.log(
      "createSubscriptionPaymentOrder failed:",
      error
    )

    throw normalizeError(
      error
    )

  }

}


/*
 * CHANGE PLAN
 *
 * IMPORTANT:
 *
 * This endpoint currently changes the
 * subscription according to backend
 * behavior.
 *
 * Later, when Razorpay/payment gateway
 * is connected, this function can instead
 * return a payment/order payload.
 */

export const changePlan =
async (
  planCode: string,
  billingCycle: BillingCycle
): Promise<ChangePlanResponse> => {

  try {

    const response =
      await api.post(
        "/api/subscription/payment/order",
        {
          planCode,
          billingCycle:
            toApiBillingCycle(
              billingCycle
            )
        }
      )

    return response.data

  }

  catch (error) {

    console.log(
      "changePlan failed:",
      error
    )

    throw normalizeError(
      error
    )

  }

}


/*
 * BUY BOOSTER
 *
 * Later this can return a payment
 * order/payment-session payload.
 */

export const buyBooster =
async (
  boosterCode: string
): Promise<BoosterResponse> => {

  try {

    const response =
      await api.post(
        "/api/subscription/booster",
        {
          boosterCode
        }
      )

    return response.data

  }

  catch (error) {

    console.log(
      "buyBooster failed:",
      error
    )

    throw normalizeError(
      error
    )

  }

}

export type VerifyPaymentRequest = {

  razorpayPaymentId:
    string

  razorpayOrderId:
    string

  razorpaySignature:
    string

}

export type VerifyPaymentResponse = {
  success?: boolean
  message?: string
  paymentStatus?: string
  planCode?: string
  planName?: string
  billingCycle?: string
  boosterCode?: string
  jobsAdded?: number
}

export const verifySubscriptionPayment =
async (
  payload: VerifyPaymentRequest
): Promise<VerifyPaymentResponse> => {

  try {

    const response =
      await api.post(

        "/api/subscription/payment/verify",

        {

          razorpay_payment_id:
            payload.razorpayPaymentId,

          razorpay_order_id:
            payload.razorpayOrderId,

          razorpay_signature:
            payload.razorpaySignature

        }

      )


    return response.data

  }

  catch (error) {

    console.log(
      "verifySubscriptionPayment failed:",
      error
    )

    throw normalizeError(
      error
    )

  }

}