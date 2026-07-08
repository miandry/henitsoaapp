<template>
  <div class="summary-cards">
    <div class="summary-card">
      <span class="summary-card__label">Total attendu</span>
      <strong class="summary-card__value">{{ formatMontant(summary.total_attendu) }}</strong>
    </div>
    <div class="summary-card summary-card--success">
      <span class="summary-card__label">Total encaissé</span>
      <strong class="summary-card__value">{{ formatMontant(summary.total_encaisse) }}</strong>
    </div>
    <div class="summary-card summary-card--danger">
      <span class="summary-card__label">En retard</span>
      <strong class="summary-card__value">{{ formatMontant(summary.total_retard) }}</strong>
      <span class="summary-card__sub">{{ summary.eleves_retard || 0 }} élève(s)</span>
    </div>
    <div class="summary-card summary-card--accent">
      <span class="summary-card__label">Taux de recouvrement</span>
      <strong class="summary-card__value">{{ summary.taux_recouvrement ?? 0 }} %</strong>
    </div>
  </div>
</template>

<script setup>
defineProps({
  summary: { type: Object, default: () => ({}) }
})

function formatMontant(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} Ar`
}
</script>

<style scoped>
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.summary-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 14px 16px;
  box-shadow: var(--shadow-sm);
}

.summary-card--success { border-color: #bbf7d0; }
.summary-card--danger { border-color: #fecaca; }
.summary-card--accent { border-color: rgba(232, 172, 58, 0.45); background: var(--color-accent-light); }

.summary-card__label {
  display: block;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.summary-card__value {
  font-size: 20px;
  color: var(--color-primary);
}

.summary-card__sub {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--color-text-muted);
}
</style>
