import * as jwt from 'jsonwebtoken'
import { IUser } from '../../models/User'
import { Types } from 'mongoose'

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JWTPayload {
  userId: string
  email: string
  username: string
  subscription: string
  iat?: number
  exp?: number
}

export function generateToken(user: IUser): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: (user._id as Types.ObjectId).toString(),
    email: user.email || '',
    username: user.username,
    subscription: user.subscription,
  }

  const options: jwt.SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256'
  } as jwt.SignOptions

  return jwt.sign(payload, JWT_SECRET, options)
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as JWTPayload
    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token')
    } else {
      throw new Error('Token verification failed')
    }
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}