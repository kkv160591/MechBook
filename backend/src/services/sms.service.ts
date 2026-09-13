  export const sendOtpSms = async (
  phone: string,
  otp: string
) => {

  /*
   * DEVELOPMENT ONLY
   *
   * Replace this implementation with
   * Twilio / MSG91 / 2Factor / another
   * SMS provider before production.
   */

  console.log("")
  console.log(
    "======================================"
  )
  console.log(
    "        MECHBOOK PIN RECOVERY OTP"
  )
  console.log(
    "======================================"
  )
  console.log(
    `Phone: ${phone}`
  )
  console.log(
    `OTP: ${otp}`
  )
  console.log(
    "Expires in: 5 minutes"
  )
  console.log(
    "======================================"
  )
  console.log("")

  return {
    success: true
  }
}