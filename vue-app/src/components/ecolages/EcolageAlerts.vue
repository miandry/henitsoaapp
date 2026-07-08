<template>
  <div v-if="alerts.length" class="alerts-panel">
    <h2 class="alerts-panel__title">Alertes</h2>
    <ul class="alerts-list">
      <li v-for="(alert, i) in alerts" :key="i">
        <router-link :to="alert.url" class="alerts-list__item">
          <span class="alerts-list__badge">{{ alert.label }}</span>
          <strong>{{ alert.nom }}</strong>
          <span class="alerts-list__detail">{{ alert.detail }} · {{ alert.classe }}</span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  alerts: { type: Array, default: () => [] }
})
</script>

<style scoped>
.alerts-panel {
  background: #fff5f5;
  border: 1px solid #fecaca;
  border-radius: var(--radius);
  padding: 12px 14px;
  margin-bottom: 16px;
}

.alerts-panel__title {
  margin: 0 0 10px;
  font-size: 14px;
  color: var(--color-primary);
}

.alerts-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.alerts-list__item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2px 10px;
  padding: 8px 10px;
  background: var(--color-surface);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  font-size: 13px;
}

.alerts-list__item:hover {
  background: var(--color-bg);
}

.alerts-list__badge {
  grid-row: span 2;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 6px;
  border-radius: 4px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  align-self: start;
}

.alerts-list__detail {
  grid-column: 2;
  font-size: 11px;
  color: var(--color-text-muted);
}
</style>
