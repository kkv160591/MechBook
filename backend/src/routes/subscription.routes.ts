import {
  Router
} from "express"

import * as subscriptionController
from "../controllers/subscription.controller"


const router =
  Router()


/*
|--------------------------------------------------------------------------
| PLAN & USAGE
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  subscriptionController.getPlanUsage
)


/*
|--------------------------------------------------------------------------
| CREATE PAYMENT ORDER
|--------------------------------------------------------------------------
|
| TEST MODE ONLY
|
*/

router.post(
  "/payment/order",
  subscriptionController.createPaymentOrder
)


/*
|--------------------------------------------------------------------------
| VERIFY PAYMENT
|--------------------------------------------------------------------------
|
| TEST MODE ONLY
|
*/

router.post(
  "/payment/verify",
  subscriptionController.verifyPayment
)


/*
|--------------------------------------------------------------------------
| RAZORPAY WEBHOOK
|--------------------------------------------------------------------------
|
| TEST MODE ONLY
|
| IMPORTANT:
| The application must provide the RAW request body
| to this route.
|
*/

router.post(
  "/payment/webhook",
  subscriptionController.razorpayWebhook
)


/*
|--------------------------------------------------------------------------
| CHANGE PLAN
|--------------------------------------------------------------------------
|
| TEMPORARY DEVELOPMENT ENDPOINT
|
| Do NOT expose this endpoint to the frontend once
| Razorpay payment flow is enabled.
|
*/

router.post(
  "/change-plan",
  subscriptionController.changePlan
)


/*
|--------------------------------------------------------------------------
| BUY BOOSTER
|--------------------------------------------------------------------------
|
| TEMPORARY DEVELOPMENT ENDPOINT
|
| This will later be replaced by:
|
| /payment/booster-order
|
*/

router.post(
  "/booster",
  subscriptionController.buyBooster
)


export default router