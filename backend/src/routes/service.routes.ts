import { Router } from "express"

import {
  createServiceType,
  getServiceTypes,
  getServiceTypeById,
  updateServiceType,
  deleteServiceType
} from "../controllers/service.controller"

import { verifyToken } from "../middleware/auth.middleware"

import {
  createServiceTypeValidationRules,
  updateServiceTypeValidationRules,
  serviceTypeIdParamValidation
} from "../validators/service.validator"

const router = Router()

router.post(
  "/",
  verifyToken,
  createServiceTypeValidationRules,
  createServiceType
)

router.get(
  "/",
  verifyToken,
  getServiceTypes
)

router.get(
  "/:serviceTypeId",
  verifyToken,
  serviceTypeIdParamValidation,
  getServiceTypeById
)

router.put(
  "/:serviceTypeId",
  verifyToken,
  updateServiceTypeValidationRules,
  updateServiceType
)

router.delete(
  "/:serviceTypeId",
  verifyToken,
  serviceTypeIdParamValidation,
  deleteServiceType
)

export default router