<template>
  <div class="shell">
    <header class="shell__header">
      <button class="shell__burger" type="button" aria-label="Ouvrir le menu" @click="sidebarOpen = !sidebarOpen">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div class="shell__brand">
        <img class="shell__logo" :src="logoUrl" alt="Logo Collège Privé Henitsoa" />
        <div>
          <div class="shell__title">École Privée Henitsoa</div>
          <div class="shell__subtitle">Gestion des élèves du collège</div>
        </div>
      </div>
      <router-link
        v-if="!isLogged"
        class="shell__user-btn"
        to="/app/login"
        title="Se connecter"
        aria-label="Se connecter"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <path d="M10 17l5-5-5-5"></path>
          <path d="M15 12H3"></path>
        </svg>
      </router-link>
    </header>

    <div class="shell__body">
      <Sidebar :open="sidebarOpen" @navigate="sidebarOpen = false" />
      <div v-if="sidebarOpen" class="shell__backdrop" @click="sidebarOpen = false"></div>
      <main class="shell__content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import { getLoginStatus } from './services/api'

const sidebarOpen = ref(false)
const route = useRoute()
const logoUrl = '/sites/default/files/logo_henitsoa.jpeg'
const isLogged = ref(document.body.classList.contains('user-logged-in'))

async function refreshLoginState() {
  try {
    isLogged.value = await getLoginStatus()
  } catch (error) {
    isLogged.value = document.body.classList.contains('user-logged-in')
  }
}

onMounted(() => {
  refreshLoginState()
  window.addEventListener('auth-changed', refreshLoginState)
})

onUnmounted(() => {
  window.removeEventListener('auth-changed', refreshLoginState)
})

watch(() => route.path, () => {
  sidebarOpen.value = false
  refreshLoginState()
})
</script>

<style scoped>
.shell {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.shell__header {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 64px;
  flex-shrink: 0;
  padding: 0 24px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  z-index: 40;
}

.shell__user-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: var(--color-text);
  text-decoration: none;
}

.shell__user-btn:hover {
  background: var(--color-bg);
}

.shell__burger {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  border-radius: 8px;
  flex-shrink: 0;
}

.shell__burger:hover {
  background: var(--color-bg);
}

.shell__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shell__logo {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  object-fit: cover;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.shell__title {
  font-weight: 600;
  font-size: 15px;
  line-height: 1.2;
}

.shell__subtitle {
  font-size: 12px;
  color: var(--color-text-muted);
}

.shell__body {
  display: flex;
  flex: 1;
  min-height: 0;
  position: relative;
}

.shell__content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 28px 32px;
}

.shell__backdrop {
  display: none;
}

@media (max-width: 768px) {
  .shell__burger {
    display: flex;
  }

  .shell__backdrop {
    display: block;
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.4);
    z-index: 20;
  }

  .shell__content {
    padding: 20px 16px;
  }
}
</style>
