import { createRequire } from 'node:module'
import { isColorSupported, isDevelopment } from 'std-env'
import pino from 'pino'

const require = globalThis.require || createRequire(import.meta.url)

const prettyExists = (() => {
  try {
    require('pino-pretty')
    return true
  }
  catch {
    return false
  }
})()

export const logger = pino(
  {
    level: isDevelopment ? 'debug' : 'info',
    base: undefined,
    transport: isDevelopment && prettyExists
      ? { target: 'pino-pretty', options: { colorize: isColorSupported } }
      : undefined,
    // redact: {
    //   paths: [],
    //   remove: true,
    // },
  },
)
