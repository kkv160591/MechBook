import {
  Router
} from "express"

import * as subscriptionController
from "../controllers/subscription.controller"

import {
  verifyToken
} from "../middleware/auth.middleware"


const router =
  Router()


/*
|--------------------------------------------------------------------------
| PLAN & USAGE
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  verifyToken,
  subscriptionController.getPlanUsage
)


/*
|--------------------------------------------------------------------------
| PLAN PAYMENT
|--------------------------------------------------------------------------
*/

router.post(
  "/payment/order",
  verifyToken,
  subscriptionController.createPaymentOrder
)


router.post(
  "/payment/verify",
  verifyToken,
  subscriptionController.verifyPayment
)


/*
|--------------------------------------------------------------------------
| BOOSTER PAYMENT
|--------------------------------------------------------------------------
*/

router.post(
  "/booster/order",
  verifyToken,
  subscriptionController.createBoosterOrder
)


router.post(
  "/booster/verify",
  verifyToken,
  subscriptionController.verifyBoosterPayment
)


/*
|--------------------------------------------------------------------------
| RAZORPAY WEBHOOK
|--------------------------------------------------------------------------
|
| DO NOT add verifyToken.
|
*/

router.post(
  "/payment/webhook",
  subscriptionController.razorpayWebhook
)


export default router