import { defineBuildConfig } from 'unbuild'
import sharedConfig from './shared.config'

export default defineBuildConfig({
  // We can't rely automated config because: https://github.com/unjs/unbuild/issues/339
  entries: [
    // normal bundles
    'src/unplugin/index',
    'src/unplugin/vite',
    'src/unplugin/webpack',
    'src/unplugin/rollup',
    'src/unplugin/esbuild',
    'src/unplugin/nuxt',
    'src/types',

    // file-to-file (please use .mts for all of your files), currently mkdist uncontrollably generates .d.ts and .d.mts based on the original extension: .ts or .mts
    // {
    //   builder: 'mkdist',
    //   input: './src/',
    //   esbuild: { minify: true },
    // },
  ],
  declaration: 'node16',
  clean: true,
  rollup: {
    esbuild: {
      minify: true,
    },
  },
  ...sharedConfig,
})
