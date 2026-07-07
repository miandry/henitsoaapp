<template>
  <section>
    <div class="page-header">
      <h1 class="page-title">Les matieres</h1>
      <button type="button" class="btn-add" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Ajouter une matière
      </button>
    </div>

    <div class="list-card">
      <div class="list-toolbar">
        <input
          v-model="search"
          type="search"
          placeholder="Rechercher une matière..."
          @input="onSearchInput"
        />
        <span class="total">{{ total }} matière(s)</span>
      </div>

      <p v-if="error" class="list-error">{{ error }}</p>
      <p v-else-if="loading" class="list-loading">Chargement...</p>

      <ul v-else class="student-list">
        <ClickableListItem v-for="item in items" :key="item.id" :to="`/app/matieres/${item.id}`">
          <div class="student-avatar" v-html="matiereIcon"></div>
          <div class="student-list-item__info">
            <div class="student-list-item__name">{{ item.nom }}</div>
          </div>
          <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </ClickableListItem>
        <li v-if="items.length === 0" class="list-empty">Aucune matière trouvée.</li>
      </ul>
    </div>

    <Modal v-if="showCreate" title="Ajouter une matière" @close="closeCreate">
      <form @submit.prevent="submitCreate">
        <p v-if="createError" class="form-error">{{ createError }}</p>
        <div class="form-field">
          <label for="matiere-nom">Nom de la matière</label>
          <input id="matiere-nom" v-model="newNom" type="text" placeholder="ex. Histoire" required />
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="closeCreate">Annuler</button>
          <button type="submit" class="btn-primary" :disabled="creating">
            {{ creating ? 'Création...' : 'Créer' }}
          </button>
        </div>
      </form>
    </Modal>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMatieres, createMatiere } from '../services/api.js'
import Modal from '../components/Modal.vue'
import ClickableListItem from '../components/ClickableListItem.vue'

const items = ref([])
const total = ref(0)
const search = ref('')
const loading = ref(false)
const error = ref('')
let searchTimeout = null

const showCreate = ref(false)
const newNom = ref('')
const creating = ref(false)
const createError = ref('')

const matiereIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'

async function fetchMatieres() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await getMatieres({ search: search.value })
    items.value = data.items || []
    total.value = data.total || 0
  } catch (e) {
    error.value = "Impossible de charger les matières : " + e.message
  } finally {
    loading.value = false
  }
}

function onSearchInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchMatieres, 300)
}

function openCreate() {
  newNom.value = ''
  createError.value = ''
  showCreate.value = true
}

function closeCreate() {
  showCreate.value = false
}

async function submitCreate() {
  creating.value = true
  createError.value = ''
  try {
    await createMatiere(newNom.value.trim())
    showCreate.value = false
    await fetchMatieres()
  } catch (e) {
    createError.value = e.response?.data?.message || "Impossible de créer la matière : " + e.message
  } finally {
    creating.value = false
  }
}

onMounted(fetchMatieres)
</script>
