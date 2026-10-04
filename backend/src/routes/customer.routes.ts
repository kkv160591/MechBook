import { Router } from "express"

import {
  addCustomer,
  listCustomers,
  customerDetail,
  editCustomer,
  removeCustomer
} from "../controllers/customer.controller"

import {
  createCustomerValidationRules,
  updateCustomerValidationRules
} from "../validators/customer.validator"

import {
  verifyToken
} from "../middleware/auth.middleware"

const router = Router()

/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  verifyToken,
  createCustomerValidationRules,
  addCustomer
)

/*
|--------------------------------------------------------------------------
| LIST CUSTOMERS
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  verifyToken,
  listCustomers
)

/*
|--------------------------------------------------------------------------
| GET CUSTOMER
|--------------------------------------------------------------------------
*/

router.get(
  "/:customerId",
  verifyToken,
  customerDetail
)

/*
|--------------------------------------------------------------------------
| UPDATE CUSTOMER
|--------------------------------------------------------------------------
*/

router.put(
  "/:customerId",
  verifyToken,
  updateCustomerValidationRules,
  editCustomer
)

/*
|--------------------------------------------------------------------------
| DELETE CUSTOMER
|--------------------------------------------------------------------------
*/

router.delete(
  "/:customerId",
  verifyToken,
  removeCustomer
)

export default router