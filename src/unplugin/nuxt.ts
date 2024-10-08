import type { Options } from '../types'
import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from '@nuxt/kit'
import { defaultOptions } from '../context'
import vite from './vite'
import webpack from './webpack'
import '@nuxt/schema'

export interface ModuleOptions extends Options {

}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-unplugin-sheet-i18n',
    configKey: 'unpluginSheetI18n',
  },
  defaults: defaultOptions,
  setup(options, _nuxt) {
    addVitePlugin(() => vite(options))
    addWebpackPlugin(() => webpack(options))

    // ...
  },
})
