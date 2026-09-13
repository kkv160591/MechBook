import jwt from "jsonwebtoken"

import {
  Request,
  Response,
  NextFunction
} from "express"


export const verifyToken = (
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

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization header"
    })
  }

  const token =
    authHeader.substring(7)

  try {
    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as any

    /*
     * Every authenticated account must have
     * these two identities.
     *
     * Owner:
     *   userId = garageId
     *
     * Worker:
     *   userId = workerId
     *   workerId = workerId
     */
    if (
      !decoded?.userId ||
      !decoded?.garageId ||
      !decoded?.role
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid user identity"
      })
    }

    /*
     * Only expose the fields the application needs.
     */
    ;(req as any).user = {
      userId: decoded.userId,
      garageId: decoded.garageId,
      role: decoded.role,
      workerId: decoded.workerId
    }

    next()
  } catch (error) {
    console.error(
      "JWT verification error:",
      error
    )

    return res.status(401).json({
      success: false,
      message: "Invalid token"
    })
  }
}