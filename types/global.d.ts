import { Connection } from 'mongoose'

declare global {
  var mongoose: {
    conn: Connection | null
    promise: Promise<Connection> | null
  } | undefined

  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string
      JWT_SECRET: string
      JWT_EXPIRES_IN: string
      NODE_ENV: 'development' | 'production' | 'test'
      NEXTAUTH_SECRET: string
      NEXTAUTH_URL: string
    }
  }
}

export {}