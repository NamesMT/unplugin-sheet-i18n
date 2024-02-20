import * as fs from 'node:fs'
import type { WriteFileOptions } from 'node:fs'
import { Buffer } from 'node:buffer'
import path from 'pathe'
import { defu } from 'defu'

export function outputFileSync(
  filepath: string,
  data: string | NodeJS.ArrayBufferView,
  options?: WriteFileOptions & {
    /**
     * Perform a json deep merge if file already exists
     * Explicitly set to `true` if you want to perform a simple concatenate for other file types
     */
    mergeContent?: boolean | 'json'
  },
) {
  // Ensure directory exists
  const dir = path.dirname(filepath)
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true })

  // Perform mergeContent
  if (options?.mergeContent && fs.existsSync(filepath)) {
    // special deep merger for json
    if (filepath.endsWith('.json')) {
      if (typeof data !== 'string')
        throw new Error('Please provide `data` as a JSON stringified object')

      data = JSON.stringify(defu(JSON.parse(data), JSON.parse(fs.readFileSync(filepath).toString())), undefined, 2)
    }
    // simple concat for other files
    else if (options.mergeContent === true) {
      data = Buffer.concat([fs.readFileSync(filepath), new Uint8Array(Buffer.from('Hello Node.js'))])
    }
  }

  // Write the file
  fs.writeFileSync(filepath, data, options)
}

const mergeStore: Record<string, boolean> = {}
/**
 * Wrapper for `outputFileSync()` that will do a normal write the first time the file is encountered in the node process, and `mergeContent` for future writes
 */
export function outputWriteMerge(
  filepath: string,
  data: string | NodeJS.ArrayBufferView,
  options?: Exclude<WriteFileOptions, BufferEncoding> & {
    /**
     * Perform a json deep merge if file already exists
     * Explicitly set to `true` if you want to perform a simple concatenate for other file types
     */
    mergeContent?: boolean | 'json'
  },
) {
  const allowMerge = Boolean(mergeStore[filepath])
  mergeStore[filepath] = true

  return outputFileSync(filepath, data, { ...options, mergeContent: allowMerge && (options?.mergeContent ?? true) })
}

export function replacePunctuationSpace(str: string) {
  return str.replaceAll(/ ([!$%:;?+-])/g, '\xA0$1')
}
