import {
  Request,
  Response
} from "express"

import * as settingsService
  from "../services/settings.service"


/*
 * ---------------------------------------------------------
 * GARAGE SETTINGS
 * ---------------------------------------------------------
 *
 * GST, INVOICE, BACKUP and PLAN are garage-level settings.
 *
 * garageId comes from the authenticated JWT.
 */
const getGarageId = (req: Request) => {
  return (req as any).user?.garageId
}


/*
 * ---------------------------------------------------------
 * GST
 * ---------------------------------------------------------
 */

export const getGST = async (
  req: Request,
  res: Response
) => {
  try {
    const garageId = getGarageId(req)

    if (!garageId) {
      return res.status(401).json({
        success: false,
        message: "Garage identity missing"
      })
    }

    const data =
      await settingsService.getSetting(
        garageId,
        "GST"
      )

    return res.json(data)
  } catch (error) {
    console.error(
      "Get GST settings error:",
      error
    )

    return res.status(500).json({
      success: false,
      message: "Failed to get GST settings"
    })
  }
}


export const updateGST = async (
  req: Request,
  res: Response
) => {
  try {
    const garageId = getGarageId(req)

    if (!garageId) {
      return res.status(401).json({
        success: false,
        message: "Garage identity missing"
      })
    }

    await settingsService.saveSetting(
      garageId,
      "GST",
      req.body
    )

    return res.json({
      success: true,
      message: "GST settings updated"
    })
  } catch (error) {
    console.error(
      "Update GST settings error:",
      error
    )

    return res.status(500).json({
      success: false,
      message: "Failed to update GST settings"
    })
  }
}


/*
 * ---------------------------------------------------------
 * INVOICE
 * ---------------------------------------------------------
 */

export const getInvoice = async (
  req: Request,
  res: Response
) => {
  try {
    const garageId = getGarageId(req)

    if (!garageId) {
      return res.status(401).json({
        success: false,
        message: "Garage identity missing"
      })
    }

    const data =
      await settingsService.getSetting(
        garageId,
        "INVOICE"
      )

    return res.json(data)
  } catch (error) {
    console.error(
      "Get invoice settings error:",
      error
    )

    return res.status(500).json({
      success: false,
      message: "Failed to get invoice settings"
    })
  }
}


export const updateInvoice = async (
  req: Request,
  res: Response
) => {
  try {
    const garageId = getGarageId(req)

    if (!garageId) {
      return res.status(401).json({
        success: false,
        message: "Garage identity missing"
      })
    }

    await settingsService.saveSetting(
      garageId,
      "INVOICE",
      req.body
    )

    return res.json({
      success: true,
      message: "Invoice settings updated"
    })
  } catch (error) {
    console.error(
      "Update invoice settings error:",
      error
    )

    return res.status(500).json({
      success: false,
      message: "Failed to update invoice settings"
    })
  }
}


/*
 * ---------------------------------------------------------
 * LANGUAGE
 * ---------------------------------------------------------
 *
 * LANGUAGE is USER-LEVEL.
 *
 * The authenticated user is taken from the JWT:
 *
 * req.user.userId
 * req.user.garageId
 *
 * The client does NOT send userId.
 */


/*
 * GET CURRENT USER LANGUAGE
 */

export const getLanguage = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user

    const garageId = user?.garageId
    const userId = user?.userId

    if (!garageId || !userId) {
      return res.status(401).json({
        success: false,
        message: "User identity missing"
      })
    }

    const data =
      await settingsService.getUserLanguageSetting(
        garageId,
        userId
      )

    return res.json(data)
  } catch (error) {
    console.error(
      "Get user language error:",
      error
    )

    return res.status(500).json({
      success: false,
      message: "Failed to get language settings"
    })
  }
}


/*
 * UPDATE CURRENT USER LANGUAGE
 */

