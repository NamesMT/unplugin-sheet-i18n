import type { ParseConfig } from 'papaparse'
import type { FilterPattern } from 'vite'

export interface Options {
  /**
   * Default sheetI18n include i18n.csv file only,
   *
   * You could use this template to include spreadsheets: /(?:\/|\\|^)i18n\.(?:[cdt]sv|xls[xmb]?|ods)$/
   * @default /(?:\/|\\|^)i18n\.(?:[cdt]sv)$/
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
   * The regular expression to match/detect locales columns
   * 
   * @default /^\w{2}(?:-\w{2,4})?$/
   */
  localesMatcher?: RegExp

  /**
   * Setting a custom delimiter for the dsv file, by default it's auto detected
   * 
   * @default undefined // auto-detect
   */
  delimiter?: ParseConfig['delimiter']

  /**
   * A string that indicates a comment (for example, "#" or "//").
   *
   * When the parser encounters a line starting with this string, it will skip the line.
   * @default '//'
   */
  comments?: false | string | string[]

  /**
   * Merge json output of processed files (if they output to same file)
   *
   * @default true
   */
  mergeOutput?: boolean

  /**
   * Merge files inputs or keep input path splitted if outDir specified
   *
   * @default true
   */
  mergeInput?: boolean

  /**
   * Replaces all spaces followed by a "high" punctuation with a non-breaking space, this is useful to fix ugly UI wrapping for cases like French that requires a space before the punctuations.
   *
   * Punctuations currently scan for is: !$%:;?+-
   *
   * @default true
   */
  replacePunctuationSpace?: boolean

  /**
   * Enables special processing for $JSON keys
   *
   * Key syntax: `$JSON;[fileName];[selectors];[path];[key]`  
   * 
   * Example:
   * ```txt
   * For a key:
   * $JSON;cloud;id:what;a.nested.path;display - What?
   * 
   * We will get a file: cloud_[locale] with the content:
   * """
   * [
   *  {
   *    "__selectorKeys": [
   *      "id"
   *    ],
   *    "id": "what",
   *    "a": {
   *      "nested": {
   *        "path": {
   *          "i18n": {
   *            "en": {
   *              "display": "What?"
   *            }
   *          }
   *        }
   *      }
   *    }
   *  }
   * ]
   * """
   * ```
   *
   * //TODO: add util for checking an object againts the outputted JSON array, util to load the internalization text from the outputted format
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

  /**
   * Enables special processing for $FILE keys
   * 
   * Key syntax: `$FILE;[fileName];[extension]`,  
   * extension is optional and defaults to 'txt'  
   * 
   * Example:
   * ```txt
   * For a key:
   * $FILE;hi_there;md - Halo
   * 
   * We will get a file: hi_there_[locale].md with the content: "Halo"
   * ```
   *
   * @default false
   */
  fileProcessor?: boolean

  /**
   * Filter $FILE keys from the normal processing logic
   *
   * Effective only if `fileProcessor` is enabled
   *
   * @default true
   */
  fileProcessorClean?: boolean
}