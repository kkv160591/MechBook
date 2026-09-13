import axios from "axios"

const API_BASE_URL =
  `${process.env.EXPO_PUBLIC_API_URL}/auth`


// ==================================================
// LOGIN
// ==================================================

export const loginUser =
  async (
    phone: string,
    pin: string
  ) => {

    const response =
      await axios.post(
        `${API_BASE_URL}/login`,
        {
          phone,
          pin
        }
      )

    return response.data
  }


// ==================================================
// REGISTER
// ==================================================

export const registerGarage =
  async (
    payload: any
  ) => {

    const response =
      await axios.post(
        `${API_BASE_URL}/register`,
        payload
      )

    return response.data
  }


// ==================================================
// FORGOT PIN
// ==================================================

export const forgotPin =
  async (
    phone: string
  ) => {

    const response =
      await axios.post(
        `${API_BASE_URL}/forgot-pin`,
        {
          phone
        }
      )

    return response.data
  }


// ==================================================
// VERIFY PIN RESET OTP
// ==================================================

export const verifyPinResetOtp =
  async (
    phone: string,
    otp: string
  ) => {

    const response =
      await axios.post(
        `${API_BASE_URL}/verify-pin-reset-otp`,
        {
          phone,
          otp
        }
      )

    return response.data
  }


// ==================================================
// RESET PIN
// ==================================================

export const resetPin =
  async (
    resetToken: string,
    newPin: string
  ) => {

    const response =
      await axios.post(
        `${API_BASE_URL}/reset-pin`,
        {
          resetToken,
          newPin
        }
      )

    return response.data
  }