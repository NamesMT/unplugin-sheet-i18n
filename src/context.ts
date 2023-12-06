import * as fs from 'node:fs'
import path from 'pathe'
import defu from 'defu'
import Papa from 'papaparse'
import { createFilter } from 'vite'
import { readFile, set_fs, utils } from '@e965/xlsx'
import { process } from 'std-env'
import { logger } from './logger'
import type { Options } from './types'
import { oGet, oSet } from './utils'

// Enabling xlsx readFile support with set_fs
set_fs(fs)

export const defaultOptions = {
  include: /(?:\/|\\|^)i18n.(?:csv)$/,
  keyStyle: 'flat',
  keyProp: 'KEY',
  comments: '//',
} satisfies Options

export function createContext(options: Options = {}, root = process.cwd!()) {
  const resolvedOptions = defu(options, defaultOptions)

  const filter = createFilter(resolvedOptions.include, resolvedOptions.exclude)

  const resolvedOutDir = resolvedOptions.outDir ? path.resolve(root, resolvedOptions.outDir!) : null
  const allowedExtensions = ['.csv']
  const spreadsheetExtensions = ['.xls', '.xlsx', '.xlsm', '.xlsb', '.ods']
  if (resolvedOptions.xlsx)
    allowedExtensions.push(...spreadsheetExtensions)

  async function init() {
    logger.info('[sheetI18n] Initializing...')
    if (resolvedOutDir)
      await initDir(resolvedOutDir)
  }

  async function initDir(directory: string) {
    /**
     * Check if the directory exists.
     * If it does not exist, create it.
     */
    try {
      const data = fs.existsSync(directory)
      if (!data)
        fs.mkdirSync(directory, { recursive: true })
    }
    catch (error) {
      logger.error(`[sheetI18n] ${error}`)
    }
  }

  async function convert(file: string) {
    logger.info(`[sheetI18n] Processing: ${file.replace(`${root}/`, '')}`)

    const pathParsed = path.parse(file)

    if (!allowedExtensions.includes(pathParsed.ext))
      return logger.error(`[sheetI18n] unexpected extension: ${file}${spreadsheetExtensions.includes(pathParsed.ext) ? `, xlsx is not enabled.` : ''}`)

    const csvString = pathParsed.ext === 'csv'
      ? readCsvFile(file)
      : readXlsxFile(file, { comments: resolvedOptions.comments })

    const parsed = Papa.parse<any>(csvString, { skipEmptyLines: true, header: true, comments: resolvedOptions.comments })

    const outputs: Record<string, ReturnType<typeof transformToI18n>> = {}
    if (resolvedOptions.valueProp) {
      outputs[`${path.resolve(resolvedOutDir || pathParsed.dir, pathParsed.name)}.json`] = transformToI18n(parsed.data, resolvedOptions.keyProp, resolvedOptions.valueProp, resolvedOptions.keyStyle)
    }
    else {
      const locales = parsed.meta.fields?.filter(prop => prop.match(/^\w{2}(?:-\w{2})?$/))

      if (!locales?.length)
        return logger.error('[sheetI18n] cannot detect any locales column, maybe you need to use valueProp?')

      locales.forEach((locale) => {
        outputs[`${path.resolve(resolvedOutDir || pathParsed.dir, locale)}.json`] = transformToI18n(parsed.data, resolvedOptions.keyProp, locale, resolvedOptions.keyStyle)
      })
    }

    Object.entries(outputs).forEach(([path, content]) => {
      fs.writeFileSync(path, JSON.stringify(content, undefined, 2))
    })
  }

  async function scanConvert() {
    const files = scanFiles(root).filter(filter)
    for (const file of files)
      await convert(file)
  }

  return {
    root,
    options,
    resolvedOptions,
    resolvedOutDir,
    allowedExtensions,
    filter,
    init,
    initDir,
    convert,
    scanConvert,
  }
}

/**
 * This function read a local file and returns toString of that file (a.k.a csvString)
 */
function readCsvFile(file: string) {
  return fs.readFileSync(file).toString()
}

interface ReadXlsxFileOptions {
  comments?: Options['comments']
}
/**
 * This function reads a xlsx file, combining all worksheets into one, convert and returns a csvString
 */
function readXlsxFile(file: string, _options: ReadXlsxFileOptions = {}) {
  // options is no longer used because of v0.2.2 revert

  const workbook = readFile(file)

  let json: Record<string, any>[] = []
  for (const sheet of Object.values(workbook.Sheets))
    json = json.concat(utils.sheet_to_json(sheet))

  const toCsv = utils.sheet_to_csv(utils.json_to_sheet(json), { FS: Papa.RECORD_SEP, RS: '\r\n' })

  return toCsv
}

// Build a object based on an array of objects with provided key/value prop
function transformToI18n(array: Record<any, any>[], key: string, value: string, keyStyle: Options['keyStyle']) {
  const obj = {} as Record<any, any>
  array.forEach((item) => {
    const k = oGet(item, key)
    const v = oGet(item, value)
    if (keyStyle === 'nested')
      oSet(obj, k, v)
    else
      obj[k] = v
  })

  return obj
}

// Took from: vHeemstra/vite-plugin-imagemin
function scanFiles(dir: string) {
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
