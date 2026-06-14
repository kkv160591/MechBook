import {
  Request,
  Response
} from "express"

import {
  getGarageProfile,
  updateGarageProfile
} from "../services/garage.service"

export const getProfile =
async (
  req: any,
  res: Response
) => {

  try {

    const garage =
      await getGarageProfile(
        req.user.garageId
      )

    return res.status(200).json({

      success: true,

      garage

    })

  }

  catch (error) {

    console.error(error)

    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch profile"

    })

  }

}

export const updateProfile =
async (
  req: any,
  res: Response
) => {

  try {

    const garage =
      await updateGarageProfile(

        req.user.garageId,

        req.body

      )

    return res.status(200).json({

      success: true,

      message:
        "Profile updated successfully",

      garage

    })

  }

  catch (error) {

    console.error(error)

    return res.status(500).json({

      success: false,

      message:
        "Failed to update profile"

    })

  }

}