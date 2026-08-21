import { Request, Response, NextFunction } from "express"
import { body, validationResult } from "express-validator"

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array()
    })
  }
  next()
}

export const createCustomerValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Customer name is required"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone number must be a valid 10-digit number"),

  body("alternatePhone")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage("Alternate phone number must be a valid 10-digit number"),

  body("address").optional().trim(),
  body("notes").optional().trim(),
]