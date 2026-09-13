import {
  Request,
  Response,
  NextFunction
} from "express"

import {
  body,
  validationResult
} from "express-validator"


// ==================================================
// VALIDATION ERROR HANDLER
// ==================================================

export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const errors =
    validationResult(req)

  if (!errors.isEmpty()) {

    return res.status(400).json({

      success: false,

      message:
        errors.array()[0].msg,

      errors:
        errors.array().map(
          (err: any) => ({

            field:
              err.path,

            message:
              err.msg

          })
        )
    })
  }

  next()
}


// ==================================================
// REGISTER VALIDATION
// ==================================================

export const registerValidationRules = [

  body("ownerName")
    .trim()
    .notEmpty()
    .withMessage(
      "Owner name is required"
    ),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage(
      "Phone number is required"
    )
    .isLength({
      min: 8,
      max: 15
    })
    .withMessage(
      "Enter a valid phone number"
    )
    .isNumeric()
    .withMessage(
      "Phone number must contain only numbers"
    ),

  body("pin")
    .trim()
    .notEmpty()
    .withMessage(
      "PIN is required"
    )
    .isLength({
      min: 4,
      max: 4
    })
    .withMessage(
      "PIN must be exactly 4 digits"
    )
    .isNumeric()
    .withMessage(
      "PIN must contain only numbers"
    ),

  body("garageName")
    .trim()
    .notEmpty()
    .withMessage(
      "Garage name is required"
    ),

  body("address")
    .trim()
    .notEmpty()
    .withMessage(
      "Address is required"
    ),

  body("city")
    .trim()
    .notEmpty()
    .withMessage(
      "City is required"
    ),

  body("state")
    .trim()
    .notEmpty()
    .withMessage(
      "State is required"
    ),

  body("country")
    .trim()
    .notEmpty()
    .withMessage(
      "Country is required"
    ),

  body("pincode")
    .optional({
      checkFalsy: true
    })
    .trim(),

  body("email")
    .optional({
      checkFalsy: true
    })
    .isEmail()
    .withMessage(
      "Invalid email address format"
    ),

  validate
]


// ==================================================
// LOGIN VALIDATION
// ==================================================

export const loginValidationRules = [

  body("phone")
    .trim()
    .notEmpty()
    .withMessage(
      "Phone number is required"
    )
    .isLength({
      min: 10,
      max: 10
    })
    .withMessage(
      "Phone number must be 10 digits"
    )
    .isNumeric()
    .withMessage(
      "Phone number must contain only numbers"
    ),

  body("pin")
    .trim()
    .notEmpty()
    .withMessage(
      "PIN is required"
    )
    .isLength({
      min: 4,
      max: 4
    })
    .withMessage(
      "PIN must be exactly 4 digits"
    )
    .isNumeric()
    .withMessage(
      "PIN must contain only numbers"
    ),

  validate
]


// ==================================================
// FORGOT PIN VALIDATION
// ==================================================

export const forgotPinValidationRules = [

  body("phone")
    .trim()
    .notEmpty()
    .withMessage(
      "Phone number is required"
    )
    .isLength({
      min: 10,
      max: 10
    })
    .withMessage(
      "Phone number must be exactly 10 digits"
    )
    .isNumeric()
    .withMessage(
      "Phone number must contain only numbers"
    ),

  validate
]


// ==================================================
// VERIFY PIN RESET OTP VALIDATION
// ==================================================

export const verifyPinResetOtpValidationRules = [

  body("phone")
    .trim()
    .notEmpty()
    .withMessage(
      "Phone number is required"
    )
    .isLength({
      min: 10,
      max: 10
    })
    .withMessage(
      "Phone number must be exactly 10 digits"
    )
    .isNumeric()
    .withMessage(
      "Phone number must contain only numbers"
    ),

  body("otp")
    .trim()
    .notEmpty()
    .withMessage(
      "OTP is required"
    )
    .isLength({
      min: 6,
      max: 6
    })
    .withMessage(
      "OTP must be exactly 6 digits"
    )
    .isNumeric()
    .withMessage(
      "OTP must contain only numbers"
    ),

  validate
]


// ==================================================
// RESET PIN VALIDATION
// ==================================================

export const resetPinValidationRules = [

  body("resetToken")
    .trim()
    .notEmpty()
    .withMessage(
      "Reset token is required"
    ),

  body("newPin")
    .trim()
    .notEmpty()
    .withMessage(
      "New PIN is required"
    )
    .isLength({
      min: 4,
      max: 4
    })
    .withMessage(
      "PIN must be exactly 4 digits"
    )
    .isNumeric()
    .withMessage(
      "PIN must contain only numbers"
    ),

  validate
]