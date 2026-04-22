export interface LoginInput{
    email: string
    password: string
}

export interface JwtPayload{
    id: string
    email: string
    role: string
}

export interface PasswordSetupTokenPayload {
    userId: string
    purpose: "password_setup"
    jti: string
}

export interface ValidatePasswordSetupInput {
    token: string
}

export interface CompletePasswordSetupInput {
    token: string
    newPassword: string
}
