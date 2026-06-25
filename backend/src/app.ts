import express from "express"
import cors from "cors"

import authRoutes
  from "./routes/auth.routes"

import customerRoutes
  from "./routes/customer.routes"

import inventoryRoutes
  from "./routes/inventory.routes"

import garageRoutes
  from "./routes/garage.routes"

import workerRoutes
  from "./routes/worker.routes"

import serviceRoutes
  from "./routes/service.routes"

const app = express()

app.use(cors())

app.use(express.json())

app.get(
  "/",
  (_req, res) => {

    res.json({
      message:
        "GarageBook API Running"
    })

  }
)

app.use(
  "/auth",
  authRoutes
)

app.use(
  "/api/customers",
  customerRoutes
)

app.use(
  "/api/inventory",
  inventoryRoutes
)

app.use(
  "/api/garage",
  garageRoutes
)

app.use(
  "/api/workers",
  workerRoutes
)

app.use(
  "/api/services",
  serviceRoutes
)

export default app