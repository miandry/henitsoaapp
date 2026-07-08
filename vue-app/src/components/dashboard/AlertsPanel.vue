<template>
  <div class="panel alerts-panel">
    <div class="panel__header">
      <h2 class="panel__title">À traiter</h2>
      <span class="panel__count">{{ alerts.length }}</span>
    </div>
    <ul v-if="alerts.length" class="alert-list">
      <li v-for="(alert, i) in alerts" :key="i">
        <router-link :to="alert.url" class="alert-item" :class="`alert-item--${alert.type}`">
          <span class="alert-item__badge">{{ alert.label }}</span>
          <span v-if="alert.source === 'static'" class="badge-static">démo</span>
          <strong class="alert-item__name">{{ alert.nom }}</strong>
          <span class="alert-item__detail">{{ alert.detail }}</span>
          <span v-if="alert.classe" class="alert-item__classe">{{ alert.classe }}</span>
        </router-link>
      </li>
    </ul>
    <p v-else class="panel__empty">Rien à signaler pour le moment.</p>
  </div>
</template>

<script setup>
defineProps({
  alerts: { type: Array, default: () => [] }
})
</script>

<style scoped>
.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.alerts-panel {
  border-color: #fecaca;
  background: linear-gradient(180deg, #fff5f5 0%, var(--color-surface) 120px);
}

.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
}

.panel__title {
  margin: 0;
  font-size: 15px;
  color: var(--color-primary);
}

.panel__count {
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--color-primary);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.alert-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.alert-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 10px;
  padding: 12px 16px;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid var(--color-border);
  align-items: start;
}

.alert-item:hover {
  background: var(--color-bg);
}

.alert-item__badge {
  grid-row: span 2;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  align-self: start;
}

.alert-item--absence .alert-item__badge { background: #fef3c7; color: #92400e; }
.alert-item--echeance .alert-item__badge { background: #dbeafe; color: #1e40af; }

.alert-item__name {
  font-size: 14px;
}

.alert-item__detail,
.alert-item__classe {
  grid-column: 2;
  font-size: 12px;
  color: var(--color-text-muted);
}

.badge-static {
  grid-column: 2;
  justify-self: start;
  font-size: 9px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--color-accent-light);
  color: #92400e;
  text-transform: uppercase;
}

.panel__empty {
  padding: 20px 16px;
  margin: 0;
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>
