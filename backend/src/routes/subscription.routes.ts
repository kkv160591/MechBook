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
| CHANGE PLAN
|--------------------------------------------------------------------------
*/

router.post(
  "/change-plan",
  subscriptionController.changePlan
)


/*
|--------------------------------------------------------------------------
| BUY BOOSTER
|--------------------------------------------------------------------------
*/

router.post(
  "/booster",
  subscriptionController.buyBooster
)


export default router