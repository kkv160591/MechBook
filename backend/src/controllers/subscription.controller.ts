import {
  Request,
  Response
} from "express"

import * as subscriptionService
from "../services/subscription.service"


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
| CHANGE PLAN
|--------------------------------------------------------------------------
*/

export const changePlan =
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
        .changePlan(
          garageId,
          planCode,
          billingCycle
        )

    res.json(
      data
    )

  } catch (error) {

    console.error(
      "Change plan error:",
      error
    )

    res.status(400).json({

      message:
        error instanceof Error
          ? error.message
          : "Unable to change plan"

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