import express from "express"

import {
  createWorkerController,
  getWorkersController,
  getWorkerController,
  updateWorkerController,
  updateWorkerStatusController,
  resetWorkerPinController
} from "../controllers/worker.controller"

import {
  verifyToken
} from "../middleware/auth.middleware"

import {
  validateCreateWorker,
  validateUpdateWorker,
  validateUpdateWorkerStatus,
  validateResetWorkerPin
} from "../validators/worker.validation"

const router =
  express.Router()

router.post(
  "/",
  verifyToken,
  validateCreateWorker,
  createWorkerController
)

router.get(
  "/",
  verifyToken,
  getWorkersController
)

router.get(
  "/:workerId",
  verifyToken,
  getWorkerController
)

router.put(
  "/:workerId",
  verifyToken,
  validateUpdateWorker,
  updateWorkerController
)

router.patch(
  "/:workerId/status",
  verifyToken,
  validateUpdateWorkerStatus,
  updateWorkerStatusController
)

router.patch(
  "/:workerId/reset-pin",
  verifyToken,
  validateResetWorkerPin,
  resetWorkerPinController
)

export default router