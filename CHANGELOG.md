# Changelog


## v0.3.5

[compare changes](https://github.com/namesmt/unplugin-sheet-i18n/compare/v0.3.4...v0.3.5)

### 🩹 Fixes

- **transformToI18n:** Skip empty value rows, fixes #3 ([#3](https://github.com/namesmt/unplugin-sheet-i18n/issues/3))

### 💅 Refactors

- Uses some common utils function from `@namesmt/utils` ([30ef9f2](https://github.com/namesmt/unplugin-sheet-i18n/commit/30ef9f2))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.3.4

[compare changes](https://github.com/namesmt/unplugin-sheet-i18n/compare/v0.3.3...v0.3.4)

### 🚀 Enhancements

- Skip rows with empty key, add some comments ([5b714d6](https://github.com/namesmt/unplugin-sheet-i18n/commit/5b714d6))
- Improve log with filename ([7b496d6](https://github.com/namesmt/unplugin-sheet-i18n/commit/7b496d6))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.3.3

[compare changes](https://github.com/namesmt/unplugin-sheet-i18n/compare/v0.3.2...v0.3.3)

### 🚀 Enhancements

- Re-implements manual filtering on `csvString`, support array of `comments` ([7d4fed4](https://github.com/namesmt/unplugin-sheet-i18n/commit/7d4fed4))

### ❤️ Contributors

- NamesMT ([@NamesMT](http://github.com/NamesMT))

## v0.3.2

[compare changes](https://github.com/namesmt/unplugin-sheet-i18n/compare/v0.3.1...v0.3.2)

### 🩹 Fixes

- Flat keyStyle breaking typo ([17df181](https://github.com/namesmt/unplugin-sheet-i18n/commit/17df181))

### ❤️ Contributors

- Trung Dang <trung.dangquoc@gameloft.com>

## v0.3.1

[compare changes](https://github.com/namesmt/unplugin-sheet-i18n/compare/v0.3.0...v0.3.1)

### 🚀 Enhancements

- Non-breaking error log for nested key exist ([b175a62](https://github.com/namesmt/unplugin-sheet-i18n/commit/b175a62))
- Non-breaking log for undefined content write ([5e78ef9](https://github.com/namesmt/unplugin-sheet-i18n/commit/5e78ef9))

### ❤️ Contributors

- Trung Dang <trung.dangquoc@gameloft.com>

## v0.3.0

[compare changes](https://github.com/namesmt/unplugin-sheet-i18n/compare/v0.2.2...v0.3.0)

### 🚀 Enhancements

- ⚠️  Add keyStyle option ([4682dce](https://github.com/namesmt/unplugin-sheet-i18n/commit/4682dce))

#### ⚠️ Breaking Changes

- ⚠️  Add keyStyle option ([4682dce](https://github.com/namesmt/unplugin-sheet-i18n/commit/4682dce))

### ❤️ Contributors

- Trung Dang <trung.dangquoc@gameloft.com>

## v0.2.2

[compare changes](https://github.com/namesmt/unplugin-sheet-i18n/compare/v0.2.1...v0.2.2)

### 🩹 Fixes

- Revert Papa.unparse() to sheetjs transforms (READ DESC) ([096a327](https://github.com/namesmt/unplugin-sheet-i18n/commit/096a327))

### ❤️ Contributors

- Trung Dang <trung.dangquoc@gameloft.com>

## v0.2.1

[compare changes](https://github.com/namesmt/unplugin-sheet-i18n/compare/v0.2.0...v0.2.1)

### 🚀 Enhancements

- Use `pathe` ([6fe7907](https://github.com/namesmt/unplugin-sheet-i18n/commit/6fe7907))
- Log more info ([38ad3b4](https://github.com/namesmt/unplugin-sheet-i18n/commit/38ad3b4))
- Use Papa.unparse for JSON to csvString ([a780a88](https://github.com/namesmt/unplugin-sheet-i18n/commit/a780a88))
- Collect header keys ([#1](https://github.com/namesmt/unplugin-sheet-i18n/pull/1))
- Implements a manual filter, ([#2](https://github.com/namesmt/unplugin-sheet-i18n/pull/2))

### 💅 Refactors

- Pass object for unparse instead of aoa ([f6be688](https://github.com/namesmt/unplugin-sheet-i18n/commit/f6be688))
- Remove old commented code ([a4893ba](https://github.com/namesmt/unplugin-sheet-i18n/commit/a4893ba))

### ❤️ Contributors

- Trung Dang <trung.dangquoc@gameloft.com>

## v0.2.0

[compare changes](https://github.com/namesmt/unplugin-sheet-i18n/compare/v0.1.3...v0.2.0)

### 💅 Refactors

- ⚠️  Switch logger to `unjs/consola` ([e4e1852](https://github.com/namesmt/unplugin-sheet-i18n/commit/e4e1852))

#### ⚠️ Breaking Changes

- ⚠️  Switch logger to `unjs/consola` ([e4e1852](https://github.com/namesmt/unplugin-sheet-i18n/commit/e4e1852))

### ❤️ Contributors

- Trung Dang <trung.dangquoc@gameloft.com>

## v0.1.3

[compare changes](https://github.com/namesmt/unplugin-sheet-i18n/compare/v0.1.2...v0.1.3)

### 🩹 Fixes

- `pino-pretty` not found ([b7b9a73](https://github.com/namesmt/unplugin-sheet-i18n/commit/b7b9a73))

### ❤️ Contributors

- Trung Dang <trung.dangquoc@gameloft.com>

## v0.1.2

[compare changes](https://github.com/namesmt/unplugin-sheet-i18n/compare/v0.1.1...v0.1.2)

### 🩹 Fixes

- IsColorSupported ([16f483a](https://github.com/namesmt/unplugin-sheet-i18n/commit/16f483a))

### 🏡 Chore

- Update deps ([b5c8894](https://github.com/namesmt/unplugin-sheet-i18n/commit/b5c8894))

### ❤️ Contributors

- Trung Dang <trung.dangquoc@gameloft.com>

## v0.1.1

[compare changes](https://github.com/namesmt/unplugin-sheet-i18n/compare/v0.0.1...v0.1.1)

### 🚀 Enhancements

- Config `std-env` and `pino-pretty` ([9230383](https://github.com/namesmt/unplugin-sheet-i18n/commit/9230383))
- Set up playground ([8a0ee04](https://github.com/namesmt/unplugin-sheet-i18n/commit/8a0ee04))
- Use path instead of custom function, + fix outDir ([798830c](https://github.com/namesmt/unplugin-sheet-i18n/commit/798830c))
- Update playground ([4ee2926](https://github.com/namesmt/unplugin-sheet-i18n/commit/4ee2926))

### 🩹 Fixes

- FixAll on save glitching ([4255213](https://github.com/namesmt/unplugin-sheet-i18n/commit/4255213))

### 🏡 Chore

- Bump to 0.1.0 because npm registry bug ([b4a68e0](https://github.com/namesmt/unplugin-sheet-i18n/commit/b4a68e0))
- Set moduleResolution to 'Bundler' ([ce00958](https://github.com/namesmt/unplugin-sheet-i18n/commit/ce00958))

### ❤️ Contributors

- Trung Dang <trung.dangquoc@gameloft.com>

## v0.0.1

[compare changes](https://github.com/namesmt/unplugin-sheet-i18n/compare/v0.0.0...v0.0.1)

