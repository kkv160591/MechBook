import {
  Request,
  Response
} from "express"

import * as subscriptionService
from "../services/subscription.service"

import {
  verifyWebhookSignature
} from "../services/razorpay.service"


/*
|--------------------------------------------------------------------------
| AUTHENTICATED GARAGE
|--------------------------------------------------------------------------
*/

const getAuthenticatedGarageId =
(
  req: Request
): string => {

  const user =
    (req as any)?.user


  if (!user) {

    throw new Error(
      "Authentication required"
    )

  }


  const garageId =
    user.garageId


  if (
    !garageId ||
    typeof garageId !== "string"
  ) {

    throw new Error(
      "Authenticated user is not associated with a garage"
    )

  }


  return garageId

}


/*
|--------------------------------------------------------------------------
| GET PLAN USAGE
|--------------------------------------------------------------------------
*/

export const getPlanUsage =
async (
  req: Request,
  res: Response
) => {

  try {

    const garageId =
      getAuthenticatedGarageId(req)


    const data =
      await subscriptionService
        .getPlanInformation(
          garageId
        )


    return res.json(
      data
    )

  } catch (error) {

    console.error(
      "Get plan usage error:",
      error
    )


    const message =
      error instanceof Error
        ? error.message
        : "Unable to load subscription"


    if (
      message === "Authentication required" ||
      message ===
        "Authenticated user is not associated with a garage"
    ) {

      return res.status(401).json({
        success: false,
        message
      })

    }


    return res.status(500).json({

      success: false,

      message:
        "Unable to load subscription"

    })

  }

}


/*
|--------------------------------------------------------------------------
| CREATE PLAN PAYMENT ORDER
|--------------------------------------------------------------------------
*/

export const createPaymentOrder =
async (
  req: Request,
  res: Response
) => {

  try {

    const garageId =
      getAuthenticatedGarageId(req)


    const planCode =
      String(
        req.body?.planCode || ""
      )
        .trim()
        .toUpperCase()


    const billingCycle =
      String(
        req.body?.billingCycle || ""
      )
        .trim()
        .toUpperCase()


    if (
      !planCode ||
      !billingCycle
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Plan code and billing cycle are required"

      })

    }


    const data =
      await subscriptionService
        .createPlanPaymentOrder(

          garageId,

          planCode,

          billingCycle as
            "MONTHLY" |
            "ANNUAL"

        )


    return res.json(
      data
    )

  } catch (error) {

    console.error(
      "Create payment order error:",
      error
    )


    const message =
      error instanceof Error
        ? error.message
        : "Unable to create payment order"


    if (
      message === "Authentication required" ||
      message ===
        "Authenticated user is not associated with a garage"
    ) {

      return res.status(401).json({
        success: false,
        message
      })

    }


    return res.status(400).json({
      success: false,
      message
    })

  }

}


/*
|--------------------------------------------------------------------------
| VERIFY PLAN PAYMENT
|--------------------------------------------------------------------------
*/

export const verifyPayment =
async (
  req: Request,
  res: Response
) => {

  try {

    const garageId =
      getAuthenticatedGarageId(req)


    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body


    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Missing payment verification details"

      })

    }


    const subscription =
      await subscriptionService
        .verifyPlanPayment(

          garageId,

          razorpay_order_id,

          razorpay_payment_id,

          razorpay_signature

        )


    return res.json({

      success: true,

      message:
        "Payment verified successfully",

      subscription

    })

  } catch (error) {

    console.error(
      "Verify payment error:",
      error
    )


    const message =
      error instanceof Error
        ? error.message
        : "Payment verification failed"


    return res.status(400).json({

      success: false,

      message

    })

  }

}


/*
|--------------------------------------------------------------------------
| CREATE BOOSTER PAYMENT ORDER
|--------------------------------------------------------------------------
*/

export const createBoosterOrder =
async (
  req: Request,
  res: Response
) => {

  try {

    const garageId =
      getAuthenticatedGarageId(req)


    const boosterCode =
      String(
        req.body?.boosterCode || ""
      )
        .trim()
        .toUpperCase()


    if (!boosterCode) {

      return res.status(400).json({

        success: false,

        message:
          "Booster code is required"

      })

    }


    const data =
      await subscriptionService
        .createBoosterPaymentOrder(

          garageId,

          boosterCode

        )


    return res.json(
      data
    )

  } catch (error) {

    console.error(
      "Create booster order error:",
      error
    )


    const message =
      error instanceof Error
        ? error.message
        : "Unable to create booster order"


    return res.status(400).json({

      success: false,

      message

    })

  }

}


