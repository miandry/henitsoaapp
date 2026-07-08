<template>
  <div>
    <div v-if="modelValue" class="autocomplete-selected">
      <span>{{ modelValue.matricule }} <small>({{ modelValue.classe || '—' }} · {{ modelValue.annee_scolaire || '—' }})</small></span>
      <button type="button" @click="clear">Changer</button>
    </div>
    <div v-else class="autocomplete">
      <input
        v-model="query"
        type="text"
        placeholder="Rechercher une inscription par nom d'élève..."
        @input="onInput"
      />
      <ul v-if="results.length" class="autocomplete-results">
        <li v-for="inscription in results" :key="inscription.id" @click="select(inscription)">
          {{ inscription.matricule }} <small>({{ inscription.classe || '—' }} · {{ inscription.annee_scolaire || '—' }})</small>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getInscriptions } from '../services/api.js'

const props = defineProps({
  modelValue: { type: Object, default: null },
  anneeScolaire: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const query = ref('')
const results = ref([])
let searchTimeout = null

function onInput() {
  clearTimeout(searchTimeout)
  if (query.value.trim().length < 2) {
    results.value = []
    return
  }
  searchTimeout = setTimeout(async () => {
    const params = { search: query.value.trim(), limit: 8 }
    if (props.anneeScolaire) {
      params.annee_scolaire = props.anneeScolaire
    }
    const { data } = await getInscriptions(params)
    results.value = data.items || []
  }, 250)
}

function select(inscription) {
  emit('update:modelValue', inscription)
  results.value = []
  query.value = ''
}

function clear() {
  emit('update:modelValue', null)
}
</script>
