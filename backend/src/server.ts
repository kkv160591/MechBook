import dotenv from "dotenv"
dotenv.config()

import app from "./app"

const PORT = Number(process.env.PORT) || 3001

const server = app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`)
})

server.on("error", (err) => {
  console.error("HTTP server failed to start:", err)
})