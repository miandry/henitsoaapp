<template>
  <section>
    <div class="page-header">
      <div>
        <h1 class="page-title">Gestion des activités</h1>
        <p class="page-lead">Fêtes, voyages d'étude, Noël — inscriptions et collecte des participations.</p>
      </div>
      <button type="button" class="btn-add" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Nouvelle activité
      </button>
    </div>

    <div class="list-card">
      <div class="list-toolbar">
        <select v-model="anneeScolaire" @change="fetchActivites">
          <option v-for="y in anneesScolaires" :key="y" :value="y">{{ y }}</option>
        </select>
        <input
          v-model="search"
          type="search"
          placeholder="Rechercher une activité..."
          @input="onSearchInput"
        />
        <select v-model="statut" @change="fetchActivites">
          <option value="">Tous les statuts</option>
          <option v-for="(label, value) in statutsActivite" :key="value" :value="value">{{ label }}</option>
        </select>
        <span class="total">{{ total }} activité(s)</span>
      </div>

      <p v-if="error" class="list-error">{{ error }}</p>
      <p v-else-if="loading" class="list-loading">Chargement...</p>

      <ul v-else class="student-list">
        <ClickableListItem v-for="item in items" :key="item.id" :to="`/app/activites/${item.id}`">
          <div class="student-avatar" v-html="activiteIcon"></div>
          <div class="student-list-item__info">
            <div class="student-list-item__name">{{ item.title }}</div>
            <div class="student-list-item__meta">
              <span class="student-badge">{{ item.type_activite_label || item.type_activite }}</span>
              <span v-if="item.date_activite">{{ formatDate(item.date_activite) }}</span>
              <span v-if="item.annee_scolaire">{{ item.annee_scolaire }}</span>
              <span class="student-badge" :class="statutClass(item.statut_activite)">
                {{ item.statut_activite_label || item.statut_activite }}
              </span>
            </div>
            <div class="activite-progress">
              <div class="activite-progress__bar">
                <div class="activite-progress__fill" :style="{ width: `${item.taux_collecte || 0}%` }"></div>
              </div>
              <span class="activite-progress__label">
                {{ formatMoney(item.collecte) }} / {{ formatMoney(item.objectif) }} Ar
                · {{ item.inscrits }} inscrit(s) · {{ item.taux_collecte || 0 }}%
              </span>
            </div>
          </div>
          <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </ClickableListItem>
        <li v-if="items.length === 0" class="list-empty">Aucune activité trouvée.</li>
      </ul>
    </div>

    <Modal v-if="showCreate" title="Nouvelle activité" wide @close="closeCreate">
      <form @submit.prevent="submitCreate">
        <p v-if="createError" class="form-error">{{ createError }}</p>
        <div class="form-field">
          <label for="act-title">Titre</label>
          <input id="act-title" v-model="form.title" type="text" required placeholder="ex. Fête de l'école 2026" />
        </div>
        <div class="form-row">
          <div class="form-field">
            <label for="act-type">Type</label>
            <select id="act-type" v-model="form.type_activite">
              <option v-for="(label, value) in typesActivite" :key="value" :value="value">{{ label }}</option>
            </select>
          </div>
          <div class="form-field">
            <label for="act-statut">Statut</label>
            <select id="act-statut" v-model="form.statut_activite">
              <option v-for="(label, value) in statutsActivite" :key="value" :value="value">{{ label }}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label for="act-date">Date de l'activité</label>
            <input id="act-date" v-model="form.date_activite" type="date" />
          </div>
          <div class="form-field">
            <label for="act-limite">Date limite d'inscription</label>
            <input id="act-limite" v-model="form.date_limite_inscription" type="date" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label for="act-montant">Montant participation (Ar)</label>
            <input id="act-montant" v-model.number="form.montant_participation" type="number" min="0" />
          </div>
          <div class="form-field">
            <label for="act-objectif">Objectif collecte (Ar)</label>
            <input id="act-objectif" v-model.number="form.objectif_collecte" type="number" min="0" />
          </div>
        </div>
        <div class="form-field">
          <label>Classes cibles <small>(vide = toutes)</small></label>
          <div class="checkbox-grid">
            <label v-for="classe in classes" :key="classe.id" class="checkbox-item">
              <input v-model="form.classes_cibles" type="checkbox" :value="classe.id" />
              {{ classe.nom }}
            </label>
          </div>
        </div>
        <div class="form-field">
          <label class="checkbox-item">
            <input v-model="form.participation_obligatoire" type="checkbox" />
            Participation obligatoire
          </label>
        </div>
        <div class="form-field">
          <label for="act-desc">Description</label>
          <textarea id="act-desc" v-model="form.description" rows="3"></textarea>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getActivites, getActiviteFormOptions, createActivite, getClasses } from '../../services/api.js'
