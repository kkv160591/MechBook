import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

const API_URL =
  "http://localhost:5000/api"

export const getCustomers =
  async () => {

    const token =
      await AsyncStorage.getItem(
        "token"
      )

    const response =
      await axios.get(
        `${API_URL}/customers`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )

    return response.data

  }

export const getCustomer =
  async (
    customerId: string
  ) => {

    const token =
      await AsyncStorage.getItem(
        "token"
      )

    const response =
      await axios.get(
        `${API_URL}/customers/${customerId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )

    return response.data

  }

export const createCustomer =
  async (
    customerData: any
  ) => {

    const token =
      await AsyncStorage.getItem(
        "token"
      )

    const response =
      await axios.post(
        `${API_URL}/customers`,
        customerData,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )

    return response.data

  }