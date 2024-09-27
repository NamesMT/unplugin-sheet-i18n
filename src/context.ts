import * as fs from 'node:fs'
import type { ParsedPath } from 'node:path'
import path from 'pathe'
import defu from 'defu'
import { createFilter } from 'vite'
import { set_fs } from '@e965/xlsx'
import { process } from 'std-env'
import { objectSet } from '@namesmt/utils'
import Papa from 'papaparse'
import { logger } from './logger'
import type { Options } from './types'
import { isEmptyCell, outputFileSync, outputWriteMerge, readCsvFile, readXlsxFile, replacePunctuationSpace, scanFiles, transformToI18n } from './utils'

// Enabling xlsx readFile support with set_fs
set_fs(fs)

export const defaultOptions = {
  // eslint-disable-next-line regexp/no-useless-non-capturing-group
  include: /(?:\/|\\|^)i18n\.(?:[cdt]sv)$/,
  keyStyle: 'flat',
  keyColumn: 'KEY',
  localesMatcher: /^\w{2}(?:-\w{2,4})?$/,
  comments: '//',
  mergeOutput: true,
  mergeInput: true,
  replacePunctuationSpace: true,
  jsonProcessorClean: true,
  fileProcessorClean: true,
} satisfies Options

export function createContext(options: Options = {}, root = process.cwd!()) {
  const resolvedOptions = defu(options, defaultOptions)

  const filter = createFilter(resolvedOptions.include, resolvedOptions.exclude)

  const resolvedOutDir = resolvedOptions.outDir ? path.resolve(root, resolvedOptions.outDir!) : null
  const allowedExtensions = ['.csv', '.dsv']
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
    const resolvedOutDirFinal = resolvedOutDir && !resolvedOptions.mergeInput ? path.join(resolvedOutDir, path.basename(pathParsed.dir)) : resolvedOutDir

    if (!allowedExtensions.includes(pathParsed.ext))
      return logger.error(`[sheetI18n] unexpected extension: ${file}${spreadsheetExtensions.includes(pathParsed.ext) ? `, xlsx is not enabled.` : ''}`)

    // Read the file and convert to a csv string
    let csvString = /^.[cdt]sv$/.test(pathParsed.ext)
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
    const parsed = Papa.parse<any>(csvString, { skipEmptyLines: true, header: true, delimiter: resolvedOptions.delimiter })
    const locales = parsed.meta.fields!.filter(prop => prop.match(resolvedOptions.localesMatcher))
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
      outputs[`${path.resolve(resolvedOutDirFinal || pathParsed.dir, pathParsed.name)}.json`] = transformToI18n(parsedData, resolvedOptions.keyColumn, resolvedOptions.valueColumn, resolvedOptions.keyStyle, resolvedOptions)
    }
    else {
      if (!locales?.length)
        return logger.error('[sheetI18n] cannot detect any locales column, maybe you need to use valueColumn?')

      locales.forEach((locale) => {
        outputs[`${path.resolve(resolvedOutDirFinal || pathParsed.dir, locale)}.json`] = transformToI18n(parsedData, resolvedOptions.keyColumn, locale, resolvedOptions.keyStyle, resolvedOptions)
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

    const resolvedOutDirFinal = resolvedOutDir && !resolvedOptions.mergeInput ? path.join(resolvedOutDir, path.basename(pathParsed.dir)) : resolvedOutDir
    if (Object.keys(jsons).length) {
      Object.keys(jsons).forEach((k) => {
        outputFileSync(`${path.resolve(resolvedOutDirFinal || pathParsed.dir, k)}.json`, JSON.stringify(Object.values(jsons[k]), undefined, 2))
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

    const resolvedOutDirFinal = resolvedOutDir && !resolvedOptions.mergeInput ? path.join(resolvedOutDir, path.basename(pathParsed.dir)) : resolvedOutDir
    if (Object.keys(files).length) {
      Object.keys(files).forEach((k) => {
        outputFileSync(`${path.resolve(resolvedOutDirFinal || pathParsed.dir, k)}`, files[k])
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
