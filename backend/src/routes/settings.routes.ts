import { Router } from "express"
import * as settingsController from "../controllers/settings.controller"
import {
  validateGSTMiddleware,
  validateInvoiceMiddleware,
  validateLanguageMiddleware,
  validateBackupMiddleware,
} from "../middleware/settings.validator"

const router = Router()

// GST Settings
router.get("/gst", settingsController.getGST)
router.put("/gst", validateGSTMiddleware, settingsController.updateGST)

// Invoice Settings
router.get("/invoice", settingsController.getInvoice)
router.put("/invoice", validateInvoiceMiddleware, settingsController.updateInvoice)

// Language Settings
router.get("/language", settingsController.getLanguage)
router.put("/language", validateLanguageMiddleware, settingsController.updateLanguage)

// Backup Settings
router.get("/backup", settingsController.getBackup)
router.put("/backup", validateBackupMiddleware, settingsController.updateBackup)
router.post("/backup/run", settingsController.runBackup)

// Subscription / Plan
router.get("/plan", settingsController.getPlan)

export default router