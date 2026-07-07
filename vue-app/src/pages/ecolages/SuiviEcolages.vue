<template>
  <section>
    <div class="page-header">
      <h1 class="page-title">Suivi des ecolages</h1>
    </div>

    <div class="list-card">
      <div class="list-toolbar">
        <input
          v-model="search"
          type="search"
          placeholder="Rechercher un élève..."
          @input="onSearchInput"
        />
        <span class="total">{{ total }} paiement(s)</span>
      </div>

      <p v-if="error" class="list-error">{{ error }}</p>
      <p v-else-if="loading" class="list-loading">Chargement...</p>

      <ul v-else class="student-list">
        <ClickableListItem v-for="item in items" :key="item.id" :to="`/app/suivi-ecolages/${item.id}`">
          <div class="student-avatar" :class="statusClass(item.status)">{{ item.mois?.slice(0, 2) }}</div>
          <div class="student-list-item__info">
            <div class="student-list-item__name">{{ item.eleve || '—' }}</div>
            <div class="student-list-item__meta">
              <span>{{ item.mois }}</span>
              <span class="dot">•</span>
              <span>{{ item.montant.toLocaleString('fr-FR') }} Ar</span>
              <span class="dot">•</span>
              <span>{{ item.annee_scolaire }}</span>
            </div>
          </div>
          <span class="student-badge" :class="statusClass(item.status)">{{ item.status_label }}</span>
          <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </ClickableListItem>
        <li v-if="items.length === 0" class="list-empty">Aucun paiement trouvé.</li>
      </ul>

      <div ref="sentinelRef" class="list-sentinel">
        <span v-if="loadingMore" class="list-loading-more">Chargement de plus de paiements...</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getEcolages } from '../../services/api.js'
import { useInfiniteList } from '../../composables/useInfiniteList.js'
import ClickableListItem from '../../components/ClickableListItem.vue'

const search = ref('')

const { items, total, loading, loadingMore, error, sentinelRef, reload } = useInfiniteList(
  async (params) => (await getEcolages(params)).data,
  { getParams: () => ({ search: search.value }) }
)

let searchTimeout = null

function onSearchInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(reload, 300)
}

function statusClass(status) {
  const value = String(status)
  if (value === '1' || value === '3') return 'is-paid'
  if (value === '2') return 'is-partial'
  if (value === '-1') return 'is-cancelled'
  return 'is-unpaid'
}

onMounted(reload)
</script>

<style scoped>
.student-avatar.is-paid {
  background: #dcfce7;
  color: #16a34a;
}

.student-avatar.is-partial {
  background: #dbeafe;
  color: #2563eb;
}

.student-avatar.is-unpaid {
  background: #fee2e2;
  color: #dc2626;
}

.student-avatar.is-cancelled {
  background: var(--color-bg);
  color: var(--color-text-muted);
}

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
