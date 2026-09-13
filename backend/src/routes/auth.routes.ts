import {
  Router
} from "express"

import {
  register,
  login,
  forgotPin,
  verifyPinResetOtp,
  resetPin
} from "../controllers/auth.controller"

import {
  registerValidationRules,
  loginValidationRules,
  forgotPinValidationRules,
  verifyPinResetOtpValidationRules,
  resetPinValidationRules
} from "../validators/auth.validator"


const router =
  Router()


// ==================================================
// REGISTER
// ==================================================

router.post(
  "/register",
  registerValidationRules,
  register
)


// ==================================================
// LOGIN
// ==================================================

router.post(
  "/login",
  loginValidationRules,
  login
)


// ==================================================
// FORGOT PIN
// ==================================================

router.post(
  "/forgot-pin",
  forgotPinValidationRules,
  forgotPin
)


// ==================================================
// VERIFY OTP
// ==================================================

router.post(
  "/verify-pin-reset-otp",
  verifyPinResetOtpValidationRules,
  verifyPinResetOtp
)


// ==================================================
// RESET PIN
// ==================================================

router.post(
  "/reset-pin",
  resetPinValidationRules,
  resetPin
)


export default router