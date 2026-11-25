import { createRouter, createWebHistory } from 'vue-router'
import { getLoginStatus } from './services/api.js'

const routes = [
  { path: '/', redirect: '/app/dashboard' },
  { path: '/app', redirect: '/app/dashboard' },
  {
    path: '/app/dashboard',
    name: 'dashboard',
    component: () => import('./pages/Dashboard.vue')
  },
  {
    path: '/app/eleves-inscrits',
    name: 'eleves-inscrits',
    component: () => import('./pages/eleves/ElevesInscrits.vue')
  },
  {
    path: '/app/eleves-inscrits/:id',
    name: 'inscription-detail',
    component: () => import('./pages/eleves/InscriptionDetail.vue')
  },
  {
    path: '/app/classes',
    name: 'classes',
    component: () => import('./pages/classes/Classes.vue')
  },
  {
    path: '/app/classes/:id',
    name: 'classe-detail',
    component: () => import('./pages/classes/ClasseDetail.vue')
  },
  {
    path: '/app/archives-eleves',
    name: 'archives-eleves',
    component: () => import('./pages/eleves/ArchivesEleves.vue')
  },
  {
    path: '/app/archives-eleves/:id/edit',
    name: 'archive-edit',
    component: () => import('./pages/eleves/ArchiveEdit.vue')
  },
  {
    path: '/app/archives-eleves/:id',
    name: 'archive-detail',
    component: () => import('./pages/eleves/ArchiveDetail.vue')
  },
  {
    path: '/app/matieres',
    name: 'matieres',
    component: () => import('./pages/Matieres.vue')
  },
  {
    path: '/app/matieres/:id',
    name: 'matiere-detail',
    component: () => import('./pages/MatiereDetail.vue')
  },
  {
    path: '/app/gestion-ecolages',
    name: 'gestion-ecolages',
    component: () => import('./pages/ecolages/GestionEcolages.vue')
  },
  {
    path: '/app/suivi-ecolages',
    name: 'suivi-ecolages',
    component: () => import('./pages/ecolages/SuiviEcolages.vue')
  },
  {
    path: '/app/suivi-ecolages/:id',
    name: 'ecolage-detail',
    component: () => import('./pages/ecolages/EcolageDetail.vue')
  },
  {
    path: '/app/activites',
    name: 'activites',
    component: () => import('./pages/activites/ActivitesList.vue')
  },
  {
    path: '/app/activites/:id',
    name: 'activite-detail',
    component: () => import('./pages/activites/ActiviteDetail.vue')
  },
  {
    path: '/app/config-carnet',
    name: 'config-carnet',
    component: () => import('./pages/ConfigCarnet.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

function redirectToDrupalLogin(destination) {
  const target = destination && destination.startsWith('/app')
    ? destination
    : '/app/dashboard'
  window.location.href = `/user/login?destination=${encodeURIComponent(target)}`
}

router.beforeEach(async (to) => {
  if (to.path === '/app/login') {
    redirectToDrupalLogin('/app/dashboard')
    return false
  }

  const isLogged = await getLoginStatus()
  if (!isLogged) {
    redirectToDrupalLogin(to.fullPath)
    return false
  }
  return true
})

export default router
