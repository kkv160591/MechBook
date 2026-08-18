import {
  Router
} from "express"

import {
  register,
  login
} from "../controllers/auth.controller"
import {
  registerValidationRules,
  loginValidationRules
} from "../validators/auth.validator"

const router = Router()

router.post(
  "/register",
  registerValidationRules,
  register
)

router.post(
  "/login",
  loginValidationRules,
  login
)

export default router