import { Router } from "express"

import {

  addCustomer,

  listCustomers,

  customerDetail

} from "../controllers/customer.controller"

import { createCustomerValidationRules, validateRequest } from "../validators/customer.validator"

import {
  verifyToken
} from "../middleware/auth.middleware"

const router = Router()

router.post(
  "/",
  verifyToken,
  createCustomerValidationRules,
  addCustomer
)

router.get(
  "/",
  verifyToken,
  listCustomers
)

router.get(
  "/:customerId",
  verifyToken,
  customerDetail
)

export default router