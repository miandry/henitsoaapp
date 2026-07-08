<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card" :class="{ 'modal-card--wide': wide }">
      <div class="modal-header">
        <h2>{{ title }}</h2>
        <button type="button" class="modal-close" aria-label="Fermer" @click="$emit('close')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  wide: { type: Boolean, default: false }
})
defineEmits(['close'])
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 50;
  padding: 5vh 16px;
  overflow-y: auto;
}

.modal-card {
  width: 100%;
  max-width: 440px;
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  margin: 0 auto;
  overflow: visible;
  flex-shrink: 0;
}

.modal-card--wide {
  max-width: 560px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 16px;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: 6px;
}

.modal-close:hover {
  background: var(--color-bg);
}

.modal-body {
  padding: 20px;
  overflow: visible;
}
</style>
