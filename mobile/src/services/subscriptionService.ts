import api from "./api"

export type BillingCycle =
  | "monthly"
  | "annual"

export type BillingCycleApi =
  | "MONTHLY"
  | "ANNUAL"

export type SubscriptionRecord = {
  garageId?: string
  planName?: string
  planCode?: string
  boosterJobs?: number
  renewalDate?: string
  createdAt?: string
  jobLimit?: number | string
  billingCycle?: string
  razorpayPaymentId?: string
  jobsUsed?: number
  paymentStatus?: string
  razorpayOrderId?: string
  status?: string
  updatedAt?: string
}

export type PlanDefinition = {
  code: string
  name: string
  monthlyPrice: number
  annualPricePerMonth: number
  jobsPerMonth: number
  workers: number
  inventory: string
  invoicing: boolean
  reports: string
  backup: string
  prioritySupport: boolean
}

export type BoosterDefinition = {
  code: string
  jobs: number
  price: number
}

export type PlanUsageApiResponse = {
  subscription?: SubscriptionRecord | null
  plan?: PlanDefinition | null
  usage?: {
    jobsUsed?: number
    jobLimit?: number | string
    boosterJobs?: number
    totalJobsAvailable?: number
    jobsRemaining?: number
    usagePercentage?: number
  } | null
  availablePlans?: PlanDefinition[]
  availableBoosters?: BoosterDefinition[]
}

export type PlanUsageResponse = {
  garageId?: string
  planName?: string
  planCode?: string
  billingCycle?: string
  jobsUsed?: number
  jobsLimit?: number | string
  boosterJobs?: number
  totalJobsAvailable?: number
  jobsRemaining?: number | string
  usagePercentage?: number
  renewalDate?: string
  daysRemaining?: number
  availablePlans?: PlanDefinition[]
  availableBoosters?: BoosterDefinition[]
}

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

export type SubscriptionServiceError = {
  message: string
  status?: number
  data?: unknown
}

const toApiBillingCycle = (
  billingCycle: BillingCycle
): BillingCycleApi =>
  billingCycle === "monthly" ? "MONTHLY" : "ANNUAL"

