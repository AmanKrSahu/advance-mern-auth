// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from "express"

import { UserDocument } from "../database/models/user.model"

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends UserDocument {}
    interface Request {
      sessionId?: string
    }
  }
}
