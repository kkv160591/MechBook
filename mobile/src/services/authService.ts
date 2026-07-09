import axios from "axios"

const API_BASE_URL =
  "http://localhost:5000/auth"

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