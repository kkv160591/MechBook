import { Request, Response, NextFunction } from "express"
import { body, param, validationResult } from "express-validator"

// Helper middleware to handle validation errors
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // Return 400 Bad Request with the first error message formatted for frontend popups
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array()
    })
  }
  next()
}

// Validation rules for adding/updating inventory parts
export const inventoryValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Part name is required"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),

  body("buyingPrice")
    .notEmpty()
    .withMessage("Buying price is required")
    .isNumeric()
    .withMessage("Buying price must be a valid number")
    .custom((value) => Number(value) >= 0)
    .withMessage("Buying price cannot be negative"),

  body("sellingPrice")
    .notEmpty()
    .withMessage("Selling price is required")
    .isNumeric()
    .withMessage("Selling price must be a valid number")
    .custom((value) => Number(value) >= 0)
    .withMessage("Selling price cannot be negative"),

  body("stock")
    .notEmpty()
    .withMessage("Current stock is required")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  body("minStock")
    .notEmpty()
    .withMessage("Minimum stock is required")
    .isInt({ min: 0 })
    .withMessage("Minimum stock must be a non-negative integer"),

  body("sku")
    .optional()
    .trim()
]

// Validation rules for routes with partId params
export const partIdParamValidation = [
  param("partId")
    .trim()
    .notEmpty()
    .withMessage("Part ID parameter is required")
]