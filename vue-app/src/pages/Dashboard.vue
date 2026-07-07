<template>
  <section>
    <h1 class="page-title">Tableau de bord</h1>
    <p class="page-lead">Vue d'ensemble de la gestion des élèves du collège.</p>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-card__value">
          <span v-if="loading">…</span>
          <span v-else-if="error">—</span>
          <span v-else>{{ totalInscrits }}</span>
        </div>
        <div class="stat-card__label">Élèves inscrits (année en cours)</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__value">6</div>
        <div class="stat-card__label">Modules de gestion disponibles</div>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

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
import { getInscriptions } from '../services/api.js'

const totalInscrits = ref(0)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const { data } = await getInscriptions({ limit: 1 })
    totalInscrits.value = data.total || 0
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
  margin: 0 0 24px;
  color: var(--color-text-muted);
  font-size: 14px;
}

.stats {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
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

.error {
  color: #dc2626;
  font-size: 13px;
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
