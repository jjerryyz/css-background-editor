// uno.config.ts
import { defineConfig } from 'unocss'
import presetIcons from '@unocss/preset-icons'
import { presetUno } from 'unocss/preset-uno'

export default defineConfig({
  content: {
    filesystem: [
      '**/*.{html,js,ts,jsx,tsx,vue,svelte,astro}',
    ]
  },
  // ...UnoCSS options
  presets: [
    presetUno(),
    presetIcons({ /* options */ }),
  ]
})