export const updateLanguage = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user

    const garageId = user?.garageId
    const userId = user?.userId

    if (!garageId || !userId) {
      return res.status(401).json({
        success: false,
        message: "User identity missing"
      })
    }

    /*
     * IMPORTANT:
     *
     * Never trust userId from the mobile app.
     *
     * Even if someone sends:
     *
     * {
     *   "userId": "another-user",
     *   "language": "hi"
     * }
     *
     * we ignore that userId.
     */

    const {
      userId: ignoredUserId,
      ...preferences
    } = req.body

    const data =
      await settingsService.updateUserLanguageSetting(
        garageId,
        userId,
        preferences
      )

    return res.json({
      success: true,
      setting: data
    })
  } catch (error) {
    console.error(
      "Update user language error:",
      error
    )

    return res.status(500).json({
      success: false,
      message: "Failed to update language settings"
    })
  }
}


/*
 * ---------------------------------------------------------
 * BACKUP
 * ---------------------------------------------------------
 */

export const getBackup = async (
  req: Request,
  res: Response
) => {
  try {
    const garageId = getGarageId(req)

    if (!garageId) {
      return res.status(401).json({
        success: false,
        message: "Garage identity missing"
      })
    }

    const data =
      await settingsService.getSetting(
        garageId,
        "BACKUP"
      )

    return res.json(data)
  } catch (error) {
    console.error(
      "Get backup settings error:",
      error
    )

    return res.status(500).json({
      success: false,
      message: "Failed to get backup settings"
    })
  }
}


export const updateBackup = async (
  req: Request,
  res: Response
) => {
  try {
    const garageId = getGarageId(req)

    if (!garageId) {
      return res.status(401).json({
        success: false,
        message: "Garage identity missing"
      })
    }

    await settingsService.saveSetting(
      garageId,
      "BACKUP",
      req.body
    )

    return res.json({
      success: true,
      message: "Backup settings updated"
    })
  } catch (error) {
    console.error(
      "Update backup settings error:",
      error
    )

    return res.status(500).json({
      success: false,
      message: "Failed to update backup settings"
    })
  }
}


/*
 * ---------------------------------------------------------
 * RUN BACKUP
 * ---------------------------------------------------------
 */

export const runBackup = async (
  req: Request,
  res: Response
) => {
  try {
    const garageId = getGarageId(req)

    if (!garageId) {
      return res.status(401).json({
        success: false,
        message: "Garage identity missing"
      })
    }

    const data =
      await settingsService.runBackup(
        garageId
      )

    return res.json(data)
  } catch (error) {
    console.error(
      "Run backup error:",
      error
    )

    return res.status(500).json({
      success: false,
      message: "Failed to run backup"
    })
  }
}


/*
 * ---------------------------------------------------------
 * PLAN
 * ---------------------------------------------------------
 */

export const getPlan = async (
  req: Request,
  res: Response
) => {
  try {
    const garageId = getGarageId(req)

    if (!garageId) {
      return res.status(401).json({
        success: false,
        message: "Garage identity missing"
      })
    }

    const data =
      await settingsService.getSetting(
        garageId,
        "PLAN"
      )

    return res.json(data)
  } catch (error) {
    console.error(
      "Get plan settings error:",
      error
    )

    return res.status(500).json({
      success: false,
      message: "Failed to get plan settings"
    })
  }
}

/*
 * ---------------------------------------------------------
 * NOTIFICATIONS / SERVICE REMINDERS
 * ---------------------------------------------------------
 */

export const getNotifications = async (
  req: Request,
  res: Response
) => {

  try {

    const garageId =
      getGarageId(req)


    if (!garageId) {

      return res.status(401).json({

        success: false,

        message:
          "Garage identity missing"

      })

    }


    const setting =
      await settingsService.getNotificationSettings(
        garageId
      )


    return res.json({

      success: true,

      setting

    })

  } catch (error) {

    console.error(
      "Get notification settings error:",
      error
    )


    return res.status(500).json({

      success: false,

      message:
        "Failed to get notification settings"

    })

  }

}


export const updateNotifications = async (
  req: Request,
  res: Response
) => {

  try {

    const garageId =
      getGarageId(req)


    if (!garageId) {

      return res.status(401).json({

        success: false,

        message:
          "Garage identity missing"

      })

    }


    const setting =
      await settingsService.saveNotificationSettings(
        garageId,
        req.body
      )


    return res.json({

      success: true,

      message:
        "Notification settings updated",

      setting

    })

  } catch (error) {

    console.error(
      "Update notification settings error:",
      error
    )


    return res.status(500).json({

      success: false,

      message:
        "Failed to update notification settings"

    })

  }

}