<template>
  <div class="ecolage-filters">
    <div class="ecolage-filters__row">
      <select v-model="local.classe_tid" @change="emitChange">
        <option value="">Toutes les classes</option>
        <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.nom }}</option>
      </select>
      <select v-model="local.statut" @change="emitChange">
        <option value="">Tous les statuts</option>
        <option v-for="s in statuts" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <select v-model="local.mois_tid" @change="emitChange">
        <option value="">Toute l'année</option>
        <option v-for="m in mois" :key="m.id" :value="m.id">{{ m.nom }}</option>
      </select>
      <input
        v-model="local.search"
        type="search"
        placeholder="Rechercher un élève..."
        @input="onSearch"
      />
    </div>
    <div v-if="anneeScolaire" class="ecolage-filters__year">
      Année scolaire : <strong>{{ anneeScolaire }}</strong>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  classes: { type: Array, default: () => [] },
  mois: { type: Array, default: () => [] },
  statuts: { type: Array, default: () => [] },
  anneeScolaire: { type: String, default: '' },
  modelValue: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'change'])

const local = reactive({
  classe_tid: props.modelValue.classe_tid || '',
  statut: props.modelValue.statut || '',
  mois_tid: props.modelValue.mois_tid || '',
  search: props.modelValue.search || ''
})

let searchTimeout = null

watch(() => props.modelValue, (v) => {
  local.classe_tid = v.classe_tid || ''
  local.statut = v.statut || ''
  local.mois_tid = v.mois_tid || ''
  local.search = v.search || ''
}, { deep: true })

function emitChange() {
  const payload = {
    classe_tid: local.classe_tid,
    statut: local.statut,
    mois_tid: local.mois_tid,
    search: local.search
  }
  emit('update:modelValue', payload)
  emit('change', payload)
}

function onSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(emitChange, 300)
}
</script>

<style scoped>
.ecolage-filters__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

.ecolage-filters select,
.ecolage-filters input {
  padding: 9px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: #fff;
}

.ecolage-filters__year {
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>
