<template>
  <section class="dashboard">
    <header class="dashboard__header">
      <div>
        <h1 class="page-title">Tableau de bord</h1>
        <p class="page-lead">Qu'est-ce qui a besoin de votre attention aujourd'hui ?</p>
      </div>
      <div v-if="anneeScolaire" class="school-year-banner">
        <span class="school-year-banner__label">Année scolaire</span>
        <strong class="school-year-banner__value">{{ anneeScolaire }}</strong>
      </div>
    </header>

    <p v-if="loading" class="dashboard__loading">Chargement du tableau de bord...</p>
    <p v-else-if="error" class="dashboard__error">{{ error }}</p>

    <template v-else>
      <QuickActions />

      <StatsCards :stats="keyStats" :par-classe="parClasse" />

      <div class="dashboard__grid dashboard__grid--alerts">
        <AlertsPanel :alerts="alerts" />
        <RecentActivity :items="activite" />
      </div>

      <div class="dashboard__grid dashboard__grid--charts">
        <EnrollmentChart :items="parClasse" />
        <GenderChart :items="parGenre" />
        <EnrollmentTrendChart :items="evolution" />
      </div>

      <FinancesPanel :finances="finances" />

      <div v-if="nouveauxItems.length" class="preview-section">
        <div class="preview-section__header">
          <h2>Nouveaux élèves</h2>
          <router-link to="/app/archives-eleves">Voir les fiches</router-link>
        </div>
        <ul class="preview-list">
          <li v-for="item in nouveauxItems" :key="item.id">
            <router-link :to="`/app/archives-eleves/${item.id}`" class="preview-list__item">
              <span class="preview-list__name">{{ studentName(item) }}</span>
              <span class="preview-list__meta">{{ item.classe || '—' }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDashboardStats } from '../services/api.js'
import StatsCards from '../components/dashboard/StatsCards.vue'
import AlertsPanel from '../components/dashboard/AlertsPanel.vue'
import EnrollmentChart from '../components/dashboard/EnrollmentChart.vue'
import GenderChart from '../components/dashboard/GenderChart.vue'
import EnrollmentTrendChart from '../components/dashboard/EnrollmentTrendChart.vue'
import FinancesPanel from '../components/dashboard/FinancesPanel.vue'
import QuickActions from '../components/dashboard/QuickActions.vue'
import RecentActivity from '../components/dashboard/RecentActivity.vue'

const loading = ref(true)
const error = ref('')
const anneeScolaire = ref('')
const keyStats = ref({})
const parClasse = ref([])
const parGenre = ref([])
const evolution = ref([])
const alerts = ref([])
const finances = ref({})
const activite = ref([])
const nouveauxItems = ref([])

function studentName(item) {
  return [item.nom, item.prenom].filter(Boolean).join(' ').trim() || item.matricule
}

onMounted(async () => {
  try {
    const { data } = await getDashboardStats()
    anneeScolaire.value = data.annee_scolaire || ''
    keyStats.value = data.key_stats || {}
    parClasse.value = data.par_classe || []
    parGenre.value = data.par_genre || []
    evolution.value = data.inscriptions_evolution || []
    alerts.value = data.alerts || []
    finances.value = data.finances || {}
    activite.value = data.activite_recente || []
    nouveauxItems.value = data.nouveaux_items || []
  } catch (e) {
    error.value = "Impossible de charger le tableau de bord : " + e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.page-title {
  margin: 0 0 4px;
  font-size: 22px;
}

.page-lead {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 14px;
}

.school-year-banner {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  background: var(--color-accent-light);
  border: 1px solid rgba(232, 172, 58, 0.35);
  border-radius: var(--radius);
}

.school-year-banner__label {
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.school-year-banner__value {
  font-size: 16px;
  color: #92400e;
}

.dashboard__loading {
  color: var(--color-text-muted);
  font-size: 14px;
}

.dashboard__error {
  color: #dc2626;
  font-size: 14px;
}

.dashboard__grid {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
}

.dashboard__grid--alerts {
  grid-template-columns: 1.2fr 1fr;
}

.dashboard__grid--charts {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.preview-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  margin-bottom: 20px;
  overflow: hidden;
}

.preview-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
}

.preview-section__header h2 {
  margin: 0;
  font-size: 15px;
}

.preview-section__header a {
  font-size: 13px;
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}

.preview-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.preview-list__item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
}

.preview-list__item:hover {
  background: var(--color-bg);
}

.preview-list__meta {
  color: var(--color-text-muted);
  font-size: 12px;
}

@media (max-width: 900px) {
  .dashboard__grid--alerts {
    grid-template-columns: 1fr;
  }
}
</style>
