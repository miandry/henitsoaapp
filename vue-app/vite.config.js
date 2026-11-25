import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { writeFileSync } from 'fs'
import { createHash } from 'crypto'
import { readFileSync } from 'fs'

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

/**
 * Drupal-friendly build:
 * - Single classic IIFE bundle (dist/app.js) — no type=module, no chunk base-path issues
 *   (prod theme lives at /themes/henitsoaapp, local at /themes/custom/henitsoaapp).
 * - Stable filenames expected by production libraries.yml.
 * - Cache-bust via libraries version hash.
 */
function writeDrupalLibraries() {
  return {
    name: 'write-drupal-libraries',
    closeBundle() {
      const jsPath = resolve(__dirname, '../dist/app.js')
      let version = Date.now().toString(36)
      try {
        version = createHash('md5').update(readFileSync(jsPath)).digest('hex').slice(0, 12)
      } catch {
        // File may not exist yet in odd build states.
      }

      const yaml = `global:
  version: '${version}'
  js:
    dist/app.js: { preprocess: false, minified: true }
  css:
    theme:
      css/style.css: {}
      dist/assets/main.css: { preprocess: false }
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
  // Relative base keeps dynamic imports portable; with inlineDynamicImports
  // there are no extra chunks anyway.
  base: './',
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
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/main.js'),
      output: {
        format: 'iife',
        name: 'HenitsoaApp',
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/main.css'
          }
          return 'assets/[name][extname]'
        }
      }
    }
  }
})
