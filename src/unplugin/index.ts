import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import type { ResolvedConfig } from 'vite'
import type { Options } from '../types.js'
import { createContext } from '../context.js'

export { createContext }

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options) => {
  let ctx = createContext(options)

  return {
    name: 'unplugin-csv-to-json',
    enforce: 'pre',
    vite: {
      async configResolved(config: ResolvedConfig) {
        if (ctx.root !== config.root) {
          ctx = createContext(options, config.root)
        }
      },
      async handleHotUpdate({ file }) {
        if (ctx.filter(file))
          await ctx.convert(file)
      },
    },
    async buildStart() {
      await ctx.init()
      await ctx.scanConvert()
    },
  }
}

export const unplugin = createUnplugin(unpluginFactory)

export default unplugin
