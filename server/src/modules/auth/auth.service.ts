import { ErrorCode } from "../../common/enums/error-code.enum"
import { VerificationEnum } from "../../common/enums/verification-code.enum"
import { LoginData, registerData } from "../../common/interface/auth.interface"
import {
  calculateExpirationDate,
  fortyFiveMinutesFromNow,
  ONE_DAY_IN_MS,
} from "../../common/utils/date-time"
import {
  BadRequestException,
  UnauthorizedException,
} from "../../common/utils/catch-errors"
import {
  refreshTokenSignOptions,
  RefreshTPayload,
  signJwtToken,
  verifyJwtToken,
} from "../../common/utils/jwt"

import { config } from "../../config/app.config"

import UserModel from "../../database/models/user.model"
import SessionModel from "../../database/models/session.model"
import VerificationCodeModel from "../../database/models/verification.model"

export class AuthService {
  public async register(registerData: registerData) {
    const { name, email, password } = registerData

    const existingUser = await UserModel.exists({
      email,
    })

    if (existingUser) {
      throw new BadRequestException(
        "User already exists with this email",
        ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
      )
    }

    const newUser = await UserModel.create({
      name,
      email,
      password,
    })

    const userId = newUser._id

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const verification = await VerificationCodeModel.create({
      userId,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: fortyFiveMinutesFromNow(),
    })

    // Sending verification email link

    return {
      user: newUser,
    }
  }

  public async login(loginData: LoginData) {
    const { email, password, userAgent } = loginData

    const user = await UserModel.findOne({
      email: email,
    })

    if (!user) {
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_USER_NOT_FOUND
      )
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_USER_NOT_FOUND
      )
    }

    // Check if the user enabled 2fa return user=null

    const session = await SessionModel.create({
      userId: user._id,
      userAgent,
    })

    const accessToken = signJwtToken({
      userId: user._id,
      sessionId: session._id,
    })

    const refreshToken = signJwtToken(
      {
        sessionId: session._id,
      },
      refreshTokenSignOptions
    )

    return {
      user,
      accessToken,
      refreshToken,
      mfaRequired: false,
    }
  }

  public async refreshToken(refreshToken: string) {
    const { payload } = verifyJwtToken<RefreshTPayload>(refreshToken, {
      secret: refreshTokenSignOptions.secret,
    })

    if (!payload) {
      throw new UnauthorizedException("Invalid refresh token")
    }

    const session = await SessionModel.findById(payload.sessionId)
    const now = Date.now()

    if (!session) {
      throw new UnauthorizedException("Session does not exist")
    }

    if (session.expiredAt.getTime() <= now) {
      throw new UnauthorizedException("Session expired")
    }

    const sessionRequireRefresh =
      session.expiredAt.getTime() - now <= ONE_DAY_IN_MS

    if (sessionRequireRefresh) {
      session.expiredAt = calculateExpirationDate(config.JWT.REFRESH_EXPIRES_IN)
      await session.save()
    }

    const newRefreshToken = sessionRequireRefresh
      ? signJwtToken(
          {
            sessionId: session._id,
          },
          refreshTokenSignOptions
        )
      : undefined

    const accessToken = signJwtToken({
      userId: session.userId,
      sessionId: session._id,
    })

    return {
      accessToken,
      newRefreshToken,
    }
  }
}
