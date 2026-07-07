import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Injects the theme's real css/style.css (the one Drupal serves in
// production) into the dev server's index.html via Vite's /@fs/ mechanism,
// so `npm run dev` always reflects the actual stylesheet without keeping a
// second, hand-maintained copy in sync. Only runs for `vite dev`: this hook
// isn't invoked during `vite build` since index.html isn't a build input.
function injectThemeCss() {
  const cssPath = resolve(__dirname, '../css/style.css')
  return {
    name: 'inject-theme-css',
    transformIndexHtml(html) {
      return html.replace('</head>', `<link rel="stylesheet" href="/@fs${cssPath}" /></head>`)
    }
  }
}

export default defineConfig({
  plugins: [vue(), injectThemeCss()],
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
        entryFileNames: 'app.js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
})
