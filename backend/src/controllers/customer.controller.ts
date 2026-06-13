import {
  Request,
  Response
} from "express"

import {

  createCustomer,

  getCustomers,

  getCustomerById

} from "../services/customer.service"

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

      res.status(201).json({

        success: true,

        customer

      })

    } catch (error: any) {

      res.status(500).json({

        success: false,

        message: error.message

      })

    }

  }

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

      res.json({

        success: true,

        customers

      })

    } catch (error: any) {

      res.status(500).json({

        success: false,

        message: error.message

      })

    }

  }

export const customerDetail =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const customer =
        await getCustomerById(
          req.params.customerId as string
        )

      res.json({

        success: true,

        customer

      })

    } catch (error: any) {

      res.status(500).json({

        success: false,

        message: error.message

      })

    }

  }