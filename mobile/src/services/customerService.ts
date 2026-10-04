import axios from "axios"

import AsyncStorage from
  "@react-native-async-storage/async-storage"

const API_URL =
  `${process.env.EXPO_PUBLIC_API_URL}/api`


const getAuthHeaders = async () => {

  const token =
    await AsyncStorage.getItem(
      "token"
    )

  return {

    Authorization:
      `Bearer ${token}`

  }
}


/*
|--------------------------------------------------------------------------
| GET CUSTOMERS
|--------------------------------------------------------------------------
*/

export const getCustomers =
async () => {

  const response =
    await axios.get(
      `${API_URL}/customers`,
      {
        headers:
          await getAuthHeaders()
      }
    )

  return response.data
}


/*
|--------------------------------------------------------------------------
| GET CUSTOMER
|--------------------------------------------------------------------------
*/

export const getCustomer =
async (
  customerId: string
) => {

  const response =
    await axios.get(
      `${API_URL}/customers/${customerId}`,
      {
        headers:
          await getAuthHeaders()
      }
    )

  return response.data
}


/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER
|--------------------------------------------------------------------------
*/

export const createCustomer =
async (
  customerData: any
) => {

  const response =
    await axios.post(
      `${API_URL}/customers`,
      customerData,
      {
        headers:
          await getAuthHeaders()
      }
    )

  return response.data
}


/*
|--------------------------------------------------------------------------
| UPDATE CUSTOMER
|--------------------------------------------------------------------------
*/

export const updateCustomer =
async (
  customerId: string,
  customerData: any
) => {

  const response =
    await axios.put(
      `${API_URL}/customers/${customerId}`,
      customerData,
      {
        headers:
          await getAuthHeaders()
      }
    )

  return response.data
}


/*
|--------------------------------------------------------------------------
| DELETE CUSTOMER
|--------------------------------------------------------------------------
*/

export const deleteCustomer =
async (
  customerId: string
) => {

  const response =
    await axios.delete(
      `${API_URL}/customers/${customerId}`,
      {
        headers:
          await getAuthHeaders()
      }
    )

  return response.data
}