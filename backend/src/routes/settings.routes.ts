import { Router } from "express"
import * as settingsController from "../controllers/settings.controller"
import {
  validateGSTMiddleware,
  validateInvoiceMiddleware,
  validateLanguageMiddleware,
  validateBackupMiddleware,
} from "../middleware/settings.validator"

import { verifyToken } from "../middleware/auth.middleware"

const router = Router()

// GST Settings
router.get("/gst", verifyToken, settingsController.getGST)
router.put("/gst", verifyToken, validateGSTMiddleware, settingsController.updateGST)

// Invoice Settings
router.get("/invoice", verifyToken, settingsController.getInvoice)
router.put("/invoice", validateInvoiceMiddleware, settingsController.updateInvoice)

// Language Settings
router.get("/language", verifyToken, settingsController.getLanguage)
router.put("/language", verifyToken, validateLanguageMiddleware, settingsController.updateLanguage)

// Backup Settings
router.get("/backup", verifyToken, settingsController.getBackup)
router.put("/backup", verifyToken, validateBackupMiddleware, settingsController.updateBackup)
router.post("/backup/run", verifyToken, settingsController.runBackup)

// Subscription / Plan
router.get("/plan", verifyToken, settingsController.getPlan)

export default router