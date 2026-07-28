import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './pages/Dashboard.vue'
import ElevesInscrits from './pages/eleves/ElevesInscrits.vue'
import InscriptionDetail from './pages/eleves/InscriptionDetail.vue'
import ArchivesEleves from './pages/eleves/ArchivesEleves.vue'
import ArchiveDetail from './pages/eleves/ArchiveDetail.vue'
import ArchiveEdit from './pages/eleves/ArchiveEdit.vue'
import Classes from './pages/classes/Classes.vue'
import ClasseDetail from './pages/classes/ClasseDetail.vue'
import Matieres from './pages/Matieres.vue'
import MatiereDetail from './pages/MatiereDetail.vue'
import GestionEcolages from './pages/ecolages/GestionEcolages.vue'
import SuiviEcolages from './pages/ecolages/SuiviEcolages.vue'
import EcolageDetail from './pages/ecolages/EcolageDetail.vue'
import ConfigCarnet from './pages/ConfigCarnet.vue'
import ActivitesList from './pages/activites/ActivitesList.vue'
import ActiviteDetail from './pages/activites/ActiviteDetail.vue'
import LoginPage from './pages/LoginPage.vue'
import { getLoginStatus } from './services/api.js'

const routes = [
  { path: '/', redirect: '/app/dashboard' },
  { path: '/app', redirect: '/app/dashboard' },
  { path: '/app/login', name: 'login', component: LoginPage, meta: { public: true } },
  { path: '/app/dashboard', name: 'dashboard', component: Dashboard },
  { path: '/app/eleves-inscrits', name: 'eleves-inscrits', component: ElevesInscrits },
  { path: '/app/eleves-inscrits/:id', name: 'inscription-detail', component: InscriptionDetail },
  { path: '/app/classes', name: 'classes', component: Classes },
  { path: '/app/classes/:id', name: 'classe-detail', component: ClasseDetail },
  { path: '/app/archives-eleves', name: 'archives-eleves', component: ArchivesEleves },
  { path: '/app/archives-eleves/:id/edit', name: 'archive-edit', component: ArchiveEdit },
  { path: '/app/archives-eleves/:id', name: 'archive-detail', component: ArchiveDetail },
  { path: '/app/matieres', name: 'matieres', component: Matieres },
  { path: '/app/matieres/:id', name: 'matiere-detail', component: MatiereDetail },
  { path: '/app/gestion-ecolages', name: 'gestion-ecolages', component: GestionEcolages },
  { path: '/app/suivi-ecolages', name: 'suivi-ecolages', component: SuiviEcolages },
  { path: '/app/suivi-ecolages/:id', name: 'ecolage-detail', component: EcolageDetail },
  { path: '/app/activites', name: 'activites', component: ActivitesList },
  { path: '/app/activites/:id', name: 'activite-detail', component: ActiviteDetail },
  { path: '/app/config-carnet', name: 'config-carnet', component: ConfigCarnet }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const isPublic = to.matched.some((record) => record.meta.public)
  const isLogged = await getLoginStatus()

  if (!isPublic && !isLogged) {
    return {
      path: '/app/login',
      query: to.fullPath !== '/app/login' ? { redirect: to.fullPath } : undefined
    }
  }

  if (to.path === '/app/login' && isLogged) {
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : '/app/dashboard'
    return redirect.startsWith('/app') ? redirect : '/app/dashboard'
  }

  return true
})

export default router
