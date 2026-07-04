import { Router } from "express"

import * as JobController from "../controllers/job.controller"

import {
  verifyToken
} from "../middleware/auth.middleware"

const router = Router()

router.post(
  "/",
  verifyToken,
  JobController.createJob
)

router.get(
  "/",
  verifyToken,
  JobController.getJobs
)

router.get(
  "/:jobId",
  verifyToken,
  JobController.getJobById
)

router.put(
  "/:jobId",
  verifyToken,
  JobController.updateJob
)

router.patch(
  "/:jobId/status",
  verifyToken,
  JobController.updateJobStatus
)

router.patch(
  "/:jobId/worker",
  verifyToken,
  JobController.assignWorker
)

router.delete(
  "/:jobId",
  verifyToken,
  JobController.deleteJob
)

export default router