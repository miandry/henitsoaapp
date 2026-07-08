<template>
  <div class="panel finances-panel">
    <h2 class="panel__title">Finances</h2>

    <div class="finances-summary">
      <div class="finances-summary__item">
        <span class="finances-summary__label">Encaissé ce mois</span>
        <strong>{{ formatMontant(finances.encaisse_mois) }}</strong>
      </div>
      <div class="finances-summary__item">
        <span class="finances-summary__label">
          Objectif mois
          <span v-if="finances.objectif_mois_source === 'static'" class="badge-static">estimé</span>
        </span>
        <strong>{{ formatMontant(finances.objectif_mois) }}</strong>
      </div>
      <div class="finances-summary__progress">
        <div class="finances-summary__bar" :style="{ width: monthPct + '%' }"></div>
      </div>
    </div>

    <h3 class="panel__subtitle">Par catégorie</h3>
    <ul class="category-list">
      <li v-for="cat in finances.par_categorie" :key="cat.categorie" class="category-list__row">
        <span>
          {{ cat.categorie }}
          <span v-if="cat.source === 'static'" class="badge-static">démo</span>
        </span>
        <strong>{{ formatMontant(cat.montant) }}</strong>
      </li>
    </ul>

    <h3 class="panel__subtitle">5 derniers paiements</h3>
    <ul v-if="finances.derniers_paiements?.length" class="payment-list">
      <li v-for="p in finances.derniers_paiements" :key="p.id">
        <router-link :to="p.url" class="payment-list__item">
          <span>{{ p.eleve }} · {{ p.mois }}</span>
          <strong>{{ formatMontant(p.montant) }}</strong>
        </router-link>
      </li>
    </ul>
    <p v-else class="panel__empty">Aucun paiement enregistré.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  finances: { type: Object, default: () => ({}) }
})

const monthPct = computed(() => {
  const encaisse = props.finances.encaisse_mois || 0
  const objectif = props.finances.objectif_mois || 1
  return Math.min(100, Math.round((encaisse / objectif) * 100))
})

function formatMontant(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} Ar`
}
</script>

<style scoped>
.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  padding: 14px 16px;
}

.panel__title {
  margin: 0 0 14px;
  font-size: 15px;
}

.panel__subtitle {
  margin: 16px 0 8px;
  font-size: 13px;
  color: var(--color-text-muted);
  font-weight: 600;
}

.finances-summary__item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 14px;
}

.finances-summary__label {
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.finances-summary__progress {
  height: 8px;
  background: var(--color-bg);
  border-radius: 999px;
  overflow: hidden;
  margin-top: 10px;
}

.finances-summary__bar {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  border-radius: 999px;
  transition: width 0.3s ease;
}

.category-list,
.payment-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.category-list__row,
.payment-list__item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  font-size: 13px;
  border-bottom: 1px solid var(--color-border);
}

.payment-list__item {
  text-decoration: none;
  color: inherit;
}

.payment-list__item:hover {
  color: var(--color-primary);
}

.badge-static {
  font-size: 9px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--color-accent-light);
  color: #92400e;
  text-transform: uppercase;
}

.panel__empty {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>