/*
|--------------------------------------------------------------------------
| VERIFY BOOSTER PAYMENT
|--------------------------------------------------------------------------
*/

export const verifyBoosterPayment =
async (
  req: Request,
  res: Response
) => {

  try {

    const garageId =
      getAuthenticatedGarageId(req)


    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body


    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Missing booster payment verification details"

      })

    }


    const subscription =
      await subscriptionService
        .verifyBoosterPayment(

          garageId,

          razorpay_order_id,

          razorpay_payment_id,

          razorpay_signature

        )


    return res.json({

      success: true,

      message:
        "Booster payment verified successfully",

      subscription

    })

  } catch (error) {

    console.error(
      "Verify booster payment error:",
      error
    )


    const message =
      error instanceof Error
        ? error.message
        : "Booster payment verification failed"


    return res.status(400).json({

      success: false,

      message

    })

  }

}


/*
|--------------------------------------------------------------------------
| RAZORPAY WEBHOOK
|--------------------------------------------------------------------------
*/

export const razorpayWebhook =
async (
  req: Request,
  res: Response
) => {

  try {

    /*
     * IMPORTANT:
     *
     * Do not disable this in production.
     *
     * Signature verification is the security mechanism.
     */

    if (
      !Buffer.isBuffer(req.body)
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Webhook raw body is required"

      })

    }


    const rawBody =
      req.body.toString("utf8")


    const signature =
      req.headers[
        "x-razorpay-signature"
      ] as string


    if (!signature) {

      return res.status(400).json({

        success: false,

        message:
          "Missing Razorpay webhook signature"

      })

    }


    const valid =
      verifyWebhookSignature(
        rawBody,
        signature
      )


    if (!valid) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid webhook signature"

      })

    }


    let event: any

    try {

      event =
        JSON.parse(
          rawBody
        )

    } catch {

      return res.status(400).json({

        success: false,

        message:
          "Invalid webhook JSON"

      })

    }


    const eventId =
      req.headers[
        "x-razorpay-event-id"
      ] as string


    console.log(
      "Razorpay webhook:",
      {
        event:
          event.event,

        eventId

      }
    )


    /*
     * ---------------------------------------------------------------
     * PAYMENT CAPTURED
     * ---------------------------------------------------------------
     */

    if (
      event.event ===
      "payment.captured"
    ) {

      const payment =
        event
          ?.payload
          ?.payment
          ?.entity


      if (!payment) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid payment payload"

        })

      }


      const orderId =
        payment.order_id


      const paymentId =
        payment.id


      const amount =
        Number(
          payment.amount
        )


      /*
       * IMPORTANT:
       *
       * Do not rely only on payment.notes.
       *
       * Your payment belongs to the Razorpay order.
       * Your application already stored the pending order.
       *
       * We use the order metadata when available,
       * but payment processing still validates the
       * pending order/amount server-side.
       */

      const garageId =
        payment?.notes?.garageId


      if (
        !garageId ||
        typeof garageId !== "string"
      ) {

        console.error(
          "Webhook payment missing garageId",
          {
            orderId,
            paymentId
          }
        )


        return res.status(200).json({

          success: true,

          message:
            "Webhook acknowledged"

        })

      }


      await subscriptionService
        .processRazorpayPaymentCaptured(

          garageId,

          orderId,

          paymentId,

          amount

        )


      return res.status(200).json({

        success: true,

        message:
          "Payment captured",

        eventId

      })

    }


    /*
     * ---------------------------------------------------------------
     * PAYMENT FAILED
     * ---------------------------------------------------------------
     */

    if (
      event.event ===
      "payment.failed"
    ) {

      const payment =
        event
          ?.payload
          ?.payment
          ?.entity


      if (!payment) {

        return res.status(200).json({
          success: true
        })

      }


      const garageId =
        payment?.notes?.garageId


      if (
        garageId &&
        typeof garageId === "string"
      ) {

        await subscriptionService
          .processRazorpayPaymentFailed(

            garageId,

            payment

          )

      }


      return res.status(200).json({

        success: true,

        message:
          "Payment failed acknowledged",

        eventId

      })

    }


    return res.status(200).json({

      success: true,

      message:
        "Webhook ignored",

      eventId

    })

  } catch (error) {

    console.error(
      "Razorpay webhook error:",
      error
    )


    return res.status(500).json({

      success: false,

      message:
        "Webhook processing failed"

    })

  }

}