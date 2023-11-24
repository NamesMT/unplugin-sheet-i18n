import { isColorSupported, isDevelopment } from 'std-env'
import pino from 'pino'

export const logger = pino(
  {
    level: isDevelopment ? 'debug' : 'info',
    base: undefined,
    transport: isDevelopment
      // TODO: update std-env after isColorSupported is fixed: https://github.com/unjs/std-env/pull/97
      ? { target: 'pino-pretty', options: { colorize: isColorSupported } }
      : undefined,
    // redact: {
    //   paths: [],
    //   remove: true,
    // },
  },
)
