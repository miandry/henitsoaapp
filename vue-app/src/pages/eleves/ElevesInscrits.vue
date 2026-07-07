<template>
  <section>
    <div class="page-header">
      <h1 class="page-title">Les Eleves inscript</h1>
      <button type="button" class="btn-add" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Ajouter une inscription
      </button>
    </div>

    <div class="list-card">
      <div class="list-toolbar">
        <input
          v-model="search"
          type="search"
          placeholder="Rechercher un élève..."
          @input="onSearchInput"
        />
        <span class="total">{{ total }} inscription(s)</span>
      </div>

      <p v-if="error" class="list-error">{{ error }}</p>
      <p v-else-if="loading" class="list-loading">Chargement...</p>

      <ul v-else class="student-list">
        <ClickableListItem v-for="item in items" :key="item.id" :to="`/app/eleves-inscrits/${item.id}`">
          <img v-if="item.photo_url" :src="item.photo_url" :alt="item.matricule" class="student-avatar student-avatar--photo" />
          <div v-else class="student-avatar">{{ initials(item.matricule) }}</div>
          <div class="student-list-item__info">
            <div class="student-list-item__name">{{ item.matricule }}</div>
            <div class="student-list-item__meta">
              <span class="student-badge">{{ item.classe || '—' }}</span>
              <span class="dot">•</span>
              <span>{{ item.annee_scolaire || '—' }}</span>
            </div>
          </div>
          <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </ClickableListItem>
        <li v-if="items.length === 0" class="list-empty">Aucune inscription trouvée.</li>
      </ul>

      <div ref="sentinelRef" class="list-sentinel">
        <span v-if="loadingMore" class="list-loading-more">Chargement de plus d'inscriptions...</span>
      </div>
    </div>

    <Modal v-if="showCreate" title="Ajouter une inscription" @close="closeCreate">
      <form @submit.prevent="submitCreate">
        <p v-if="createError" class="form-error">{{ createError }}</p>

        <div class="form-field">
          <label>Élève</label>
          <StudentAutocomplete v-model="newEleve" />
        </div>

        <div class="form-field">
          <label for="ins-classe">Classe</label>
          <select id="ins-classe" v-model="newClasseTid" required>
            <option value="" disabled>Sélectionner une classe</option>
            <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.nom }}</option>
          </select>
        </div>

        <div class="form-field">
          <label for="ins-annee">Année scolaire</label>
          <select id="ins-annee" v-model="newAnnee" required>
            <option value="" disabled>Sélectionner une année</option>
            <option v-for="y in anneesScolaires" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <div class="form-field">
          <label for="ins-droit">Droit d'inscription</label>
          <select id="ins-droit" v-model="newDroitInscription" required>
            <option value="" disabled>Sélectionner</option>
            <option v-for="d in droitsInscription" :key="d.value" :value="d.value">{{ d.label }}</option>
          </select>
        </div>

        <div class="form-field">
          <label for="ins-date-payement">Date de paiement</label>
          <input id="ins-date-payement" v-model="newDatePayement" type="date" required />
        </div>

        <div class="form-field">
          <label for="ins-montant">Montant (Ar)</label>
          <input id="ins-montant" v-model.number="newMontant" type="number" min="0" placeholder="ex. 30000" required />
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="closeCreate">Annuler</button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="creating || !newEleve || !newClasseTid || !newAnnee || !newDroitInscription || !newDatePayement || newMontant === null || newMontant < 0"
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
import { getInscriptions, createInscription, getClasses, getInscriptionFormOptions } from '../../services/api.js'
import { useInfiniteList } from '../../composables/useInfiniteList.js'
import Modal from '../../components/Modal.vue'
import StudentAutocomplete from '../../components/StudentAutocomplete.vue'
import ClickableListItem from '../../components/ClickableListItem.vue'

const search = ref('')

const { items, total, loading, loadingMore, error, sentinelRef, reload } = useInfiniteList(
  async (params) => (await getInscriptions(params)).data,
  { getParams: () => ({ search: search.value }) }
)

let searchTimeout = null

const showCreate = ref(false)
const newEleve = ref(null)
const newClasseTid = ref('')
const newAnnee = ref('')
const newDroitInscription = ref('')
const newDatePayement = ref('')
const newMontant = ref(null)
const classes = ref([])
const anneesScolaires = ref([])
const droitsInscription = ref([])
const creating = ref(false)
const createError = ref('')

function onSearchInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(reload, 300)
}

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
}

async function openCreate() {
  newEleve.value = null
  newClasseTid.value = ''
  newAnnee.value = ''
  newDroitInscription.value = ''
  newDatePayement.value = ''
  newMontant.value = null
  createError.value = ''
  showCreate.value = true
  try {
    const [classesRes, formRes] = await Promise.all([
      getClasses({}),
      getInscriptionFormOptions()
    ])
    classes.value = classesRes.data.items || []
    anneesScolaires.value = formRes.data.annees_scolaires || classesRes.data.annees_scolaires || []
    droitsInscription.value = formRes.data.droits_inscription || []
    newAnnee.value = formRes.data.annee_scolaire || classesRes.data.annee_scolaire || anneesScolaires.value[0] || ''
  } catch (e) {
    createError.value = "Impossible de charger le formulaire : " + e.message
  }
}

function closeCreate() {
  showCreate.value = false
}

async function submitCreate() {
  creating.value = true
  createError.value = ''
  try {
    await createInscription({
      eleve_nid: newEleve.value.id,
      classe_tid: newClasseTid.value,
      annee_scolaire: newAnnee.value,
      droit_inscription: newDroitInscription.value,
      date_de_payement: newDatePayement.value,
      montant: newMontant.value || 0
    })
    showCreate.value = false
    await reload()
  } catch (e) {
    createError.value = e.response?.data?.message || "Impossible de créer l'inscription : " + e.message
  } finally {
    creating.value = false
  }
}

onMounted(reload)
</script>
