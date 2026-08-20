import { Request, Response, NextFunction } from "express"

const phoneRegex = /^[6-9]\d{9}$/
const pinRegex = /^\d{4}$/

// Middleware for POST /api/workers
export const validateCreateWorker = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, role, phone, pin } = req.body
  const errors: { [key: string]: string } = {}

  // 1. Worker Name Validation
  if (!name || !name.trim()) {
    errors.name = "Worker name is required"
  } else if (name.trim().length > 50) {
    errors.name = "Worker name cannot exceed 50 characters"
  }

  // 2. Role Validation
  if (!role || !role.trim()) {
    errors.role = "Role is required"
  } else if (role.trim().length > 30) {
    errors.role = "Role cannot exceed 30 characters"
  }

  // 3. Phone Validation (10 digits starting with 6-9)
  if (!phone || !phone.trim()) {
    errors.phone = "Phone number is required"
  } else if (!phoneRegex.test(phone.trim())) {
    errors.phone = "Enter a valid 10-digit mobile number"
  }

  // 4. PIN Validation (Exactly 4 digits)
  if (!pin || !pin.trim()) {
    errors.pin = "4-digit PIN is required"
  } else if (!pinRegex.test(pin.trim())) {
    errors.pin = "PIN must be exactly 4 numeric digits"
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: Object.values(errors)[0], // First error for alert modal
      errors
    })
  }

  next()
}

// Middleware for PUT /api/workers/:workerId
export const validateUpdateWorker = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, role, phone } = req.body
  const errors: { [key: string]: string } = {}

  if (name !== undefined) {
    if (!name.trim()) {
      errors.name = "Worker name cannot be empty"
    } else if (name.trim().length > 50) {
      errors.name = "Worker name cannot exceed 50 characters"
    }
  }

  if (role !== undefined) {
    if (!role.trim()) {
      errors.role = "Role cannot be empty"
    } else if (role.trim().length > 30) {
      errors.role = "Role cannot exceed 30 characters"
    }
  }

  if (phone !== undefined) {
    if (!phone.trim()) {
      errors.phone = "Phone number cannot be empty"
    } else if (!phoneRegex.test(phone.trim())) {
      errors.phone = "Enter a valid 10-digit mobile number"
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: Object.values(errors)[0],
      errors
    })
  }

  next()
}

// Middleware for PATCH /api/workers/:workerId/status
export const validateUpdateWorkerStatus = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { active } = req.body

  if (typeof active !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Active status must be a boolean (true or false)"
    })
  }

  next()
}

// Middleware for PATCH /api/workers/:workerId/reset-pin
export const validateResetWorkerPin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { pin } = req.body
  const errors: { [key: string]: string } = {}

  if (!pin || !pin.trim()) {
    errors.pin = "4-digit PIN is required"
  } else if (!pinRegex.test(pin.trim())) {
    errors.pin = "PIN must be exactly 4 numeric digits"
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: Object.values(errors)[0],
      errors
    })
  }

  next()
}