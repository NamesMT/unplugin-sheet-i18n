import process from 'node:process'
import pino from 'pino'

export const logger = pino(
  {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    base: undefined,
  // redact: {
  //   paths: [],
  //   remove: true,
  // },
  },
)
