<template>
  <nav class="sidebar" :class="{ 'is-open': open }">
    <template v-for="item in items" :key="item.path">
      <a
        v-if="item.external"
        :href="item.path"
        class="sidebar__item"
        @click="$emit('navigate')"
      >
        <span v-if="item.icon" class="sidebar__icon" v-html="item.icon"></span>
        <span class="sidebar__label">{{ item.label }}</span>
      </a>
      <router-link
        v-else
        :to="item.path"
        class="sidebar__item"
        :class="{ 'is-active': isActive(item.path) }"
        @click="$emit('navigate')"
      >
        <span v-if="item.icon" class="sidebar__icon" v-html="item.icon"></span>
        <span class="sidebar__label">{{ item.label }}</span>
      </router-link>
    </template>
  </nav>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getLoginStatus } from '../services/api'

defineProps({
  open: { type: Boolean, default: false }
})
defineEmits(['navigate'])

const route = useRoute()

const icons = {
  dashboard: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  eleves: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  classes: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>',
  archives: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/><path d="M10 13h4"/></svg>',
  matieres: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  ecolageGestion: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
  ecolageSuivi: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15l4-6 3 4 5-7"/></svg>',
  config: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
  login: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg>',
  logout: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>'
}

const baseItems = [
  { path: '/app/dashboard', label: 'Tableau de bord', icon: icons.dashboard },
  { path: '/app/eleves-inscrits', label: 'Les Eleves inscript', icon: icons.eleves },
  { path: '/app/classes', label: 'Les classes', icon: icons.classes },
  { path: '/app/archives-eleves', label: 'Les archives des élèves', icon: icons.archives },
  { path: '/app/matieres', label: 'Les matieres', icon: icons.matieres },
  { path: '/app/gestion-ecolages', label: 'Gestion des ecolages', icon: icons.ecolageGestion },
  { path: '/app/suivi-ecolages', label: 'Suivi des ecolages', icon: icons.ecolageSuivi },
  { path: '/app/config-carnet', label: 'Config carnet', icon: icons.config }
]

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

const items = computed(() => {
  const authItem = isLogged.value
    ? { path: '/user/logout?destination=/app/login', label: 'Deconnexion', icon: '', external: true }
    : { path: '/app/login', label: 'Login', icon: icons.login }
  return [...baseItems, authItem]
})

function isActive(path) {
  return route.path === path
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 260px;
  flex-shrink: 0;
  padding: 20px 12px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  gap: 2px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.sidebar__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border-left: 3px solid transparent;
}

.sidebar__item:hover {
  background: var(--color-bg);
  color: var(--color-text);
}

.sidebar__item.is-active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-left-color: var(--color-primary);
}

.sidebar__icon {
  display: flex;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 64px;
    left: 0;
    bottom: 0;
    z-index: 30;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: var(--shadow-md);
    overflow-y: auto;
  }

  .sidebar.is-open {
    transform: translateX(0);
  }
}
</style>
