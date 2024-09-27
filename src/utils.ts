import type { WriteFileOptions } from 'node:fs'
import type { Options } from './types'
import { Buffer } from 'node:buffer'
import * as fs from 'node:fs'
import { utils, readFile as xlsxReadFile } from '@e965/xlsx'
import { objectGet, objectSet } from '@namesmt/utils'
import { defu } from 'defu'
import Papa from 'papaparse'
import path from 'pathe'
import { logger } from './logger'

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

export function isEmptyCell(cellValue: string, quoteChar: string = '"') {
  return !cellValue || (
    quoteChar && cellValue === quoteChar.repeat(2)
  )
}

/**
 * This function read a local file and returns toString of that file (a.k.a csvString)
 */
export function readCsvFile(file: string) {
  return fs.readFileSync(file).toString()
}

/**
 * This function reads a xlsx file, combining all worksheets into one, convert and returns a csvString
 * 
 * Requires `set_fs` from `sheetjs` to be initialized
 */
export function readXlsxFile(file: string) {
  // options is no longer used because of v0.2.2 revert

  const workbook = xlsxReadFile(file)

  let json: Record<string, any>[] = []
  for (const sheet of Object.values(workbook.Sheets))
    json = json.concat(utils.sheet_to_json(sheet))

  const toCsv = utils.sheet_to_csv(utils.json_to_sheet(json), { FS: Papa.RECORD_SEP, RS: '\r\n' })

  return toCsv
}

// CREDIT: took from somewhere in vHeemstra/vite-plugin-imagemin
export function scanFiles(dir: string) {
  let files: string[] = []
  try {
    const stats = fs.lstatSync(dir)
    if (stats.isDirectory()) {
      fs.readdirSync(dir).forEach((file) => {
        files = files.concat(
          scanFiles(path.join(dir, path.sep, file)),
        )
      })
    }
    else {
      // [DISABLED] Cache lookup
      // if (stats.mtimeMs > (mtimeCache.get(dir) || 0)) {
      //   mtimeCache.set(dir, stats.mtimeMs)
      files.push(dir)
      // }
    }
  }
  catch (error) {
    // ENOENT SystemError (trown by lstatSync() if non-existent path)
    logger.error(`Error: ${(error as Error)?.message}`)
  }
  return files
}

// Build an i18n-compatible object based on an array of objects with provided key/value column
export function transformToI18n(array: Record<any, any>[], keyCol: string, valueCol: string, keyStyle: Options['keyStyle'], options: { replacePunctuationSpace?: boolean } = {}) {
  const obj = {} as Record<any, any>
  array.forEach((item) => {
    const k = objectGet(item, keyCol)
    const v = options.replacePunctuationSpace ? replacePunctuationSpace(objectGet(item, valueCol)) : objectGet(item, valueCol)

    // Skip cells with empty value for a proper fallback
    if (isEmptyCell(v))
      return

    if (keyStyle === 'nested') {
      try {
        objectSet(obj, k, v)
      }
      catch (error) {
        if (error instanceof TypeError && error.message.match(/^Cannot create property '.+ on string/))
          return logger.error(`[sheetI18n] nested key exist: '${k}', consider using flat keyStyle.`)

        throw error
      }
    }
    else { obj[k] = v }
  })

  return obj
}
