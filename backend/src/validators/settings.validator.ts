// validators/settings.validator.ts


// ==========================================
// GST
// ==========================================

export const validateGSTSettings =
  (
    body: any
  ): {
    valid: boolean
    errors: Record<string, string>
    data?: any
  } => {

    const errors:
      Record<string, string> = {}


    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {

      return {
        valid: false,
        errors: {
          body:
            "Invalid GST settings payload"
        }
      }

    }


    const gstNumber =
      String(
        body.gstNumber ??
        body.gst ??
        ""
      )
        .trim()
        .toUpperCase()


    // --------------------------------------
    // REQUIRED
    // --------------------------------------

    if (!gstNumber) {

      errors.gstNumber =
        "GST number is required"

    }


    // --------------------------------------
    // LENGTH
    // --------------------------------------

    else if (
      gstNumber.length !== 15
    ) {

      errors.gstNumber =
        "GST number must be exactly 15 characters"

    }


    // --------------------------------------
    // FORMAT
    // --------------------------------------

    else {

      const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/


      if (
        !gstRegex.test(
          gstNumber
        )
      ) {

        errors.gstNumber =
          "Invalid GST number format"

      }

    }


    if (
      Object.keys(errors).length > 0
    ) {

      return {
        valid: false,
        errors
      }

    }


    return {

      valid: true,

      errors: {},

      data: {
        gstNumber
      }

    }

  }


// ==========================================
// LANGUAGE
// ==========================================

export const validateLanguageSettings =
  (
    body: any
  ) => {

    const errors:
      Record<string, string> = {}


    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {

      return {
        valid: false,
        errors: {
          body:
            "Invalid language settings payload"
        }
      }

    }


    const language =
      String(
        body.language ?? ""
      )
        .trim()


    if (!language) {

      errors.language =
        "Language is required"

    }
    else if (
      language.length > 10
    ) {

      errors.language =
        "Language must not exceed 10 characters"

    }


    if (
      Object.keys(errors).length > 0
    ) {

      return {
        valid: false,
        errors
      }

    }


    return {

      valid: true,

      errors: {},

      data: {
        language
      }

    }

  }


// ==========================================
// INVOICE SETTINGS VALIDATOR
// ==========================================

export const validateInvoiceSettings = (body: any) => {
  const errors: Record<string, string> = {}

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      valid: false,
      errors: { body: "Invalid invoice settings payload" }
    }
  }

  // 1. Boolean Display Toggles Validation
  const booleanFields = [
    "showGarageLogo",
    "showGSTNumber",
    "showGarageAddress",
    "showCustomerAddress",
    "showVehicleDetails",
    "showPaymentDetails"
  ]

  for (const field of booleanFields) {
    if (body[field] !== undefined && typeof body[field] !== "boolean") {
      errors[field] = `${field} must be a boolean value`
    }
  }

  // 2. Billing Defaults Validation (Labor Cost & Discount)
  let laborCost = 0
  if (body.defaultLaborCost !== undefined && body.defaultLaborCost !== null && String(body.defaultLaborCost).trim() !== "") {
    laborCost = Number(body.defaultLaborCost)
    if (isNaN(laborCost)) {
      errors.defaultLaborCost = "Default labor cost must be a valid number"
    } else if (laborCost < 0) {
      errors.defaultLaborCost = "Default labor cost cannot be negative"
    }
  }

  let discountType: "percentage" | "fixed" = "percentage"
  if (body.defaultDiscountType !== undefined) {
    if (body.defaultDiscountType !== "percentage" && body.defaultDiscountType !== "fixed") {
      errors.defaultDiscountType = "Discount type must be either 'percentage' or 'fixed'"
    } else {
      discountType = body.defaultDiscountType
    }
  }

  let discount = 0
  if (body.defaultDiscount !== undefined && body.defaultDiscount !== null && String(body.defaultDiscount).trim() !== "") {
    discount = Number(body.defaultDiscount)
    if (isNaN(discount)) {
      errors.defaultDiscount = "Default discount must be a valid number"
    } else if (discount < 0) {
      errors.defaultDiscount = "Default discount cannot be negative"
    } else if (discountType === "percentage" && discount > 100) {
      errors.defaultDiscount = "Percentage discount cannot exceed 100%"
    }
  }

  // 3. Warranty Terms Length Constraints
  const defaultWarranty = String(body.defaultWarranty ?? "").trim()
  if (defaultWarranty.length > 300) {
    errors.defaultWarranty = "Warranty terms must not exceed 300 characters"
  }

  // 4. Footer Note Length Constraints
  const footerNote = String(body.footerNote ?? "").trim()
  if (footerNote.length > 250) {
    errors.footerNote = "Footer note must not exceed 250 characters"
  }

  // 5. Terms & Conditions Length Constraints
  const terms = String(body.terms ?? "").trim()
  if (terms.length > 1000) {
    errors.terms = "Terms & conditions must not exceed 1000 characters"
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    errors: {},
    data: {
      showGarageLogo: Boolean(body.showGarageLogo),
      showGSTNumber: Boolean(body.showGSTNumber),
      showGarageAddress: Boolean(body.showGarageAddress),
      showCustomerAddress: Boolean(body.showCustomerAddress),
      showVehicleDetails: Boolean(body.showVehicleDetails),
      showPaymentDetails: Boolean(body.showPaymentDetails),
      defaultLaborCost: laborCost,
      defaultDiscount: discount,
      defaultDiscountType: discountType,
      defaultWarranty,
      footerNote,
      terms
    }
  }
}


// ==========================================
// BACKUP SETTINGS
// ==========================================

export const validateBackupSettings =
  (
    body: any
  ) => {

    const errors:
      Record<string, string> = {}


    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {

      return {
        valid: false,
        errors: {
          body:
            "Invalid backup settings payload"
        }
      }

    }


    /*
     * Example validation.
     * Change these fields according to
     * your actual backup settings model.
     */

    if (
      body.enabled !== undefined &&
      typeof body.enabled !== "boolean"
    ) {

      errors.enabled =
        "Backup enabled must be true or false"

    }


    if (
      Object.keys(errors).length > 0
    ) {

      return {
        valid: false,
        errors
      }

    }


    return {

      valid: true,

      errors: {},

      data: body

    }

  }