import { Request, Response } from "express"
import { registerGarage, loginUser } from "../services/auth.service"

export const register = async (req: Request, res: Response) => {
  try {
    const garage = await registerGarage(req.body)

    return res.status(201).json({
      success: true,
      message: "Garage registered successfully",
      data: garage
    })
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Registration failed"
    })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { phone, pin } = req.body

    const result = await loginUser(phone, pin)

    return res.status(200).json({
      success: true,
      ...result
    })
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message || "Authentication failed"
    })
  }
}