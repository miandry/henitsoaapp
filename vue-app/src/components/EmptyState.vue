<template>
  <section>
    <h1 class="page-title">{{ title }}</h1>
    <div class="empty-card">
      <div class="empty-card__icon" v-html="icon"></div>
      <p>{{ description }}</p>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '' }
})
</script>

<style scoped>
.page-title {
  margin: 0 0 20px;
  font-size: 22px;
}

.empty-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  max-width: 480px;
  padding: 28px;
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius);
  color: var(--color-text-muted);
  font-size: 14px;
}

.empty-card__icon {
  display: flex;
  color: var(--color-primary);
}
</style>
