import { Request, Response, NextFunction } from "express"

export const validateGarageProfile = (req: Request, res: Response, next: NextFunction) => {
  const {
    garageName,
    ownerName,
    phone,
    email,
    gstNumber,
    address,
    city,
    state,
    pincode,
    vehicleTypes
  } = req.body

  const errors: { [key: string]: string } = {}

  // 1. Garage Name Validation
  if (!garageName || !garageName.trim()) {
    errors.garageName = "Garage name is required"
  } else if (garageName.length > 50) {
    errors.garageName = "Garage name cannot exceed 50 characters"
  }

  // 2. Owner Name Validation
  if (!ownerName || !ownerName.trim()) {
    errors.ownerName = "Owner name is required"
  } else if (ownerName.length > 50) {
    errors.ownerName = "Owner name cannot exceed 50 characters"
  }

  // 3. Phone Validation (Must start with 6-9 and be 10 digits)
  const phoneRegex = /^[6-9]\d{9}$/
  if (!phone || !phone.trim()) {
    errors.phone = "Phone number is required"
  } else if (!phoneRegex.test(phone.trim())) {
    errors.phone = "Enter a valid 10 digit phone number"
  }

  // 4. Email Validation (Optional)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (email && email.trim() && !emailRegex.test(email.trim())) {
    errors.email = "Enter a valid email address"
  }

  // 5. GST Validation (Optional - 15 Alphanumeric)
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  if (gstNumber && gstNumber.trim() && !gstRegex.test(gstNumber.trim().toUpperCase())) {
    errors.gstNumber = "Enter a valid 15-character GSTIN"
  }

  // 6. Address Validation
  if (!address || !address.trim()) {
    errors.address = "Address is required"
  } else if (address.length > 120) {
    errors.address = "Address cannot exceed 120 characters"
  }

  // 7. City Validation
  if (!city || !city.trim()) {
    errors.city = "City is required"
  }

  // 8. State Validation
  if (!state || !state.trim()) {
    errors.state = "State is required"
  }

  // 9. Pincode Validation
  const pinRegex = /^\d{6}$/
  if (!pincode || !pincode.trim()) {
    errors.pincode = "Pincode is required"
  } else if (!pinRegex.test(pincode.trim())) {
    errors.pincode = "Enter a valid 6-digit pincode"
  }

  // 10. Vehicle Types Validation
  if (!vehicleTypes || !Array.isArray(vehicleTypes) || vehicleTypes.length === 0) {
    errors.vehicleTypes = "Select at least one vehicle type"
  }

  // Return validation response if errors exist
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: Object.values(errors)[0], // First error message for alert modal
      errors
    })
  }

  next()
}