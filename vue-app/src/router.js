import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './pages/Dashboard.vue'
import ElevesInscrits from './pages/eleves/ElevesInscrits.vue'
import InscriptionDetail from './pages/eleves/InscriptionDetail.vue'
import ArchivesEleves from './pages/eleves/ArchivesEleves.vue'
import ArchiveDetail from './pages/eleves/ArchiveDetail.vue'
import Classes from './pages/classes/Classes.vue'
import ClasseDetail from './pages/classes/ClasseDetail.vue'
import Matieres from './pages/Matieres.vue'
import MatiereDetail from './pages/MatiereDetail.vue'
import GestionEcolages from './pages/ecolages/GestionEcolages.vue'
import SuiviEcolages from './pages/ecolages/SuiviEcolages.vue'
import EcolageDetail from './pages/ecolages/EcolageDetail.vue'
import ConfigCarnet from './pages/ConfigCarnet.vue'
import LoginPage from './pages/LoginPage.vue'

const routes = [
  { path: '/', redirect: '/app/dashboard' },
  { path: '/app', redirect: '/app/dashboard' },
  { path: '/app/login', name: 'login', component: LoginPage },
  { path: '/app/dashboard', name: 'dashboard', component: Dashboard },
  { path: '/app/eleves-inscrits', name: 'eleves-inscrits', component: ElevesInscrits },
  { path: '/app/eleves-inscrits/:id', name: 'inscription-detail', component: InscriptionDetail },
  { path: '/app/classes', name: 'classes', component: Classes },
  { path: '/app/classes/:id', name: 'classe-detail', component: ClasseDetail },
  { path: '/app/archives-eleves', name: 'archives-eleves', component: ArchivesEleves },
  { path: '/app/archives-eleves/:id', name: 'archive-detail', component: ArchiveDetail },
  { path: '/app/matieres', name: 'matieres', component: Matieres },
  { path: '/app/matieres/:id', name: 'matiere-detail', component: MatiereDetail },
  { path: '/app/gestion-ecolages', name: 'gestion-ecolages', component: GestionEcolages },
  { path: '/app/suivi-ecolages', name: 'suivi-ecolages', component: SuiviEcolages },
  { path: '/app/suivi-ecolages/:id', name: 'ecolage-detail', component: EcolageDetail },
  { path: '/app/config-carnet', name: 'config-carnet', component: ConfigCarnet }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
