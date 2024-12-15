import "dotenv/config"
import cors from "cors"
import cookieParser from "cookie-parser"

import express, { Request, Response } from "express"

import { config } from "./config/app.config"

import connectDatabase from "./database/database"

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: config.APP_ORIGIN,
    credentials: true,
  })
)

app.use(cookieParser())

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Server started successfully",
  })
})

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`)
  await connectDatabase()
})
