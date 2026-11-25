import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

function boot() {
  const el = document.querySelector('#vue-app')
  if (el) {
    createApp(App).use(router).mount('#vue-app')
  }
}

// ES modules are deferred: DOMContentLoaded may already have fired.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot)
} else {
  boot()
}
