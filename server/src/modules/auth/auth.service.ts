import { ErrorCode } from "../../common/enums/error-code.enum"
import { registerData } from "../../common/interface/auth.interface"
import { BadRequestException } from "../../common/utils/catch-errors"
import { fortyFiveMinutesFromNow } from "../../common/utils/date-time"
import { VerificationEnum } from "../../common/enums/verification-code.enum"

import UserModel from "../../database/models/user.model"
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
}
