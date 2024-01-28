import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import SheetI18n from 'unplugin-sheet-i18n/vite'

export default defineConfig({
  plugins: [
    Inspect(),
    SheetI18n({
      outDir: 'test/otm/outDir/',
      jsonProcessor: true,
      fileProcessor: true,
    }),
  ],
})
