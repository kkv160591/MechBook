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
// INVOICE SETTINGS
// ==========================================

export const validateInvoiceSettings =
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
            "Invalid invoice settings payload"
        }
      }

    }


    /*
     * Adjust these fields to match the
     * actual invoice settings your app uses.
     */

    const invoicePrefix =
      String(
        body.invoicePrefix ?? ""
      ).trim()


    if (
      invoicePrefix.length > 30
    ) {

      errors.invoicePrefix =
        "Invoice prefix must not exceed 30 characters"

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
        ...body,
        invoicePrefix
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