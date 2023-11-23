// TODO: make a personal utils package

export const oPathEscape = (str: string) => str.replaceAll('.', '`o\\.')
export const oPathUnescape = (str: string) => str.replaceAll('`o\\.', '.')

export function oPathStringToArray(string: string | string[]): string[] {
  if (!Array.isArray(string))
    string = string.toString().match(/(\\\.|[^.[\]])+/g) || []
  return string.map(oPathUnescape)
}

export function oGet(obj: any, path: string | string[], create?: boolean) {
  if (Object(obj) !== obj)
    return obj

  path = oPathStringToArray(path)

  return path.reduce((prev, curr) => {
    if (create && prev)
      prev[curr] = prev[curr] ?? {}

    return prev && prev[curr]
  }, obj || {})
}

export function oSet(obj: any, path: string | string[], value: any, create = true) {
  if (Object(obj) !== obj)
    return obj

  path = oPathStringToArray(path)

  const _path = path.splice(-1)[0]

  const _obj = oGet(obj, path, create)

  _obj[_path] = value

  return obj
}
