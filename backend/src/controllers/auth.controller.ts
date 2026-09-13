import {
  Request,
  Response
} from "express"

import {
  registerGarage,
  loginUser,
  findAccountByPhone,
  resetOwnerPin,
  resetWorkerPin
} from "../services/auth.service"

import {
  createPinRecovery,
  verifyPinRecoveryOtp,
  consumeResetToken,
  deletePinRecovery
} from "../services/pinRecovery.service"

import {
  sendOtpSms
} from "../services/sms.service"


/*
 * --------------------------------------------------
 * REGISTER
 * --------------------------------------------------
 */

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

      return res
        .status(201)
        .json({

          success:
            true,

          message:
            "Garage registered successfully",

          data:
            garage
        })

    } catch (
      error: any
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            error.message ||
            "Registration failed"
        })
    }
  }


/*
 * --------------------------------------------------
 * LOGIN
 * --------------------------------------------------
 */

export const login =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        phone,
        pin
      } =
        req.body

      const result =
        await loginUser(
          phone,
          pin
        )

      return res
        .status(200)
        .json({

          success:
            true,

          ...result
        })

    } catch (
      error: any
    ) {

      return res
        .status(401)
        .json({

          success:
            false,

          message:
            error.message ||
            "Authentication failed"
        })
    }
  }


/*
 * --------------------------------------------------
 * FORGOT PIN
 * --------------------------------------------------
 *
 * IMPORTANT:
 *
 * We intentionally return the same
 * response whether the phone exists
 * or not.
 */

export const forgotPin =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        phone
      } =
        req.body

      if (
        !phone ||
        !/^\d{10}$/.test(
          phone
        )
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Valid phone number is required"
          })
      }


      const account =
        await findAccountByPhone(
          phone
        )


      /*
       * Do not reveal whether
       * the account exists.
       */

      if (!account) {

        return res
          .status(200)
          .json({

            success:
              true,

            message:
              "If an account exists, a verification code has been sent."
          })
      }


      const recovery =
        await createPinRecovery(
          account
        )


      await sendOtpSms(
        phone,
        recovery.otp
      )


      return res
        .status(200)
        .json({

          success:
            true,

          message:
            "If an account exists, a verification code has been sent."
        })

    } catch (
      error: any
    ) {

      /*
       * Do not expose whether
       * the account exists.
       */

      if (
        error.message ===
        "Please wait before requesting another OTP"
      ) {

        return res
          .status(429)
          .json({

            success:
              false,

            message:
              error.message
          })
      }

      console.error(
        "Forgot PIN error:",
        error
      )

      return res
        .status(200)
        .json({

          success:
            true,

          message:
            "If an account exists, a verification code has been sent."
        })
    }
  }


/*
 * --------------------------------------------------
 * VERIFY PIN RESET OTP
 * --------------------------------------------------
 */

export const verifyPinResetOtp =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        phone,
        otp
      } =
        req.body

      if (
        !phone ||
        !/^\d{10}$/.test(
          phone
        )
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Valid phone number is required"
          })
      }

      if (
        !otp ||
        !/^\d{6}$/.test(
          otp
        )
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "OTP must be exactly 6 digits"
          })
      }


      const result =
        await verifyPinRecoveryOtp(
          phone,
          otp
        )


      return res
        .status(200)
        .json({

          success:
            true,

          message:
            "OTP verified successfully",

          resetToken:
            result.resetToken
        })

    } catch (
      error: any
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            error.message ||
            "OTP verification failed"
        })
    }
  }


/*
 * --------------------------------------------------
 * RESET PIN
 * --------------------------------------------------
 */

export const resetPin =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        resetToken,
        newPin
      } =
        req.body


      if (
        !resetToken
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Reset token is required"
          })
      }


      if (
        !newPin ||
        !/^\d{4}$/.test(
          newPin
        )
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "PIN must be exactly 4 digits"
          })
      }


      const recovery =
        await consumeResetToken(
          resetToken
        )


      if (
        recovery.role ===
        "owner"
      ) {

        await resetOwnerPin(
          recovery.garageId,
          newPin
        )

      } else if (
        recovery.role ===
        "worker"
      ) {

        if (
          !recovery.workerId
        ) {

          throw new Error(
            "Worker identity missing"
          )
        }

        await resetWorkerPin(
          recovery.workerId,
          newPin
        )

      } else {

        throw new Error(
          "Invalid account type"
        )
      }


      /*
       * Invalidate recovery data
       * after successful reset.
       */

      await deletePinRecovery(
        recovery.phone
      )


      return res
        .status(200)
        .json({

          success:
            true,

          message:
            "PIN reset successfully"
        })

    } catch (
      error: any
    ) {

      console.error(
        "Reset PIN error:",
        error
      )

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            error.message ||
            "PIN reset failed"
        })
    }
  }