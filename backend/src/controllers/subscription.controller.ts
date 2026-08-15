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
| TEMPORARY GARAGE ID
|--------------------------------------------------------------------------
|
| Later replace this with:
|
| req.user.garageId
|
*/

const garageId =
  "garage-1"


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

    const data =
      await subscriptionService
        .getPlanInformation(
          garageId
        )

    res.json(
      data
    )

  } catch (error) {

    console.error(
      "Get plan usage error:",
      error
    )

    res.status(500).json({
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

    const {
      boosterCode
    } = req.body

    const data =
      await subscriptionService
        .addBooster(
          garageId,
          boosterCode
        )

    res.json(
      data
    )

  } catch (error) {

    console.error(
      "Buy booster error:",
      error
    )

    res.status(400).json({

      message:
        error instanceof Error
          ? error.message
          : "Unable to add booster"

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

    const {
      planCode,
      billingCycle
    } = req.body


    const data =
      await subscriptionService
        .createPlanPaymentOrder(

          garageId,

          planCode,

          billingCycle

        )


    res.json(
      data
    )

  } catch (error) {

    console.error(
      "Create payment order error:",
      error
    )


    res.status(400).json({

      message:
        error instanceof Error
          ? error.message
          : "Unable to create payment order"

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

        message:
          "Missing payment verification details"

      })

    }


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


    return res.status(400).json({

      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Payment verification failed"

    })

  }

}

/*
|--------------------------------------------------------------------------
| RAZORPAY WEBHOOK
|--------------------------------------------------------------------------
|
| TEST MODE ONLY
|
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

        message:
          "Webhook raw body is required"

      })

    }


    const rawBody =
      req.body.toString(
        "utf8"
      )


    const signature =
      req.headers[
        "x-razorpay-signature"
      ] as string


    if (!signature) {

      return res.status(400).json({

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

        message:
          "Invalid webhook signature"

      })

    }


    /*
     * ---------------------------------------------------------------
     * PARSE ONLY AFTER SIGNATURE VERIFICATION
     * ---------------------------------------------------------------
     */

    const event =
      JSON.parse(
        rawBody
      )


    console.log(
      "Razorpay webhook received:",
      event.event
    )


    /*
     * ---------------------------------------------------------------
     * RAZORPAY EVENT ID
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
        !amount
      ) {

        return res.status(400).json({

          message:
            "Incomplete payment payload"

        })

      }


      /*
       * -------------------------------------------------------------
       * TEMPORARY GARAGE ID
       * -------------------------------------------------------------
       *
       * Later:
       *
       * const garageId = ...
       *
       * from your payment/order metadata.
       *
       */

      const garageId =
        "garage-1"


      await subscriptionService
        .processRazorpayPaymentCaptured(

          garageId,

          orderId,

          paymentId,

          amount

        )


      return res.status(200).json({

        success:
          true,

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

          message:
            "Incomplete payment.failed payload"

        })

      }


      const garageId =
        "garage-1"


      await subscriptionService
        .processRazorpayPaymentFailed(
          garageId,
          payment
        )


      return res.status(200).json({

        success:
          true,

        message:
          "Payment failed webhook processed",

        eventId

      })

    }


    /*
     * ---------------------------------------------------------------
     * OTHER EVENTS
     * ---------------------------------------------------------------
     *
     * During development we simply acknowledge them.
     *
     */

    console.log(
      "Razorpay event ignored:",
      event.event
    )


    return res.status(200).json({

      success:
        true,

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

      success:
        false,

      message:
        "Webhook processing failed"

    })

  }

}