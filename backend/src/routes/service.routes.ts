import { Router } from "express"

import {
  createServiceType,
  getServiceTypes,
  getServiceTypeById,
  updateServiceType,
  deleteServiceType
} from "../controllers/service.controller"

import {
  verifyToken
} from "../middleware/auth.middleware"

const router = Router()

router.post(
  "/",
  verifyToken,
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
  getServiceTypeById
)

router.put(
  "/:serviceTypeId",
  verifyToken,
  updateServiceType
)

router.delete(
  "/:serviceTypeId",
  verifyToken,
  deleteServiceType
)

export default router