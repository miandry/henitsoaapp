<template>
  <section>
    <div class="page-header">
      <h1 class="page-title">Les classes</h1>
      <button type="button" class="btn-add" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Ajouter une classe
      </button>
    </div>

    <div class="list-card">
      <div class="list-toolbar">
        <input
          v-model="search"
          type="search"
          placeholder="Rechercher une classe..."
          @input="onSearchInput"
        />
        <span class="total" v-if="anneeScolaire">Année {{ anneeScolaire }} · {{ total }} classe(s)</span>
        <span class="total" v-else>{{ total }} classe(s)</span>
      </div>

      <p v-if="error" class="list-error">{{ error }}</p>
      <p v-else-if="loading" class="list-loading">Chargement...</p>

      <ul v-else class="student-list">
        <ClickableListItem v-for="item in items" :key="item.id" :to="`/app/classes/${item.id}`">
          <div class="student-avatar" v-html="classIcon"></div>
          <div class="student-list-item__info">
            <div class="student-list-item__name">{{ item.nom }}</div>
            <div class="student-list-item__meta">
              <span class="student-badge">{{ item.effectif }} élève{{ item.effectif > 1 ? 's' : '' }}</span>
            </div>
          </div>
          <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </ClickableListItem>
        <li v-if="items.length === 0" class="list-empty">Aucune classe trouvée.</li>
      </ul>
    </div>

    <Modal v-if="showCreate" title="Ajouter une classe" @close="closeCreate">
      <form @submit.prevent="submitCreate">
        <p v-if="createError" class="form-error">{{ createError }}</p>
        <div class="form-field">
          <label for="classe-nom">Nom de la classe</label>
          <input id="classe-nom" v-model="newNom" type="text" placeholder="ex. 6emeA" required />
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
import { getClasses, createClasse } from '../../services/api.js'
import Modal from '../../components/Modal.vue'
import ClickableListItem from '../../components/ClickableListItem.vue'

const items = ref([])
const total = ref(0)
const anneeScolaire = ref('')
const search = ref('')
const loading = ref(false)
const error = ref('')
let searchTimeout = null

const showCreate = ref(false)
const newNom = ref('')
const creating = ref(false)
const createError = ref('')

const classIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>'

async function fetchClasses() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await getClasses({ search: search.value })
    items.value = data.items || []
    total.value = data.total || 0
    anneeScolaire.value = data.annee_scolaire || ''
  } catch (e) {
    error.value = "Impossible de charger les classes : " + e.message
  } finally {
    loading.value = false
  }
}

function onSearchInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchClasses, 300)
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
    await createClasse(newNom.value.trim())
    showCreate.value = false
    await fetchClasses()
  } catch (e) {
    createError.value = e.response?.data?.message || "Impossible de créer la classe : " + e.message
  } finally {
    creating.value = false
  }
}

onMounted(fetchClasses)
</script>
