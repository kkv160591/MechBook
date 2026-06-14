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

const router =
  express.Router()

router.post(
  "/",
  verifyToken,
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
  updateWorkerController
)

router.patch(
  "/:workerId/status",
  verifyToken,
  updateWorkerStatusController
)

router.patch(
  "/:workerId/reset-pin",
  verifyToken,
  resetWorkerPinController
)

export default router