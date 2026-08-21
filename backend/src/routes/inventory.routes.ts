import express from "express"
import {
  addPart,
  getParts,
  getPart,
  editPart,
  removePart,
  lowStock
} from "../controllers/inventory.controller"

import { verifyToken } from "../middleware/auth.middleware"
import {
  inventoryValidationRules,
  partIdParamValidation,
  validateRequest
} from "../validators/inventory.validator"

const router = express.Router()

router.use(verifyToken)

// POST /
router.post(
  "/",
  inventoryValidationRules,
  validateRequest,
  addPart
)

// GET /
router.get("/", getParts)

// GET /low-stock
router.get("/low-stock", lowStock)

// GET /:partId
router.get(
  "/:partId",
  partIdParamValidation,
  validateRequest,
  getPart
)

// PUT /:partId
router.put(
  "/:partId",
  partIdParamValidation,
  inventoryValidationRules,
  validateRequest,
  editPart
)

// DELETE /:partId
router.delete(
  "/:partId",
  partIdParamValidation,
  validateRequest,
  removePart
)

export default router