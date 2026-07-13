import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    tailwindcss(),
    viteReact(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'favicon-96x96.png',
        'apple-touch-icon.png',
        'apple-touch-icon-v2.png',
        'manifest.json',
        'catafy-logo.png',
        'icons/*.png',
      ],
      // Plugin-generated manifest is broken on Vite 8 / Rolldown:
      // it injects <link rel="manifest"> but never emits the file.
      manifest: false,
      injectRegister: false,
    }),
  ],
})

export default config


