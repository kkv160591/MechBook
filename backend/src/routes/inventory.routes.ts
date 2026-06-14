import express from "express"

import {

  addPart,
  getParts,
  getPart,
  editPart,
  removePart,
  lowStock

} from "../controllers/inventory.controller"

import {
  verifyToken
} from "../middleware/auth.middleware"

const router =
  express.Router()

router.use(verifyToken)

router.post("/", addPart)

router.get("/", getParts)

router.get(
  "/low-stock",
  lowStock
)

router.get(
  "/:partId",
  getPart
)

router.put(
  "/:partId",
  editPart
)

router.delete(
  "/:partId",
  removePart
)

export default router