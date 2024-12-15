import "dotenv/config"
import cors from "cors"
import cookieParser from "cookie-parser"
import express, { NextFunction, Request, Response } from "express"

import { config } from "./config/app.config"
import { HTTPSTATUS } from "./config/http.config"

import connectDatabase from "./database/database"

import authRoutes from "./modules/auth/auth.routes"
import { errorHandler } from "./middlewares/errorHandler"
import { asyncHandler } from "./middlewares/asyncHandler"

const app = express()
const BASE_PATH = config.BASE_PATH

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: config.APP_ORIGIN,
    credentials: true,
  })
)

app.use(cookieParser())

app.get(
  "/",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Server started successfully",
    })
  })
)

app.use(`${BASE_PATH}/auth`, authRoutes)

app.use(errorHandler)

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`)
  await connectDatabase()
})
