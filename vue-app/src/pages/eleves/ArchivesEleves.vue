<template>
  <section>
    <div class="page-header">
      <h1 class="page-title">Les archives des élèves</h1>
      <button type="button" class="btn-add" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Nouvel élève
      </button>
    </div>

    <div class="list-card">
      <div class="list-toolbar">
        <div class="list-toolbar-filters">
          <input
            v-model="search"
            type="search"
            placeholder="Rechercher un élève..."
            @input="onFilterInput"
          />
          <input
            v-model="adresse"
            type="search"
            placeholder="Filtrer par adresse..."
            @input="onFilterInput"
          />
        </div>
        <span class="total">{{ total }} élève(s)</span>
      </div>

      <p v-if="error" class="list-error">{{ error }}</p>
      <p v-else-if="loading" class="list-loading">Chargement...</p>

      <ul v-else class="student-list">
        <ClickableListItem v-for="item in items" :key="item.id" :to="`/app/archives-eleves/${item.id}`">
          <img v-if="item.photo_url" :src="item.photo_url" :alt="fullName(item)" class="student-avatar student-avatar--photo" />
          <div v-else class="student-avatar">{{ initials(item) }}</div>
          <div class="student-list-item__info">
            <div class="student-list-item__name">{{ fullName(item) }}</div>
            <div class="student-list-item__meta">
              <span v-if="item.date_sortie" class="student-badge">Sorti le {{ formatDate(item.date_sortie) }}</span>
              <span v-else class="student-badge">Encore inscrit</span>
              <span v-if="item.adresse" class="dot">•</span>
              <span v-if="item.adresse">{{ item.adresse }}</span>
              <span v-if="item.date_entre" class="dot">•</span>
              <span v-if="item.date_entre">Entré le {{ formatDate(item.date_entre) }}</span>
            </div>
          </div>
          <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </ClickableListItem>
        <li v-if="items.length === 0" class="list-empty">Aucun élève trouvé.</li>
      </ul>

      <div ref="sentinelRef" class="list-sentinel">
        <span v-if="loadingMore" class="list-loading-more">Chargement de plus d'archives...</span>
      </div>
    </div>

    <Modal v-if="showCreate" title="Ajouter un élève" @close="closeCreate">
      <form @submit.prevent="submitCreate">
        <p v-if="createError" class="form-error">{{ createError }}</p>

        <div class="form-field">
          <label for="arch-nom">Nom</label>
          <input id="arch-nom" v-model="newNom" type="text" required />
        </div>

        <div class="form-field">
          <label for="arch-prenom">Prénom</label>
          <input id="arch-prenom" v-model="newPrenom" type="text" required />
        </div>

        <div class="form-field">
          <label for="arch-genre">Genre</label>
          <select id="arch-genre" v-model="newGenre">
            <option value="1">Garçon</option>
            <option value="0">Fille</option>
          </select>
        </div>

        <div class="form-field">
          <label for="arch-date-entre">Date d'entrée</label>
          <input id="arch-date-entre" v-model="newDateEntre" type="date" required />
        </div>

        <div class="form-field">
          <label for="arch-date-sortie">Date de sortie <small>(optionnel)</small></label>
          <input id="arch-date-sortie" v-model="newDateSortie" type="date" />
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="closeCreate">Annuler</button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="creating || !newNom.trim() || !newPrenom.trim() || !newDateEntre"
          >
            {{ creating ? 'Création...' : 'Créer' }}
          </button>
        </div>
      </form>
    </Modal>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getArchives, createEtudiant } from '../../services/api.js'
import { useInfiniteList } from '../../composables/useInfiniteList.js'
import Modal from '../../components/Modal.vue'
import ClickableListItem from '../../components/ClickableListItem.vue'

const search = ref('')
const adresse = ref('')

const { items, total, loading, loadingMore, error, sentinelRef, reload } = useInfiniteList(
  async (params) => (await getArchives(params)).data,
  { getParams: () => ({ search: search.value, adresse: adresse.value }) }
)

let filterTimeout = null

const showCreate = ref(false)
const newNom = ref('')
const newPrenom = ref('')
const newGenre = ref('1')
const newDateEntre = ref('')
const newDateSortie = ref('')
const creating = ref(false)
const createError = ref('')

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function onFilterInput() {
  clearTimeout(filterTimeout)
  filterTimeout = setTimeout(reload, 300)
}

function fullName(item) {
  return [item.nom, item.prenom].filter(Boolean).join(' ').trim() || 'Sans nom'
}

function initials(item) {
  return ((item.nom?.trim()?.[0] || '') + (item.prenom?.trim()?.[0] || '')).toUpperCase() || '?'
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })
}

function openCreate() {
  newNom.value = ''
  newPrenom.value = ''
  newGenre.value = '1'
  newDateEntre.value = todayIso()
  newDateSortie.value = ''
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
    const payload = {
      nom: newNom.value.trim(),
      prenom: newPrenom.value.trim(),
      genre: newGenre.value,
      date_entre: newDateEntre.value
    }
    if (newDateSortie.value) {
      payload.date_sortie = newDateSortie.value
    }
    await createEtudiant(payload)
    showCreate.value = false
    await reload()
  } catch (e) {
    createError.value = e.response?.data?.message || "Impossible de créer l'élève : " + e.message
  } finally {
    creating.value = false
  }
}

onMounted(reload)
</script>
