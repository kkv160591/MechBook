declare module "react-native-razorpay" {

  export type RazorpayPrefill = {
    name?: string
    email?: string
    contact?: string
  }

  export type RazorpayTheme = {
    color?: string
  }

  export type RazorpayCheckoutOptions = {
    key: string
    amount: number | string
    currency: string
    name: string
    description?: string
    image?: string
    order_id: string

    prefill?: RazorpayPrefill

    theme?: RazorpayTheme

    notes?: Record<string, string>

    timeout?: number

    retry?: {
      enabled?: boolean
      max_count?: number
    }
  }

  export type RazorpaySuccessResponse = {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }

  export type RazorpayErrorResponse = {
    code?: number
    description?: string
    reason?: string
    source?: string
    step?: string
  }

  const RazorpayCheckout: {
    open(
      options: RazorpayCheckoutOptions
    ): Promise<RazorpaySuccessResponse>
  }

  export default RazorpayCheckout
}