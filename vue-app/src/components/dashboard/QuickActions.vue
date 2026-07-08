<template>
  <div class="quick-actions">
    <div class="quick-actions__search">
      <input
        v-model="query"
        type="search"
        placeholder="Rechercher un élève..."
        @keydown.enter="search"
      />
      <button type="button" class="btn-primary btn-sm" @click="search">Rechercher</button>
    </div>
    <div class="quick-actions__buttons">
      <router-link to="/app/archives-eleves" class="quick-btn">
        <span class="quick-btn__icon">+</span>
        Ajouter un élève
      </router-link>
      <router-link to="/app/gestion-ecolages" class="quick-btn">
        <span class="quick-btn__icon">₳</span>
        Enregistrer un paiement
      </router-link>
      <button type="button" class="quick-btn quick-btn--static" disabled title="Module appel non installé">
        <span class="quick-btn__icon">✓</span>
        Appel du jour
        <span class="badge-static">bientôt</span>
      </button>
      <router-link to="/app/eleves-inscrits" class="quick-btn">
        <span class="quick-btn__icon">≡</span>
        Liste inscriptions
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const query = ref('')

function search() {
  const q = query.value.trim()
  if (!q) return
  router.push({ path: '/app/archives-eleves', query: { search: q } })
}
</script>

<style scoped>
.quick-actions {
  margin-bottom: 20px;
}

.quick-actions__search {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.quick-actions__search input {
  flex: 1;
  min-width: 200px;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
}

.quick-actions__search input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.btn-sm {
  padding: 10px 16px;
  font-size: 13px;
}

.quick-actions__buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
}

.quick-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  font-family: inherit;
}

.quick-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.quick-btn--static {
  opacity: 0.7;
  cursor: not-allowed;
}

.quick-btn__icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.badge-static {
  margin-left: auto;
  font-size: 9px;
  font-weight: 600;
  padding: 2px 5px;
  border-radius: 3px;
  background: var(--color-accent-light);
  color: #92400e;
  text-transform: uppercase;
}
</style>
