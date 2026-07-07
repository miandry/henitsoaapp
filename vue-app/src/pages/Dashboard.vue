<template>
  <section>
    <h1 class="page-title">Tableau de bord</h1>
    <p class="page-lead">Vue d'ensemble de la gestion des élèves du collège.</p>

    <div v-if="anneeScolaire" class="school-year-banner">
      <span class="school-year-banner__label">Année scolaire en cours</span>
      <strong class="school-year-banner__value">{{ anneeScolaire }}</strong>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-card__value">
          <span v-if="loading">…</span>
          <span v-else-if="error">—</span>
          <span v-else>{{ totalInscrits }}</span>
        </div>
        <div class="stat-card__label">Élèves inscrits{{ anneeScolaire ? ` (${anneeScolaire})` : '' }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__value">
          <span v-if="loading">…</span>
          <span v-else-if="error">—</span>
          <span v-else>{{ nouveauxEtudiants }}</span>
        </div>
        <div class="stat-card__label">Nouveaux élèves</div>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="!loading && !error" class="groups-grid">
      <div class="group-card">
        <h2 class="group-card__title">Par genre</h2>
        <ul class="group-list">
          <li v-for="row in parGenre" :key="row.key" class="group-list__row">
            <span class="group-list__label">{{ row.label }}</span>
            <span class="group-list__count">{{ row.count }}</span>
          </li>
          <li v-if="!parGenre.length" class="group-list__empty">Aucune donnée</li>
        </ul>
      </div>

      <div class="group-card">
        <h2 class="group-card__title">Par adresse</h2>
        <ul class="group-list">
          <li v-for="row in parAdresse" :key="row.adresse" class="group-list__row">
            <span class="group-list__label">{{ row.adresse }}</span>
            <span class="group-list__count">{{ row.count }}</span>
          </li>
          <li v-if="!parAdresse.length" class="group-list__empty">Aucune donnée</li>
        </ul>
      </div>
    </div>

    <div v-if="!loading && !error && nouveauxItems.length" class="preview-card">
      <div class="preview-card__header">
        <h2 class="preview-card__title">Nouveaux élèves</h2>
        <router-link to="/app/archives-eleves" class="preview-card__link">Voir les fiches</router-link>
      </div>
      <ul class="preview-list">
        <li v-for="item in nouveauxItems" :key="item.id">
          <router-link :to="`/app/archives-eleves/${item.id}`" class="preview-list__item">
            <img v-if="item.photo_url" :src="item.photo_url" :alt="studentName(item)" class="preview-list__avatar preview-list__avatar--photo" />
            <div v-else class="preview-list__avatar">{{ initials(studentName(item)) }}</div>
            <div class="preview-list__info">
              <div class="preview-list__name">{{ studentName(item) }}</div>
              <div class="preview-list__meta">
                <span class="student-badge">{{ item.classe || '—' }}</span>
                <span v-if="item.adresse" class="dot">•</span>
                <span v-if="item.adresse">{{ item.adresse }}</span>
              </div>
            </div>
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </router-link>
        </li>
      </ul>
    </div>

    <div v-if="!loading && !error && previewItems.length" class="preview-card">
      <div class="preview-card__header">
        <h2 class="preview-card__title">Aperçu des inscriptions</h2>
        <router-link to="/app/eleves-inscrits" class="preview-card__link">Voir tout</router-link>
      </div>
      <ul class="preview-list">
        <li v-for="item in previewItems" :key="item.id">
          <router-link :to="`/app/eleves-inscrits/${item.id}`" class="preview-list__item">
            <img v-if="item.photo_url" :src="item.photo_url" :alt="item.matricule" class="preview-list__avatar preview-list__avatar--photo" />
            <div v-else class="preview-list__avatar">{{ initials(item.matricule) }}</div>
            <div class="preview-list__info">
              <div class="preview-list__name">{{ item.matricule }}</div>
              <div class="preview-list__meta">
                <span class="student-badge">{{ item.classe || '—' }}</span>
              </div>
            </div>
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </router-link>
        </li>
      </ul>
    </div>

    <div class="shortcuts">
      <router-link to="/app/eleves-inscrits" class="shortcut-card">
        <strong>Les Eleves inscript</strong>
        <span>Consulter et rechercher les inscriptions</span>
      </router-link>
      <router-link to="/app/gestion-ecolages" class="shortcut-card">
        <strong>Gestion des ecolages</strong>
        <span>Suivre les frais de scolarité par mois</span>
      </router-link>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDashboardStats } from '../services/api.js'

const anneeScolaire = ref('')
const totalInscrits = ref(0)
const nouveauxEtudiants = ref(0)
const parGenre = ref([])
const parAdresse = ref([])
const nouveauxItems = ref([])
const previewItems = ref([])
const loading = ref(true)
const error = ref('')

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
}

function studentName(item) {
  return [item.nom, item.prenom].filter(Boolean).join(' ').trim() || item.matricule || 'Sans nom'
}

onMounted(async () => {
  try {
    const { data } = await getDashboardStats()
    anneeScolaire.value = data.annee_scolaire || ''
    totalInscrits.value = data.total_inscrits || 0
    nouveauxEtudiants.value = data.nouveaux_etudiants || 0
    parGenre.value = data.par_genre || []
    parAdresse.value = data.par_adresse || []
    nouveauxItems.value = data.nouveaux_items || []
    previewItems.value = data.preview_items || []
  } catch (e) {
    error.value = "Impossible de charger les statistiques : " + e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-title {
  margin: 0 0 4px;
  font-size: 22px;
}

.page-lead {
  margin: 0 0 16px;
  color: var(--color-text-muted);
  font-size: 14px;
}

.school-year-banner {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: var(--color-primary-light);
  border: 1px solid rgba(176, 36, 44, 0.15);
  border-radius: var(--radius);
}

.school-year-banner__label {
  font-size: 12px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.school-year-banner__value {
  font-size: 18px;
  color: var(--color-primary);
}

.stats {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  padding: 18px 20px;
  min-width: 220px;
}

.stat-card__value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-card__label {
  margin-top: 4px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.group-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.group-card__title {
  margin: 0;
  padding: 14px 16px;
  font-size: 15px;
  border-bottom: 1px solid var(--color-border);
}

.group-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.group-list__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
}

.group-list__row:last-child {
  border-bottom: none;
}

.group-list__label {
  min-width: 0;
  word-break: break-word;
}

.group-list__count {
  flex-shrink: 0;
  min-width: 28px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.group-list__empty {
  padding: 14px 16px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.error {
  color: #dc2626;
  font-size: 13px;
}

.preview-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
  overflow: hidden;
}

.preview-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
}

.preview-card__title {
  margin: 0;
  font-size: 15px;
}

.preview-card__link {
  font-size: 13px;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.preview-card__link:hover {
  text-decoration: underline;
}

.preview-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.preview-list__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid var(--color-border);
}

.preview-list__item:last-child {
  border-bottom: none;
}

.preview-list__item:hover {
  background: var(--color-bg);
}

.preview-list__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.preview-list__avatar--photo {
  object-fit: cover;
}

.preview-list__info {
  flex: 1;
  min-width: 0;
}

.preview-list__name {
  font-size: 14px;
  font-weight: 600;
}

.preview-list__meta {
  margin-top: 2px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.shortcuts {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.shortcut-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px;
  min-width: 240px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
}

.shortcut-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.shortcut-card span {
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>
