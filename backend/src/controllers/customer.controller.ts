import {
  Request,
  Response
} from "express"

import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} from "../services/customer.service"

/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER
|--------------------------------------------------------------------------
*/

export const addCustomer =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const garageId =
        (req as any).user.garageId

      const customer =
        await createCustomer(
          garageId,
          req.body
        )

      return res.status(201).json({

        success: true,

        customer

      })

    } catch (error: any) {

      console.error(
        "Create customer error:",
        error
      )

      const statusCode =
        error.statusCode || 500

      return res.status(statusCode).json({

        success: false,

        message:
          error.message ||
          "Failed to create customer"

      })
    }
  }


/*
|--------------------------------------------------------------------------
| LIST CUSTOMERS
|--------------------------------------------------------------------------
*/

export const listCustomers =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const garageId =
        (req as any).user.garageId

      const customers =
        await getCustomers(
          garageId
        )

      return res.json({

        success: true,

        customers

      })

    } catch (error: any) {

      console.error(
        "Get customers error:",
        error
      )

      return res.status(500).json({

        success: false,

        message:
          error.message ||
          "Failed to get customers"

      })
    }
  }


/*
|--------------------------------------------------------------------------
| GET CUSTOMER BY ID
|--------------------------------------------------------------------------
*/

export const customerDetail =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const garageId =
        (req as any).user.garageId

      const customer =
        await getCustomerById(
          garageId,
          req.params.customerId as string
        )

      if (!customer) {

        return res.status(404).json({

          success: false,

          message:
            "Customer not found"

        })
      }

      return res.json({

        success: true,

        customer

      })

    } catch (error: any) {

      console.error(
        "Get customer error:",
        error
      )

      return res.status(500).json({

        success: false,

        message:
          error.message ||
          "Failed to get customer"

      })
    }
  }


/*
|--------------------------------------------------------------------------
| UPDATE CUSTOMER
|--------------------------------------------------------------------------
*/

export const editCustomer =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const garageId =
        (req as any).user.garageId

      const customer =
        await updateCustomer(
          garageId,
          req.params.customerId as string,
          req.body
        )

      return res.json({

        success: true,

        message:
          "Customer updated successfully",

        customer

      })

    } catch (error: any) {

      console.error(
        "Update customer error:",
        error
      )

      const statusCode =
        error.statusCode || 500

      return res.status(statusCode).json({

        success: false,

        message:
          error.message ||
          "Failed to update customer"

      })
    }
  }


/*
|--------------------------------------------------------------------------
| DELETE CUSTOMER
|--------------------------------------------------------------------------
*/

export const removeCustomer =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const garageId =
        (req as any).user.garageId

      await deleteCustomer(
        garageId,
        req.params.customerId as string
      )

      return res.json({

        success: true,

        message:
          "Customer deleted successfully"

      })

    } catch (error: any) {

      console.error(
        "Delete customer error:",
        error
      )

      const statusCode =
        error.statusCode || 500

      return res.status(statusCode).json({

        success: false,

        message:
          error.message ||
          "Failed to delete customer"

      })
    }
  }