import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

document.addEventListener('DOMContentLoaded', () => {
  const el = document.querySelector('#vue-app')
  if (el) {
    createApp(App).use(router).mount('#vue-app')
  }
})
