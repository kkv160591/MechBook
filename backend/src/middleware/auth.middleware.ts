import jwt from "jsonwebtoken"

import {

  Request,
  Response,
  NextFunction

} from "express"

export const verifyToken =
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    const authHeader =
      req.headers.authorization

    if (!authHeader) {

      return res.status(401).json({

        success: false,

        message: "Token missing"

      })

    }

    const token =
      authHeader.replace(
        "Bearer ",
        ""
      )

    try {

      const decoded =
        jwt.verify(

          token,

          process.env.JWT_SECRET!

        )

      ;(req as any).user =
        decoded

      next()

    } catch {

      return res.status(401).json({

        success: false,

        message: "Invalid token"

      })

    }

  }