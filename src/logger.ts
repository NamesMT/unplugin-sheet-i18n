import { isColorSupported, isDevelopment } from 'std-env'
import pino from 'pino'

export const logger = pino(
  {
    level: isDevelopment ? 'debug' : 'info',
    base: undefined,
    transport: isDevelopment
      ? { target: 'pino-pretty', options: { colorize: isColorSupported } }
      : undefined,
    // redact: {
    //   paths: [],
    //   remove: true,
    // },
  },
)
