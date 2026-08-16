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
| AUTHENTICATED GARAGE ID
|--------------------------------------------------------------------------
|
| Normal subscription APIs use the garageId stored inside
| the authenticated user's JWT.
|
| Example JWT payload:
|
| {
|   garageId: "550e8400-e29b-41d4-a716-446655440000",
|   role: "owner"
| }
|
| verifyToken middleware must run before these controllers.
|
*/

const getAuthenticatedGarageId = (
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
| GET PLAN & USAGE
|--------------------------------------------------------------------------
*/

export const getPlanUsage =
async (
  req: Request,
  res: Response
) => {

  try {

    const garageId =
      getAuthenticatedGarageId(
        req
      )


    console.log(
      "GET PLAN USAGE",
      {
        garageId
      }
    )


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
      message ===
      "Authentication required" ||
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
| BUY BOOSTER
|--------------------------------------------------------------------------
*/

export const buyBooster =
async (
  req: Request,
  res: Response
) => {

  try {

    const garageId =
      getAuthenticatedGarageId(
        req
      )


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


    console.log(
      "BUY BOOSTER",
      {
        garageId,
        boosterCode
      }
    )


    const data =
      await subscriptionService
        .addBooster(
          garageId,
          boosterCode
        )


    return res.json({

      success: true,

      subscription:
        data

    })

  } catch (error) {

    console.error(
      "Buy booster error:",
      error
    )


    const message =
      error instanceof Error
        ? error.message
        : "Unable to add booster"


    if (
      message ===
      "Authentication required" ||
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
| CREATE PAYMENT ORDER
|--------------------------------------------------------------------------
*/

export const createPaymentOrder =
async (
  req: Request,
  res: Response
) => {

  try {

    const garageId =
      getAuthenticatedGarageId(
        req
      )


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


    console.log(
      "CREATE SUBSCRIPTION PAYMENT ORDER",
      {
        garageId,
        planCode,
        billingCycle
      }
    )

    console.log("CREATE PAYMENT ORDER REQUEST", {
      user: (req as any).user,
      garageId,
      planCode,
      billingCycle
    })


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
      message ===
      "Authentication required" ||
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
| VERIFY PAYMENT
|--------------------------------------------------------------------------
*/

export const verifyPayment =
async (
  req: Request,
  res: Response
) => {

  try {

    const garageId =
      getAuthenticatedGarageId(
        req
      )


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


    console.log(
      "VERIFY SUBSCRIPTION PAYMENT",
      {
        garageId,

        razorpayOrderId:
          razorpay_order_id,

        razorpayPaymentId:
          razorpay_payment_id
      }
    )


    const data =
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

      subscription:
        data

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


    if (
      message ===
      "Authentication required" ||
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
| RAZORPAY WEBHOOK
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Razorpay webhook requests do NOT contain your JWT.
|
| Therefore:
|
|     req.user.garageId ❌
|
| The garageId must instead come from payment/order
| metadata created when the Razorpay order was created.
|
|--------------------------------------------------------------------------
*/

export const razorpayWebhook =
async (
  req: Request,
  res: Response
) => {

  try {

    /*
     * ---------------------------------------------------------------
     * TEST MODE GUARD
     * ---------------------------------------------------------------
     */

    if (
      process.env.RAZORPAY_MODE !==
      "TEST"
    ) {

      return res.status(403).json({

        success: false,

        message:
          "Razorpay webhook is disabled outside TEST mode"

      })

    }


    /*
     * ---------------------------------------------------------------
     * RAW BODY
     * ---------------------------------------------------------------
     */

    if (
      !Buffer.isBuffer(
        req.body
      )
    ) {

      console.error(
        "Razorpay webhook body is not raw"
      )


      return res.status(400).json({

        success: false,

        message:
          "Webhook raw body is required"

      })

    }


    const rawBody =
      req.body.toString(
        "utf8"
      )


    /*
     * ---------------------------------------------------------------
     * WEBHOOK SIGNATURE
     * ---------------------------------------------------------------
     */

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


    /*
     * ---------------------------------------------------------------
     * VERIFY SIGNATURE
     * ---------------------------------------------------------------
     */

    const valid =
      verifyWebhookSignature(
        rawBody,
        signature
      )


    if (!valid) {

      console.error(
        "Invalid Razorpay webhook signature"
      )


      return res.status(400).json({

        success: false,

        message:
          "Invalid webhook signature"

      })

    }


    /*
     * ---------------------------------------------------------------
     * PARSE AFTER SIGNATURE VERIFICATION
     * ---------------------------------------------------------------
     */

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


    console.log(
      "Razorpay webhook received:",
      event.event
    )


    /*
     * ---------------------------------------------------------------
     * EVENT ID
     * ---------------------------------------------------------------
     */

    const eventId =
      req.headers[
        "x-razorpay-event-id"
      ] as string


    console.log(
      "Razorpay event ID:",
      eventId
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
            "Invalid payment.captured payload"

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


      if (
        !orderId ||
        !paymentId ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Incomplete payment payload"

        })

      }


      /*
       * -------------------------------------------------------------
       * REAL GARAGE ID
       * -------------------------------------------------------------
       *
       * createPlanPaymentOrder() creates the Razorpay order
       * with notes containing:
       *
       * garageId
       * planCode
       * billingCycle
       *
       * Razorpay normally makes these notes available on the
       * payment entity.
       *
       */

      const garageId =
        payment?.notes?.garageId


      if (
        !garageId ||
        typeof garageId !== "string"
      ) {

        console.error(
          "Captured payment has no garageId",
          {
            orderId,
            paymentId,
            notes:
              payment?.notes
          }
        )


        /*
         * Do not write a payment against an unknown garage.
         */

        return res.status(400).json({

          success: false,

          message:
            "Payment does not contain garage information"

        })

      }


      console.log(
        "Processing captured payment:",
        {
          garageId,
          orderId,
          paymentId,
          amount
        }
      )


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
          "Payment captured webhook processed",

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

        return res.status(400).json({

          success: false,

          message:
            "Invalid payment.failed payload"

        })

      }


      const orderId =
        payment.order_id


      const paymentId =
        payment.id


      if (
        !orderId ||
        !paymentId
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Incomplete payment.failed payload"

        })

      }


      const garageId =
        payment?.notes?.garageId


      if (
        !garageId ||
        typeof garageId !== "string"
      ) {

        console.error(
          "Failed payment has no garageId",
          {
            orderId,
            paymentId,
            notes:
              payment?.notes
          }
        )


        /*
         * Acknowledge the webhook.
         *
         * Never write a failed payment against
         * an unknown garage.
         */

        return res.status(200).json({

          success: true,

          message:
            "Payment failed webhook acknowledged; garage information unavailable",

          eventId

        })

      }


      console.log(
        "Processing failed payment:",
        {
          garageId,
          orderId,
          paymentId
        }
      )


      await subscriptionService
        .processRazorpayPaymentFailed(

          garageId,

          payment

        )


      return res.status(200).json({

        success: true,

        message:
          "Payment failed webhook processed",

        eventId

      })

    }


    /*
     * ---------------------------------------------------------------
     * OTHER EVENTS
     * ---------------------------------------------------------------
     */

    console.log(
      "Razorpay event ignored:",
      event.event
    )


    return res.status(200).json({

      success: true,

      message:
        "Webhook received",

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