const normalizeError = (error: any): SubscriptionServiceError => {
  const status = error?.response?.status
  const responseData = error?.response?.data
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
 * The backend returns a nested subscription object:
 *
 * {
 *   subscription: { ... },
 *   plan: { ... },
 *   usage: { ... },
 *   availablePlans: [...],
 *   availableBoosters: [...]
 * }
 *
 * The screen consumes a flat PlanUsageResponse. Normalize it here so
 * every screen gets one stable shape and never reads undefined fields.
 */
const normalizePlanUsage = (
  payload: PlanUsageApiResponse
): PlanUsageResponse => {
  const subscription = payload?.subscription ?? undefined
  const usage = payload?.usage ?? undefined

  const jobLimit =
    usage?.jobLimit ??
    subscription?.jobLimit

  const jobsUsed =
    usage?.jobsUsed ??
    subscription?.jobsUsed

  return {
    garageId: subscription?.garageId,
    planName:
      subscription?.planName ??
      payload?.plan?.name,
    planCode:
      subscription?.planCode ??
      payload?.plan?.code,
    billingCycle:
      subscription?.billingCycle,
    jobsUsed,
    jobsLimit: jobLimit,
    boosterJobs:
      usage?.boosterJobs ??
      subscription?.boosterJobs,
    totalJobsAvailable: usage?.totalJobsAvailable,
    jobsRemaining: usage?.jobsRemaining,
    usagePercentage: usage?.usagePercentage,
    renewalDate: subscription?.renewalDate,
    availablePlans: payload?.availablePlans ?? [],
    availableBoosters: payload?.availableBoosters ?? []
  }
}

/*
 * IMPORTANT:
 *
 * We intentionally do NOT hardcode a garage id anywhere in this service.
 * The real garageId comes from the authenticated subscription GET response.
 * After GET succeeds, currentGarageId is used for endpoints that require it.
 *
 * The backend should still validate this id against the authenticated user.
 */
let currentGarageId: string | undefined

export const getCurrentGarageId = (): string | undefined =>
  currentGarageId

export const getPlanUsage = async (): Promise<PlanUsageResponse> => {
  try {
    const response =
      await api.get<PlanUsageApiResponse>(
        "/api/subscription"
      )

    const normalized = normalizePlanUsage(
      response.data
    )

    currentGarageId = normalized.garageId

    if (!currentGarageId) {
      console.warn(
        "Subscription response did not contain a garageId."
      )
    }

    return normalized
  }
  catch (error) {
    console.log(
      "getPlanUsage failed:",
      error
    )

    throw normalizeError(error)
  }
}

const requireGarageId = (): string => {
  if (!currentGarageId) {
    throw {
      message:
        "Garage information is not available yet. Please reload the subscription and try again."
    } satisfies SubscriptionServiceError
  }

  return currentGarageId
}

export const createSubscriptionPaymentOrder =
async (
  planCode: string,
  billingCycle: BillingCycle
): Promise<RazorpayOrderPayload> => {
  try {
    const garageId = requireGarageId()

    const response =
      await api.post<RazorpayOrderPayload>(
        "/api/subscription/payment/order",
        {
          garageId,
          planCode: planCode.toUpperCase(),
          billingCycle:
            toApiBillingCycle(billingCycle)
        }
      )

    return response.data
  }
  catch (error) {
    console.log(
      "createSubscriptionPaymentOrder failed:",
      error
    )

    throw normalizeError(error)
  }
}

export const changePlan =
async (
  planCode: string,
  billingCycle: BillingCycle
): Promise<ChangePlanResponse> => {
  try {
    const garageId = requireGarageId()

    const response =
      await api.post<ChangePlanResponse>(
        "/api/subscription/payment/order",
        {
          garageId,
          planCode: planCode.toUpperCase(),
          billingCycle:
            toApiBillingCycle(billingCycle)
        }
      )

    return response.data
  }
  catch (error) {
    console.log(
      "changePlan failed:",
      error
    )

    throw normalizeError(error)
  }
}

export const buyBooster =
async (
  boosterCode: string
): Promise<BoosterResponse> => {
  try {
    const garageId = requireGarageId()

    const response =
      await api.post<BoosterResponse>(
        "/api/subscription/booster",
        {
          garageId,
          boosterCode: boosterCode.toUpperCase()
        }
      )

    return response.data
  }
  catch (error) {
    console.log(
      "buyBooster failed:",
      error
    )

    throw normalizeError(error)
  }
}

export type VerifyPaymentRequest = {
  razorpayPaymentId: string
  razorpayOrderId: string
  razorpaySignature: string
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
  garageId?: string
  subscription?: SubscriptionRecord
}

export const verifySubscriptionPayment =
async (
  payload: VerifyPaymentRequest
): Promise<VerifyPaymentResponse> => {
  try {
    const response =
      await api.post<VerifyPaymentResponse>(
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

    const data = response.data

    // Some backend versions return the updated subscription nested under
    // `subscription`. Keep the verification result convenient for the UI.
    if (data?.subscription) {
      currentGarageId =
        data.subscription.garageId ??
        currentGarageId
    }

    return {
      ...data,
      garageId:
        data?.garageId ??
        data?.subscription?.garageId,
      planCode:
        data?.planCode ??
        data?.subscription?.planCode,
      planName:
        data?.planName ??
        data?.subscription?.planName,
      billingCycle:
        data?.billingCycle ??
        data?.subscription?.billingCycle,
      paymentStatus:
        data?.paymentStatus ??
        data?.subscription?.paymentStatus
    }
  }
  catch (error) {
    console.log(
      "verifySubscriptionPayment failed:",
      error
    )

    throw normalizeError(error)
  }
}