<template>
  <div class="stats-cards">
    <div
      class="stat-card"
      :class="{ 'stat-card--expandable': parClasse.length }"
      @mouseenter="showClasse = true"
      @mouseleave="showClasse = false"
      @click="showClasse = !showClasse"
    >
      <div class="stat-card__value">{{ stats.total_inscrits ?? 0 }}</div>
      <div class="stat-card__label">Élèves inscrits</div>
      <div v-if="showClasse && parClasse.length" class="stat-card__popover">
        <template v-for="row in parClasse" :key="row.classe">
          <router-link
            v-if="row.id"
            :to="`/app/classes/${row.id}`"
            class="stat-card__popover-row stat-card__popover-row--link"
            @click.stop="showClasse = false"
          >
            <span>{{ row.classe }}</span>
            <strong>{{ row.count }}</strong>
          </router-link>
          <div v-else class="stat-card__popover-row">
            <span>{{ row.classe }}</span>
            <strong>{{ row.count }}</strong>
          </div>
        </template>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-card__value">{{ stats.nouvelles_inscriptions_mois ?? 0 }}</div>
      <div class="stat-card__label">Inscriptions ce mois</div>
      <div class="stat-card__sub">{{ stats.nouvelles_inscriptions_annee ?? 0 }} nouveaux cette année</div>
    </div>

    <div class="stat-card">
      <div class="stat-card__value">
        {{ stats.presence_jour?.label ?? '—' }}
        <span v-if="stats.presence_jour?.source === 'static'" class="badge-static">démo</span>
      </div>
      <div class="stat-card__label">Présence du jour</div>
    </div>

    <div class="stat-card">
      <div class="stat-card__value">{{ formatMontant(stats.frais_collectes) }}</div>
      <div class="stat-card__label">Frais collectés</div>
      <div class="stat-card__sub">
        {{ stats.frais_pct ?? 0 }} % de {{ formatMontant(stats.frais_attendus) }} attendus
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  stats: { type: Object, default: () => ({}) },
  parClasse: { type: Array, default: () => [] }
})

const showClasse = ref(false)

function formatMontant(value) {
  if (!value) return '0 Ar'
  return `${Number(value).toLocaleString('fr-FR')} Ar`
}
</script>

<style scoped>
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  padding: 16px 18px;
}

.stat-card--expandable {
  cursor: pointer;
}

.stat-card__value {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-card__label {
  margin-top: 4px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.stat-card__sub {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.badge-static {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--color-accent-light);
  color: #92400e;
  text-transform: uppercase;
}

.stat-card__popover {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 10;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  padding: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.stat-card__popover-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  font-size: 12px;
  border-bottom: 1px solid var(--color-border);
  text-decoration: none;
  color: inherit;
}

.stat-card__popover-row--link {
  cursor: pointer;
  border-radius: 6px;
}

.stat-card__popover-row--link:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.stat-card__popover-row:last-child {
  border-bottom: none;
}
</style>
