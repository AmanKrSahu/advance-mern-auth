export interface registerData {
  name: string
  email: string
  password: string
  confirmPassword: string
  userAgent?: string
}

export interface LoginData {
  email: string
  password: string
  userAgent?: string
}
