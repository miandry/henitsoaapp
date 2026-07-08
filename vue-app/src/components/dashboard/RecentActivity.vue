<template>
  <div class="panel activity-panel">
    <h2 class="panel__title">Activité récente</h2>
    <ul v-if="items.length" class="activity-list">
      <li v-for="(item, i) in items" :key="i">
        <router-link :to="item.url" class="activity-item">
          <span class="activity-item__type">{{ item.label }}</span>
          <strong class="activity-item__title">{{ item.title }}</strong>
          <time class="activity-item__date">{{ item.date }}</time>
        </router-link>
      </li>
    </ul>
    <p v-else class="panel__empty">Aucune activité récente.</p>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] }
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

.panel__title {
  margin: 0;
  padding: 14px 16px;
  font-size: 15px;
  border-bottom: 1px solid var(--color-border);
}

.activity-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.activity-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2px 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid var(--color-border);
}

.activity-item:hover {
  background: var(--color-bg);
}

.activity-item__type {
  grid-column: 1;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-primary);
}

.activity-item__title {
  grid-column: 1;
  font-size: 14px;
}

.activity-item__date {
  grid-column: 2;
  grid-row: 1 / span 2;
  font-size: 11px;
  color: var(--color-text-muted);
  align-self: center;
  white-space: nowrap;
}

.panel__empty {
  padding: 20px 16px;
  margin: 0;
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>
