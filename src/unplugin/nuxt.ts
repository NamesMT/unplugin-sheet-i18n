import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from '@nuxt/kit'
import type { Options } from '../types'
import vite from './vite'
import webpack from './webpack'
import '@nuxt/schema'
import { defaultOptions } from '../context'

export interface ModuleOptions extends Options {

}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-unplugin-sheet-i18n',
    configKey: 'unpluginSheetI18n',
  },
  defaults: defaultOptions,
  setup(options, nuxt) {
    addVitePlugin(() => vite(options))
    addWebpackPlugin(() => webpack(options))

    // ...
  },
})
