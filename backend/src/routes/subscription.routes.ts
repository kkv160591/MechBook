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
|
| Requires authenticated user.
|
| verifyToken decodes the JWT and attaches:
|
| req.user = {
|   garageId,
|   role,
|   ...
| }
|
*/

router.get(
  "/",
  verifyToken,
  subscriptionController.getPlanUsage
)


/*
|--------------------------------------------------------------------------
| CREATE PAYMENT ORDER
|--------------------------------------------------------------------------
|
| Requires authenticated user.
|
| The controller gets the real garageId from:
|
| req.user.garageId
|
*/

router.post(
  "/payment/order",
  verifyToken,
  subscriptionController.createPaymentOrder
)


/*
|--------------------------------------------------------------------------
| VERIFY PAYMENT
|--------------------------------------------------------------------------
|
| Requires authenticated user.
|
*/

router.post(
  "/payment/verify",
  verifyToken,
  subscriptionController.verifyPayment
)


/*
|--------------------------------------------------------------------------
| RAZORPAY WEBHOOK
|--------------------------------------------------------------------------
|
| DO NOT use verifyToken here.
|
| Razorpay does not send your application's JWT.
|
| This route authenticates the webhook using the
| Razorpay webhook signature instead.
|
| IMPORTANT:
| The server must provide the RAW request body.
|
*/

router.post(
  "/payment/webhook",
  subscriptionController.razorpayWebhook
)


/*
|--------------------------------------------------------------------------
| BUY BOOSTER
|--------------------------------------------------------------------------
|
| Requires authenticated user.
|
*/

router.post(
  "/booster",
  verifyToken,
  subscriptionController.buyBooster
)


export default router