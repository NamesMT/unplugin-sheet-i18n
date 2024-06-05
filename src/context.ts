import * as fs from 'node:fs'
import type { ParsedPath } from 'node:path'
import path from 'pathe'
import defu from 'defu'
import Papa from 'papaparse'
import { createFilter } from 'vite'
import { readFile, set_fs, utils } from '@e965/xlsx'
import { process } from 'std-env'
import { objectGet, objectSet } from '@namesmt/utils'
import { logger } from './logger'
import type { Options } from './types'
import { outputFileSync, outputWriteMerge, replacePunctuationSpace } from './utils'

// Enabling xlsx readFile support with set_fs
set_fs(fs)

export const defaultOptions = {
  // eslint-disable-next-line regexp/no-useless-non-capturing-group
  include: /(?:\/|\\|^)i18n\.(?:csv)$/,
  keyStyle: 'flat',
  keyColumn: 'KEY',
  comments: '//',
  mergeOutput: true,
  replacePunctuationSpace: true,
  jsonProcessorClean: true,
  fileProcessorClean: true,
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
    const relativePath = file.replace(`${root}/`, '')

    logger.info(`[sheetI18n] Processing: ${relativePath}`)

    const pathParsed = path.parse(file)

    if (!allowedExtensions.includes(pathParsed.ext))
      return logger.error(`[sheetI18n] unexpected extension: ${file}${spreadsheetExtensions.includes(pathParsed.ext) ? `, xlsx is not enabled.` : ''}`)

    // Read the file and convert to a csv string
    let csvString = pathParsed.ext === 'csv'
      ? readCsvFile(file)
      : readXlsxFile(file)

    // Filter out comment rows
    if (resolvedOptions.comments) {
      if (!Array.isArray(resolvedOptions.comments))
        resolvedOptions.comments = [resolvedOptions.comments] as string[]

      const splittedCsvString = csvString.split('\r\n')
      csvString = splittedCsvString.filter(
        txt => !(resolvedOptions.comments as string[]).some((needle) => {
          // eslint-disable-next-line regexp/prefer-character-class, regexp/no-obscure-range
          const RE = new RegExp(`^"?${needle.replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&')}`)
          return txt.match(RE)
        }),
      ).join('\r\n')
    }

    // Parse to json and do a simple filter for keyColumn, skipping rows without a defined key.
    let emptyKeySkipped = 0
    const parsed = Papa.parse<any>(csvString, { skipEmptyLines: true, header: true })
    const locales = parsed.meta.fields!.filter(prop => prop.match(/^\w{2}(?:-\w{2})?$/))
    let parsedData = parsed.data.filter((row) => {
      if (!isEmptyCell(row[resolvedOptions.keyColumn]))
        return true

      ++emptyKeySkipped
      return false
    })

    if (emptyKeySkipped)
      logger.info(`[sheetI18n] ${relativePath}: ${emptyKeySkipped} rows with empty key skipped`)

    // TODO: minor: optimize special processors to use a same filter pass
    // jsonProcessor
    if (resolvedOptions.jsonProcessor) {
      const filtered = _jsonProcessor({ data: parsedData, relativePath, pathParsed, locales })

      if (resolvedOptions.jsonProcessorClean)
        parsedData = filtered
    }

    // fileProcessor
    if (resolvedOptions.fileProcessor) {
      const filtered = _fileProcessor({ data: parsedData, relativePath, pathParsed, locales })

      if (resolvedOptions.fileProcessorClean)
        parsedData = filtered
    }

    const outputs: Record<string, ReturnType<typeof transformToI18n>> = {}
    if (resolvedOptions.valueColumn) {
      outputs[`${path.resolve(resolvedOutDir || pathParsed.dir, pathParsed.name)}.json`] = transformToI18n(parsedData, resolvedOptions.keyColumn, resolvedOptions.valueColumn, resolvedOptions.keyStyle, resolvedOptions)
    }
    else {
      if (!locales?.length)
        return logger.error('[sheetI18n] cannot detect any locales column, maybe you need to use valueColumn?')

      locales.forEach((locale) => {
        outputs[`${path.resolve(resolvedOutDir || pathParsed.dir, locale)}.json`] = transformToI18n(parsedData, resolvedOptions.keyColumn, locale, resolvedOptions.keyStyle, resolvedOptions)
      })
    }

    Object.entries(outputs).forEach(([path, content]) => {
      if (!content)
        logger.warn(`[sheetI18n] empty content for ${path}`)

      ;(resolvedOptions.mergeOutput ? outputWriteMerge : outputFileSync)(path, content ? JSON.stringify(content, undefined, 2) : '')
    })
  }

  async function scanConvert() {
    const files = scanFiles(root).filter(filter)
    for (const file of files)
      await convert(file)
  }

  interface _JsonProcessorProps {
    data: Record<any, any>[]
    pathParsed: ParsedPath
    relativePath: string
    locales: string[]
  }
  function _jsonProcessor({ data, relativePath, pathParsed, locales }: _JsonProcessorProps) {
    const jsons: any = {}
    // eslint-disable-next-line array-callback-return
    const filtered = data.filter((row) => {
      const keyCell: string = row[resolvedOptions.keyColumn!]
      if (!keyCell.startsWith('$JSON;'))
        return true

      if (!locales.length)
        return false

      const parseCell: any[] = keyCell.replace(/^\$JSON;/, '').split(';')

      if (parseCell.length !== 4 || !parseCell.every(Boolean))
        return logger.error(`[sheetI18n] ${relativePath}: Invalid $JSON cell: ${keyCell}`)

      const rawSelectors = parseCell[1]
      parseCell[1] = rawSelectors.split(',').map((v: string) => v.split(':'))

      const [id, selectors, path, key] = parseCell

      const selectorKeys = selectors.map((v: [string, string]) => v[0])

      if (!jsons[id]?.[rawSelectors]) {
        objectSet(jsons, [id, rawSelectors], {
          __selectorKeys: selectorKeys,
        })
      }

      const obj = jsons[id][rawSelectors]

      selectors.forEach(([k, v]: string[]) => {
        objectSet(obj, k, v)
      })

      locales.forEach((locale) => {
        const value = row[locale]

        if (!value)
          return

        objectSet(obj, [...path.split('.'), 'i18n', locale, key], resolvedOptions.replacePunctuationSpace ? replacePunctuationSpace(value) : value)
      })
    })

    if (Object.keys(jsons).length) {
      Object.keys(jsons).forEach((k) => {
        outputFileSync(`${path.resolve(resolvedOutDir || pathParsed.dir, k)}.json`, JSON.stringify(Object.values(jsons[k]), undefined, 2))
      })
      logger.info(`[sheetI18n] ${relativePath}: Special $JSON keys processed`)
    }

    return filtered
  }

  interface _FileProcessorProps {
    data: Record<any, any>[]
    pathParsed: ParsedPath
    relativePath: string
    locales: string[]
  }
  function _fileProcessor({ data, relativePath, pathParsed, locales }: _FileProcessorProps) {
    const files: any = {}
    // eslint-disable-next-line array-callback-return
    const filtered = data.filter((row) => {
      const keyCell: string = row[resolvedOptions.keyColumn!]
      if (!keyCell.startsWith('$FILE;'))
        return true

      if (!locales.length)
        return false

      const parseCell: any[] = keyCell.replace(/^\$FILE;/, '').split(';')

      if (parseCell.length < 1 || parseCell.length > 2 || !parseCell.every(Boolean))
        return logger.error(`[sheetI18n] ${relativePath}: Invalid $FILE cell: ${keyCell}`)

      const [filepath, extension = 'txt'] = parseCell

      locales.forEach((locale) => {
        const value = row[locale]

        if (!value)
          return

        objectSet(files, [`${filepath}_${locale}.${extension}`], resolvedOptions.replacePunctuationSpace ? replacePunctuationSpace(value) : value)
      })
    })

    if (Object.keys(files).length) {
      Object.keys(files).forEach((k) => {
        outputFileSync(`${path.resolve(resolvedOutDir || pathParsed.dir, k)}`, files[k])
      })
      logger.info(`[sheetI18n] ${relativePath}: Special $FILE keys processed`)
    }

    return filtered
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

// Build a object based on an array of objects with provided key/value column
function transformToI18n(array: Record<any, any>[], keyCol: string, valueCol: string, keyStyle: Options['keyStyle'], options: { replacePunctuationSpace?: boolean } = {}) {
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

function isEmptyCell(cellValue: string, quoteChar: string = '"') {
  return !cellValue || (
    quoteChar && cellValue === quoteChar.repeat(2)
  )
}

// CREDIT: took from somewhere in vHeemstra/vite-plugin-imagemin
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
