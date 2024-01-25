import type { FilterPattern } from 'vite'

export interface Options {
  /**
   * Default sheetI18n include i18n.csv file only,
   *
   * You could use this template to include spreadsheets: /(?:\/|\\|^)i18n.(?:csv|xls[xmb]?|ods)$/
   * @default /(?:\/|\\|^)i18n.(?:csv)$/
   */
  include?: FilterPattern

  /**
   * @default undefined
   */
  exclude?: FilterPattern

  /**
   * Output directory, same directory as source file if undefined
   * @default undefined
   */
  outDir?: string

  /**
   * Output file key style format
   * @default 'flat'
   */
  keyStyle?: 'flat' | 'nested'

  /**
   * Enable .xls[xmb]? and .ods support, multi-sheets is also supported,
   *
   * ie: sheetI18n will merge all sheets into one
   * @default false
   */
  xlsx?: boolean

  /**
   * Column name to use as key/id
   * @default 'KEY'
   */
  keyColumn?: string

  /**
   * By default sheetI18n will automatically parses and output fileName as localeId-alike columns (en, FR, vi-VN...),
   *
   * Defining a valueColumn will uses that column as value and output as same input fileName: `ha.csv => ha.json`
   *
   * @default undefined
   */
  valueColumn?: string

  /**
   * A string that indicates a comment (for example, "#" or "//").
   *
   * When the parser encounters a line starting with this string, it will skip the line.
   * @default '//'
   */
  comments?: false | string | string[]

  /**
   * // TODO: documents this
   * Enables special processing for $JSON keys
   *
   * jsonProcessor will always work in auto locale columns mode, and exported file will be 'flat'
   *
   * @default false
   */
  jsonProcessor?: boolean

  /**
   * Filter $JSON keys from the normal processing logic
   *
   * Effective only if `jsonProcessor` is enabled
   *
   * @default true
   */
  jsonProcessorClean?: boolean
}
