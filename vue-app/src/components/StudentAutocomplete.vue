<template>
  <div>
    <div v-if="modelValue" class="autocomplete-selected">
      <span>{{ modelValue.nom }} {{ modelValue.prenom }} <small>({{ modelValue.matricule }})</small></span>
      <button type="button" @click="clear">Changer</button>
    </div>
    <div v-else-if="showCreateForm" class="autocomplete-create">
      <p class="autocomplete-empty">Aucun élève trouvé pour « {{ query }} »</p>
      <div class="form-field">
        <label for="new-eleve-nom">Nom</label>
        <input id="new-eleve-nom" v-model="newNom" type="text" required />
      </div>
      <div class="form-field">
        <label for="new-eleve-prenom">Prénom</label>
        <input id="new-eleve-prenom" v-model="newPrenom" type="text" required />
      </div>
      <div class="form-field">
        <label for="new-eleve-genre">Genre</label>
        <select id="new-eleve-genre" v-model="newGenre">
          <option value="1">Garçon</option>
          <option value="0">Fille</option>
        </select>
      </div>
      <p v-if="createError" class="form-error">{{ createError }}</p>
      <div class="autocomplete-create-actions">
        <button type="button" class="btn-secondary" @click="cancelCreate">Annuler</button>
        <button
          type="button"
          class="btn-primary"
          :disabled="creating || !newNom.trim() || !newPrenom.trim()"
          @click="submitCreate"
        >
          {{ creating ? 'Création...' : 'Créer' }}
        </button>
      </div>
    </div>
    <div v-else class="autocomplete">
      <input
        v-model="query"
        type="text"
        placeholder="Rechercher un élève par nom..."
        @input="onInput"
      />
      <ul v-if="results.length" class="autocomplete-results">
        <li v-for="student in results" :key="student.id" @click="select(student)">
          {{ student.nom }} {{ student.prenom }} <small>({{ student.matricule }})</small>
        </li>
      </ul>
      <div v-else-if="noResults" class="autocomplete-empty-panel">
        <p class="autocomplete-empty">Aucun élève trouvé pour « {{ query }} »</p>
        <button type="button" class="btn-primary" @click="openCreateForm">Créer un élève</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { searchEtudiants, createEtudiant } from '../services/api.js'

defineProps({
  modelValue: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue'])

const query = ref('')
const results = ref([])
const searching = ref(false)
const noResults = ref(false)
const showCreateForm = ref(false)
const newNom = ref('')
const newPrenom = ref('')
const newGenre = ref('1')
const creating = ref(false)
const createError = ref('')
let searchTimeout = null

function onInput() {
  clearTimeout(searchTimeout)
  noResults.value = false
  showCreateForm.value = false
  createError.value = ''
  if (query.value.trim().length < 2) {
    results.value = []
    return
  }
  searchTimeout = setTimeout(async () => {
    searching.value = true
    try {
      const { data } = await searchEtudiants({ search: query.value.trim(), limit: 8 })
      results.value = data.items || []
      noResults.value = results.value.length === 0
    } catch {
      results.value = []
      noResults.value = false
    } finally {
      searching.value = false
    }
  }, 250)
}

function select(student) {
  emit('update:modelValue', student)
  results.value = []
  query.value = ''
  noResults.value = false
}

function clear() {
  emit('update:modelValue', null)
}

function openCreateForm() {
  const parts = query.value.trim().split(/\s+/)
  newNom.value = parts[0] || ''
  newPrenom.value = parts.slice(1).join(' ')
  newGenre.value = '1'
  createError.value = ''
  showCreateForm.value = true
  noResults.value = false
}

function cancelCreate() {
  showCreateForm.value = false
  createError.value = ''
}

async function submitCreate() {
  creating.value = true
  createError.value = ''
  try {
    const { data } = await createEtudiant({
      nom: newNom.value.trim(),
      prenom: newPrenom.value.trim(),
      genre: newGenre.value
    })
    emit('update:modelValue', data.item)
    showCreateForm.value = false
    query.value = ''
    results.value = []
    noResults.value = false
  } catch (e) {
    createError.value = e.response?.data?.message || "Impossible de créer l'élève : " + e.message
  } finally {
    creating.value = false
  }
}
</script>
