import { Request, Response, NextFunction } from "express"
import { body, validationResult } from "express-validator"

// Helper to return validation errors back to frontend
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg, // Return first error message
      errors: errors.array().map((err: any) => ({
        field: err.path,
        message: err.msg
      }))
    })
  }
  next()
}

// Registration Rules
export const registerValidationRules = [
  body("ownerName")
    .trim()
    .notEmpty()
    .withMessage("Owner name is required"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number must be exactly 10 digits")
    .isNumeric()
    .withMessage("Phone number must contain only numbers"),

  body("pin")
    .trim()
    .notEmpty()
    .withMessage("PIN is required")
    .isLength({ min: 4, max: 4 })
    .withMessage("PIN must be exactly 4 digits")
    .isNumeric()
    .withMessage("PIN must contain only numbers"),

  body("garageName")
    .trim()
    .notEmpty()
    .withMessage("Garage name is required"),

  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required"),

  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),

  body("state")
    .trim()
    .notEmpty()
    .withMessage("State is required"),

  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Invalid email address format"),

  validate
]

// Login Rules
export const loginValidationRules = [
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number must be 10 digits"),

  body("pin")
    .trim()
    .notEmpty()
    .withMessage("PIN is required")
    .isLength({ min: 4, max: 4 })
    .withMessage("PIN must be 4 digits"),

  validate
]