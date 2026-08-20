import express from "express"

import {
  getProfile,
  updateProfile
} from "../controllers/garage.controller"

import {
  verifyToken
} from "../middleware/auth.middleware"

import { validateGarageProfile } from "../validators/garage.validation"

const router =
  express.Router()

router.get(
  "/profile",
  verifyToken,
  getProfile
)

router.put(
  "/profile",
  verifyToken,
  validateGarageProfile,
  updateProfile
)

export default router