<template>
  <section>
    <div class="page-header">
      <button type="button" class="btn-back" @click="$router.back()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Retour
      </button>
    </div>

    <p v-if="loading" class="list-loading">Chargement...</p>
    <p v-else-if="error" class="list-error">{{ error }}</p>

    <template v-else-if="item">
      <div class="detail-card">
        <h1 class="detail-name">{{ item.eleve || '—' }}</h1>
        <div class="detail-meta">
          <span class="student-badge" :class="statusClass(item.status)">{{ item.status_label }}</span>
          <span>{{ item.mois }} · {{ item.annee_scolaire }}</span>
        </div>
      </div>

      <div class="detail-card">
        <h2 class="detail-section-title">Détails du paiement</h2>
        <div class="detail-grid">
          <div class="detail-row">
            <span class="detail-label">Montant</span>
            <span class="detail-value">{{ item.montant.toLocaleString('fr-FR') }} Ar</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Mois</span>
            <span class="detail-value">{{ item.mois }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Année scolaire</span>
            <span class="detail-value">{{ item.annee_scolaire }}</span>
          </div>
          <div class="detail-row" v-if="item.description">
            <span class="detail-label">Description</span>
            <span class="detail-value">{{ item.description }}</span>
          </div>
        </div>
        <div class="form-actions" style="justify-content: flex-start; margin-top: 20px;" v-if="item.inscrit_nid">
          <router-link :to="`/app/eleves-inscrits/${item.inscrit_nid}`" class="btn-secondary" style="text-decoration: none; display: inline-block;">
            Voir l'inscription
          </router-link>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getEcolageDetail } from '../../services/api.js'

const route = useRoute()
const item = ref(null)
const loading = ref(true)
const error = ref('')

function statusClass(status) {
  const value = String(status)
  if (value === '1' || value === '3') return 'is-paid'
  if (value === '2') return 'is-partial'
  if (value === '-1') return 'is-cancelled'
  return 'is-unpaid'
}

onMounted(async () => {
  try {
    const { data } = await getEcolageDetail(route.params.id)
    item.value = data.item
  } catch (e) {
    error.value = e.response?.data?.message || "Impossible de charger l'écolage : " + e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.student-badge.is-paid {
  background: #dcfce7;
  color: #16a34a;
}

.student-badge.is-partial {
  background: #dbeafe;
  color: #2563eb;
}

.student-badge.is-unpaid {
  background: #fee2e2;
  color: #dc2626;
}

.student-badge.is-cancelled {
  background: var(--color-bg);
  color: var(--color-text-muted);
}
</style>
