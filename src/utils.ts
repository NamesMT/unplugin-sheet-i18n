import * as fs from 'node:fs'
import type { WriteFileOptions } from 'node:fs'
import path from 'pathe'

export function outputFileSync(
  filepath: string,
  data: string | NodeJS.ArrayBufferView,
  options?: WriteFileOptions,
) {
  const dir = path.dirname(filepath)
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true })

  fs.writeFileSync(filepath, data, options)
}