import Modal from '../../components/Modal.vue'
import ClickableListItem from '../../components/ClickableListItem.vue'

const router = useRouter()
const items = ref([])
const total = ref(0)
const search = ref('')
const statut = ref('')
const anneeScolaire = ref('')
const anneesScolaires = ref([])
const loading = ref(false)
const error = ref('')
const typesActivite = ref({})
const statutsActivite = ref({})
const classes = ref([])
let searchTimeout = null

const showCreate = ref(false)
const creating = ref(false)
const createError = ref('')
const form = reactive({
  title: '',
  type_activite: 'autre',
  statut_activite: 'planifiee',
  date_activite: '',
  date_limite_inscription: '',
  montant_participation: 0,
  objectif_collecte: 0,
  classes_cibles: [],
  participation_obligatoire: false,
  description: ''
})

const activiteIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 11h18"/></svg>'

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('fr-FR')
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('fr-FR')
}

function statutClass(statutValue) {
  if (statutValue === 'en_cours') return 'is-active'
  if (statutValue === 'terminee') return 'is-paid'
  if (statutValue === 'annulee') return 'is-cancelled'
  return ''
}

async function loadOptions() {
  try {
    const [{ data: formData }, { data: classesData }] = await Promise.all([
      getActiviteFormOptions(),
      getClasses({})
    ])
    typesActivite.value = formData.types_activite || {}
    statutsActivite.value = formData.statuts_activite || {}
    classes.value = formData.classes || []
    anneesScolaires.value = classesData.annees_scolaires || formData.annees_scolaires || []
    if (!anneeScolaire.value) {
      anneeScolaire.value = classesData.annee_scolaire || formData.annee_scolaire || anneesScolaires.value[0] || ''
    }
  } catch {
    // Options fallback handled by backend defaults.
  }
}

async function fetchActivites() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await getActivites({
      search: search.value || undefined,
      statut: statut.value || undefined,
      annee_scolaire: anneeScolaire.value || undefined
    })
    items.value = data.items || []
    total.value = data.total || 0
    if (data.annee_scolaire) {
      anneeScolaire.value = data.annee_scolaire
    }
    if (!anneesScolaires.value.length && data.annees_scolaires?.length) {
      anneesScolaires.value = data.annees_scolaires
    }
  } catch (e) {
    error.value = "Impossible de charger les activités : " + e.message
  } finally {
    loading.value = false
  }
}

function onSearchInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchActivites, 300)
}

function resetForm() {
  form.title = ''
  form.type_activite = 'autre'
  form.statut_activite = 'planifiee'
  form.date_activite = ''
  form.date_limite_inscription = ''
  form.montant_participation = 0
  form.objectif_collecte = 0
  form.classes_cibles = []
  form.participation_obligatoire = false
  form.description = ''
}

function openCreate() {
  createError.value = ''
  resetForm()
  showCreate.value = true
}

function closeCreate() {
  showCreate.value = false
}

async function submitCreate() {
  creating.value = true
  createError.value = ''
  try {
    const { data } = await createActivite({
      ...form,
      annee_scolaire: anneeScolaire.value
    })
    showCreate.value = false
    if (data.item?.id) {
      router.push(`/app/activites/${data.item.id}`)
      return
    }
    await fetchActivites()
  } catch (e) {
    createError.value = e.response?.data?.message || e.message
  } finally {
    creating.value = false
  }
}

onMounted(async () => {
  await loadOptions()
  await fetchActivites()
})
</script>

<style scoped>
.page-lead {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--color-text-muted);
}

.list-toolbar select {
  min-width: 160px;
}

.activite-progress {
  margin-top: 8px;
}

.activite-progress__bar {
  height: 6px;
  background: var(--color-bg);
  border-radius: 999px;
  overflow: hidden;
}

.activite-progress__fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 999px;
}

.activite-progress__label {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px 12px;
}

.checkbox-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  line-height: 1.35;
  white-space: normal;
}

.checkbox-item input[type='checkbox'] {
  width: auto;
  flex-shrink: 0;
  margin-top: 2px;
  accent-color: var(--color-primary);
}

.student-badge.is-active {
  background: #dbeafe;
  color: #2563eb;
}

.student-badge.is-paid {
  background: #dcfce7;
  color: #16a34a;
}

.student-badge.is-cancelled {
  background: var(--color-bg);
  color: var(--color-text-muted);
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
