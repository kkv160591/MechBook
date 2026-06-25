import {
  Router
} from "express"

import * as settingsController
from "../controllers/settings.controller"

const router =
  Router()

router.get(
  "/gst",
  settingsController.getGST
)

router.put(
  "/gst",
  settingsController.updateGST
)

router.get(
  "/invoice",
  settingsController.getInvoice
)

router.put(
  "/invoice",
  settingsController.updateInvoice
)

router.get(
  "/language",
  settingsController.getLanguage
)

router.put(
  "/language",
  settingsController.updateLanguage
)

router.get(
  "/backup",
  settingsController.getBackup
)

router.put(
  "/backup",
  settingsController.updateBackup
)

router.post(
  "/backup/run",
  settingsController.runBackup
)

router.get(
  "/plan",
  settingsController.getPlan
)

export default router