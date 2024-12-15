import { Request, Response } from "express"
import { HTTPSTATUS } from "../../config/http.config"
import { registerSchema } from "../../common/validators/auth.validator"

import { asyncHandler } from "../../middlewares/asyncHandler"

import { AuthService } from "./auth.service"

export class AuthController {
  private authService: AuthService

  constructor(authService: AuthService) {
    this.authService = authService
  }

  public register = asyncHandler(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (req: Request, res: Response): Promise<any> => {
      const body = registerSchema.parse({
        ...req.body,
      })
      const { user } = await this.authService.register(body)

      return res.status(HTTPSTATUS.CREATED).json({
        message: "User registered successfully",
        data: user,
      })
    }
  )
}
