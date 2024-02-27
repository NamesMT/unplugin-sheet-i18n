# unplugin-sheet-i18n [![NPM version](https://img.shields.io/npm/v/unplugin-sheet-i18n?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-sheet-i18n)

**unplugin-sheet-i18n** enables doing your i18n in a [spread]sheet for a better collaborative experience with non-coders and maintainability.

## Features
- Supports CSV, DSV, Excel/Spreadsheets (XLS[XMB], ODT), powered by [SheetJS](https://sheetjs.com/) and [papaparse](https://www.papaparse.com/)
- File-to-file convert: `en.csv -> en.json`
- File-to-multiple convert: `i18n.csv -> en.json, vi.json, fr.json,...`
- Output merging: `i18n_a.csv + i18n_b.csv -> en.json`
- File generation: `i18n_files.csv -> cloud_en.json, cloud_fr.json, template_en.html, template_fr.html`
- And more!

## Usage
[>See a few examples usage here<](./playground)

### Install package:
```sh
# npm
npm install unplugin-sheet-i18n

# yarn
yarn add unplugin-sheet-i18n

# pnpm (recommended)
pnpm install unplugin-sheet-i18n
```

### Setup:
<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import SheetI18n from 'unplugin-sheet-i18n/vite'

export default defineConfig({
  plugins: [
    SheetI18n({ /* options */ }),
  ],
})
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import SheetI18n from 'unplugin-sheet-i18n/rollup'

export default {
  plugins: [
    SheetI18n({ /* options */ }),
  ],
}
```

<br></details>


<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-sheet-i18n/webpack')({ /* options */ })
  ]
}
```

<br></details>

<details>
<summary>Nuxt</summary><br>

```ts
// nuxt.config.js
export default defineNuxtConfig({
  modules: [
    ['unplugin-sheet-i18n/nuxt', { /* options */ }],
  ],
})
```

> This module works for both Nuxt 2 and [Nuxt Vite](https://github.com/nuxt/vite)

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      require('unplugin-sheet-i18n/webpack')({ /* options */ }),
    ],
  },
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'
import SheetI18n from 'unplugin-sheet-i18n/esbuild'

build({
  plugins: [SheetI18n()],
})
```

<br></details>

### Options:
[See Options](./src/types.ts)


## Roadmap

- [ ] Add example repos
- [ ] Add tests

## License

[MIT](./LICENSE) License © 2023 [NamesMT](https://github.com/NamesMT)
