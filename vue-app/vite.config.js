import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

const THEME_BASE = '/themes/custom/henitsoaapp/dist/'

// Injects the theme's real css/style.css into the Vite dev server.
function injectThemeCss() {
  const cssPath = resolve(__dirname, '../css/style.css')
  return {
    name: 'inject-theme-css',
    transformIndexHtml(html) {
      return html.replace('</head>', `<link rel="stylesheet" href="/@fs${cssPath}" /></head>`)
    }
  }
}

// After build, rewrite henitsoaapp.libraries.yml to point at hashed ES module assets.
function writeDrupalLibraries() {
  return {
    name: 'write-drupal-libraries',
    writeBundle(_options, bundle) {
      const jsFile = Object.keys(bundle).find((name) => name.endsWith('.js') && bundle[name].isEntry)
      const cssFile = Object.keys(bundle).find((name) => name.endsWith('.css'))
      if (!jsFile) return

      const version = jsFile.replace(/[^a-zA-Z0-9]/g, '').slice(-12) || Date.now().toString(36)
      const yaml = `global:
  version: '${version}'
  js:
    dist/${jsFile}:
      preprocess: false
      minified: true
      attributes:
        type: module
  css:
    theme:
      css/style.css: {}
${cssFile ? `      dist/${cssFile}: { preprocess: false }` : ''}
  dependencies:
    - core/drupal
    - core/drupalSettings
`
      writeFileSync(resolve(__dirname, '../henitsoaapp.libraries.yml'), yaml)
    }
  }
}

export default defineConfig({
  plugins: [vue(), injectThemeCss(), writeDrupalLibraries()],
  // Critical for Drupal: lazy chunks must load from the theme dist path,
  // not from site-root /assets/...
  base: THEME_BASE,
  server: {
    fs: {
      allow: ['..']
    },
    proxy: {
      '/api': { target: 'http://henitsoa.local:8888', changeOrigin: true },
      '/session': { target: 'http://henitsoa.local:8888', changeOrigin: true },
      '/sites': { target: 'http://henitsoa.local:8888', changeOrigin: true }
    }
  },
  build: {
    outDir: resolve(__dirname, '../dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/main.js'),
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks(id) {
          if (id.includes('node_modules/chart.js')) {
            return 'chart'
          }
          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router') || id.includes('node_modules/axios')) {
            return 'vendor'
          }
        }
      }
    }
  }
})
