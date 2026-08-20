import { Request, Response, NextFunction } from "express"
import { body, param, validationResult } from "express-validator"

// Reusable validation middleware
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((err: any) => ({
        field: err.path,
        message: err.msg
      }))
    })
  }
  next()
}

// Validation rules for ServiceTypeId URL parameters
export const serviceTypeIdParamValidation = [
  param("serviceTypeId")
    .trim()
    .notEmpty()
    .withMessage("Service Type ID is required")
    .isUUID()
    .withMessage("Invalid Service Type ID format"),

  validate
]

// Create Service Type Rules
export const createServiceTypeValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Service name is required")
    .isLength({ max: 50 })
    .withMessage("Service name cannot exceed 50 characters"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ max: 30 })
    .withMessage("Category cannot exceed 30 characters"),

  body("defaultPrice")
    .notEmpty()
    .withMessage("Default price is required")
    .isFloat({ min: 0 })
    .withMessage("Default price must be a valid non-negative number"),

  body("estimatedDuration")
    .trim()
    .notEmpty()
    .withMessage("Estimated duration is required")
    .isLength({ max: 50 })
    .withMessage("Estimated duration cannot exceed 50 characters"),

  validate
]

// Update Service Type Rules
export const updateServiceTypeValidationRules = [
  param("serviceTypeId")
    .trim()
    .notEmpty()
    .withMessage("Service Type ID is required")
    .isUUID()
    .withMessage("Invalid Service Type ID format"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Service name cannot be empty")
    .isLength({ max: 50 })
    .withMessage("Service name cannot exceed 50 characters"),

  body("category")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category cannot be empty")
    .isLength({ max: 30 })
    .withMessage("Category cannot exceed 30 characters"),

  body("defaultPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Default price must be a valid non-negative number"),

  body("estimatedDuration")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Estimated duration cannot be empty")
    .isLength({ max: 50 })
    .withMessage("Estimated duration cannot exceed 50 characters"),

  body("active")
    .optional()
    .isBoolean()
    .withMessage("Active state must be a boolean value"),

  validate
]