import express from "express"

import {
  getProfile,
  updateProfile
} from "../controllers/garage.controller"

import {
  verifyToken
} from "../middleware/auth.middleware"

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
  updateProfile
)

export default router