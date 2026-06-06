import { Request, Response } from "express"

import {
  registerGarage,
  loginUser
} from "../services/auth.service"

export const register =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const garage =
        await registerGarage(
          req.body
        )

      return res.status(201).json({

        success: true,

        message:
          "Garage registered successfully",

        data: garage

      })

    }

    catch (error: any) {

      return res.status(400).json({

        success: false,

        message:
          error.message

      })

    }

  }

export const login =
  async (
    req: any,
    res: any
  ) => {

    try {

      const {
        phone,
        pin
      } = req.body

      const result =
        await loginUser(
          phone,
          pin
        )

      return res.json({

        success: true,

        ...result

      })

    }

    catch (error: any) {

      return res.status(401).json({

        success: false,

        message:
          error.message

      })

    }

  }