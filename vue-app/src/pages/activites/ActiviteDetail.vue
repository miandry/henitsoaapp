<template>
  <section>
    <div class="page-header">
      <button type="button" class="btn-back" @click="$router.push('/app/activites')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Retour aux activités
      </button>
      <div class="page-header__actions" v-if="item">
        <button type="button" class="btn-add" @click="openEdit">Modifier</button>
        <button type="button" class="btn-secondary" @click="showInscription = true">Inscrire un élève</button>
      </div>
    </div>

    <p v-if="loading" class="list-loading">Chargement...</p>
    <p v-else-if="error" class="list-error">{{ error }}</p>

    <template v-else-if="item">
      <div class="detail-card">
        <h1 class="detail-name">{{ item.title }}</h1>
        <div class="detail-meta">
          <span class="student-badge">{{ item.type_activite_label }}</span>
          <span class="student-badge" :class="statutClass(item.statut_activite)">{{ item.statut_activite_label }}</span>
          <span v-if="item.date_activite">Activité : {{ formatDate(item.date_activite) }}</span>
          <span v-if="item.date_limite_inscription">Limite : {{ formatDate(item.date_limite_inscription) }}</span>
          <span v-if="item.annee_scolaire">Année : {{ item.annee_scolaire }}</span>
          <span>{{ formatMoney(item.montant_participation) }} Ar / élève</span>
          <span v-if="item.participation_obligatoire" class="student-badge is-active">Obligatoire</span>
        </div>
        <p v-if="item.description" class="detail-description">{{ item.description }}</p>
        <p v-if="item.classes_cibles?.length" class="detail-classes">
          Classes : {{ item.classes_cibles.join(', ') }}
        </p>
        <p v-else class="detail-classes">Classes : toutes</p>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <span class="summary-card__label">Inscrits</span>
          <strong class="summary-card__value">{{ summary.inscrits || 0 }}</strong>
        </div>
        <div class="summary-card summary-card--success">
          <span class="summary-card__label">Payés</span>
          <strong class="summary-card__value">{{ summary.payes || 0 }}</strong>
        </div>
        <div class="summary-card summary-card--danger">
          <span class="summary-card__label">Non payés</span>
          <strong class="summary-card__value">{{ summary.non_payes || 0 }}</strong>
        </div>
        <div class="summary-card summary-card--warning" v-if="summary.partiels">
          <span class="summary-card__label">Partiels</span>
          <strong class="summary-card__value">{{ summary.partiels }}</strong>
        </div>
      </div>

      <div class="detail-card">
        <h2 class="detail-section-title">Collecte vs objectif</h2>
        <div class="collecte-bar">
          <div class="collecte-bar__fill" :style="{ width: `${summary.taux || 0}%` }"></div>
        </div>
        <p class="collecte-label">
          <strong>{{ formatMoney(summary.collecte) }} Ar</strong> collectés sur
          <strong>{{ formatMoney(summary.objectif) }} Ar</strong> ({{ summary.taux || 0 }}%)
        </p>
      </div>

      <div class="list-card">
        <div class="list-toolbar">
          <input v-model="filter" type="search" placeholder="Filtrer par nom ou classe..." />
          <select v-model="filterPaiement">
            <option value="">Tous les paiements</option>
            <option value="paye">Payé</option>
            <option value="partiel">Partiellement payé</option>
            <option value="non_paye">Non payé</option>
          </select>
        </div>

        <div class="table-wrap participants-table">
          <table class="data-table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Classe</th>
                <th>Inscription</th>
                <th>Paiement</th>
                <th>Montant payé</th>
                <th>Solde</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredParticipants" :key="row.participation_id">
                <td>
                  <router-link :to="row.url_eleve" class="table-link">{{ row.eleve }}</router-link>
                </td>
                <td>{{ row.classe }}</td>
                <td>
                  <span class="student-badge" :class="inscriptionClass(row.statut_inscription)">
                    {{ row.statut_inscription_label }}
                  </span>
                </td>
                <td>
                  <span class="student-badge" :class="paiementClass(row.statut_paiement)">
                    {{ row.statut_paiement_label }}
                  </span>
                </td>
                <td>{{ formatMoney(row.montant_paye) }} Ar</td>
                <td>{{ formatMoney(row.solde) }} Ar</td>
                <td>
                  <button
                    v-if="row.statut_paiement !== 'paye'"
                    type="button"
                    class="btn-table"
                    @click="openPayment(row)"
                  >
                    Paiement
                  </button>
                </td>
              </tr>
              <tr v-if="filteredParticipants.length === 0">
                <td colspan="7" class="list-empty">Aucun inscrit pour le moment.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul class="participant-cards">
          <li v-for="row in filteredParticipants" :key="`card-${row.participation_id}`" class="participant-card">
            <div class="participant-card__header">
              <div class="student-avatar">{{ initials(row.eleve) }}</div>
              <div class="participant-card__title">
                <router-link :to="row.url_eleve" class="participant-card__name">{{ row.eleve }}</router-link>
                <span class="participant-card__classe">{{ row.classe }}</span>
              </div>
            </div>
            <div class="participant-card__badges">
              <span class="student-badge" :class="inscriptionClass(row.statut_inscription)">
                {{ row.statut_inscription_label }}
              </span>
              <span class="student-badge" :class="paiementClass(row.statut_paiement)">
                {{ row.statut_paiement_label }}
              </span>
            </div>
            <div class="participant-card__amounts">
              <div class="participant-card__amount">
                <span class="participant-card__label">Montant payé</span>
                <strong>{{ formatMoney(row.montant_paye) }} Ar</strong>
              </div>
              <div class="participant-card__amount">
                <span class="participant-card__label">Solde</span>
                <strong>{{ formatMoney(row.solde) }} Ar</strong>
              </div>
            </div>
            <button
              v-if="row.statut_paiement !== 'paye'"
              type="button"
              class="btn-secondary btn-secondary--sm participant-card__action"
              @click="openPayment(row)"
            >
              Paiement
            </button>
          </li>
          <li v-if="filteredParticipants.length === 0" class="list-empty">Aucun inscrit pour le moment.</li>
        </ul>
      </div>
    </template>

    <Modal v-if="showInscription" title="Inscrire un élève" @close="showInscription = false">
      <form @submit.prevent="submitInscription">
        <p v-if="inscriptionError" class="form-error">{{ inscriptionError }}</p>
        <div class="form-field">
          <label>Inscription élève</label>
          <InscriptionAutocomplete
            v-model="selectedInscription"
            :annee-scolaire="item?.annee_scolaire || ''"
          />
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="showInscription = false">Annuler</button>
          <button type="submit" class="btn-primary" :disabled="inscribing || !selectedInscription">
            {{ inscribing ? 'Inscription...' : 'Inscrire' }}
          </button>
        </div>
      </form>
    </Modal>

    <Modal
      v-if="paymentRow"
      :title="`Paiement — ${paymentRow.eleve}`"
      @close="paymentRow = null"
    >
      <form @submit.prevent="submitPayment">
        <p v-if="paymentError" class="form-error">{{ paymentError }}</p>
        <p v-if="paymentSuccess" class="form-success">
          Paiement enregistré. Reçu : <strong>{{ paymentSuccess }}</strong>
        </p>
        <div class="form-field">
          <label for="pay-montant">Montant (Ar)</label>
          <input
            id="pay-montant"
            v-model.number="paymentForm.montant_paye"
            type="number"
            min="1"
            required
          />
        </div>
        <div class="form-field">
          <label for="pay-date">Date</label>
          <input id="pay-date" v-model="paymentForm.date_paiement" type="date" required />
        </div>
        <div class="form-field">
          <label for="pay-mode">Mode</label>
          <select id="pay-mode" v-model="paymentForm.mode_paiement">
            <option value="especes">Espèces</option>
            <option value="virement">Virement</option>
            <option value="cheque">Chèque</option>
            <option value="mobile_money">Mobile money</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="paymentRow = null">Annuler</button>
          <button type="submit" class="btn-primary" :disabled="paying">
            {{ paying ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </Modal>

    <Modal v-if="showEdit" title="Modifier l'activité" wide @close="closeEdit">
      <form @submit.prevent="submitEdit">
        <p v-if="editError" class="form-error">{{ editError }}</p>
        <div class="form-field">
          <label for="edit-act-title">Titre</label>
          <input id="edit-act-title" v-model="form.title" type="text" required />
        </div>
        <div class="form-row">
          <div class="form-field">
            <label for="edit-act-type">Type</label>
            <select id="edit-act-type" v-model="form.type_activite">
              <option v-for="(label, value) in typesActivite" :key="value" :value="value">{{ label }}</option>
            </select>
          </div>
          <div class="form-field">
            <label for="edit-act-statut">Statut</label>
            <select id="edit-act-statut" v-model="form.statut_activite">
              <option v-for="(label, value) in statutsActivite" :key="value" :value="value">{{ label }}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label for="edit-act-date">Date de l'activité</label>
            <input id="edit-act-date" v-model="form.date_activite" type="date" />
          </div>
          <div class="form-field">
            <label for="edit-act-limite">Date limite d'inscription</label>
            <input id="edit-act-limite" v-model="form.date_limite_inscription" type="date" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label for="edit-act-montant">Montant participation (Ar)</label>
            <input id="edit-act-montant" v-model.number="form.montant_participation" type="number" min="0" />
          </div>
          <div class="form-field">
            <label for="edit-act-objectif">Objectif collecte (Ar)</label>
            <input id="edit-act-objectif" v-model.number="form.objectif_collecte" type="number" min="0" />
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
          <label for="edit-act-desc">Description</label>
          <textarea id="edit-act-desc" v-model="form.description" rows="3"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="closeEdit">Annuler</button>
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </Modal>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  getActiviteDetail,
  getActiviteFormOptions,
  updateActivite,
  createActiviteParticipation,
  createActivitePaiement
} from '../../services/api.js'
import Modal from '../../components/Modal.vue'
import InscriptionAutocomplete from '../../components/InscriptionAutocomplete.vue'

const route = useRoute()
const item = ref(null)
const summary = ref({})
const participants = ref([])
const loading = ref(true)
const error = ref('')
const filter = ref('')
const filterPaiement = ref('')

const showEdit = ref(false)
const saving = ref(false)
const editError = ref('')
const typesActivite = ref({})
const statutsActivite = ref({})
const classes = ref([])
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

const showInscription = ref(false)
const selectedInscription = ref(null)
const inscribing = ref(false)
const inscriptionError = ref('')

const paymentRow = ref(null)
const paying = ref(false)
const paymentError = ref('')
const paymentSuccess = ref('')
const paymentForm = reactive({
  montant_paye: 0,
  date_paiement: new Date().toISOString().slice(0, 10),
  mode_paiement: 'especes'
})

const filteredParticipants = computed(() => {
  const q = filter.value.trim().toLowerCase()
  return participants.value.filter((row) => {
    if (filterPaiement.value && row.statut_paiement !== filterPaiement.value) {
      return false
    }
    if (!q) return true
    return (
      String(row.eleve || '').toLowerCase().includes(q) ||
      String(row.classe || '').toLowerCase().includes(q)
    )
  })
})

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('fr-FR')
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('fr-FR')
}

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
}

function statutClass(statut) {
  if (statut === 'en_cours') return 'is-active'
  if (statut === 'terminee') return 'is-paid'
  if (statut === 'annulee') return 'is-cancelled'
  return ''
}

function inscriptionClass(statut) {
  if (statut === 'confirme') return 'is-paid'
  if (statut === 'annule') return 'is-cancelled'
  return 'is-partial'
}

function paiementClass(statut) {
  if (statut === 'paye') return 'is-paid'
  if (statut === 'partiel') return 'is-partial'
  return 'is-unpaid'
}

async function loadOptions() {
  try {
    const { data } = await getActiviteFormOptions()
    typesActivite.value = data.types_activite || {}
    statutsActivite.value = data.statuts_activite || {}
    classes.value = data.classes || []
  } catch {
    // Options fallback handled by backend defaults.
  }
}

function populateForm() {
  if (!item.value) return
  form.title = item.value.title || ''
  form.type_activite = item.value.type_activite || 'autre'
  form.statut_activite = item.value.statut_activite || 'planifiee'
  form.date_activite = item.value.date_activite || ''
  form.date_limite_inscription = item.value.date_limite_inscription || ''
  form.montant_participation = item.value.montant_participation || 0
  form.objectif_collecte = item.value.objectif_collecte || 0
  form.classes_cibles = [...(item.value.classes_cibles_ids || [])]
  form.participation_obligatoire = !!item.value.participation_obligatoire
  form.description = item.value.description || ''
}

async function openEdit() {
  editError.value = ''
  await loadOptions()
  populateForm()
  showEdit.value = true
}

function closeEdit() {
  showEdit.value = false
}

async function submitEdit() {
  saving.value = true
  editError.value = ''
  try {
    const { data } = await updateActivite(route.params.id, { ...form })
    item.value = data.item
    summary.value = data.summary || {}
    participants.value = data.participants || []
    showEdit.value = false
  } catch (e) {
    editError.value = e.response?.data?.message || e.message
  } finally {
    saving.value = false
  }
}

async function loadDetail() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await getActiviteDetail(route.params.id)
    item.value = data.item
    summary.value = data.summary || {}
    participants.value = data.participants || []
  } catch (e) {
    error.value = e.response?.data?.message || "Impossible de charger l'activité : " + e.message
  } finally {
    loading.value = false
  }
}

async function submitInscription() {
  if (!selectedInscription.value?.eleve_nid) return
  inscribing.value = true
  inscriptionError.value = ''
  try {
    const { data } = await createActiviteParticipation(route.params.id, {
      eleve_id: selectedInscription.value.eleve_nid
    })
    item.value = data.item
    summary.value = data.summary || {}
    participants.value = data.participants || []
    showInscription.value = false
    selectedInscription.value = null
  } catch (e) {
    inscriptionError.value = e.response?.data?.message || e.message
  } finally {
    inscribing.value = false
  }
}

function openPayment(row) {
  paymentRow.value = row
  paymentError.value = ''
  paymentSuccess.value = ''
  paymentForm.montant_paye = row.solde > 0 ? row.solde : row.montant_du
  paymentForm.date_paiement = new Date().toISOString().slice(0, 10)
  paymentForm.mode_paiement = 'especes'
}

async function submitPayment() {
  if (!paymentRow.value) return
  paying.value = true
  paymentError.value = ''
  try {
    const { data } = await createActivitePaiement(route.params.id, {
      eleve_id: paymentRow.value.eleve_id,
      montant_paye: paymentForm.montant_paye,
      date_paiement: paymentForm.date_paiement,
      mode_paiement: paymentForm.mode_paiement
    })
    item.value = data.item
    summary.value = data.summary || {}
    participants.value = data.participants || []
    const recu = data.participants?.find((p) => p.eleve_id === paymentRow.value.eleve_id)?.numero_recu
    paymentSuccess.value = recu || 'OK'
    setTimeout(() => {
      paymentRow.value = null
    }, 1200)
  } catch (e) {
    paymentError.value = e.response?.data?.message || e.message
  } finally {
    paying.value = false
  }
}

watch(() => route.params.id, loadDetail)
onMounted(loadDetail)
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.page-header__actions {
  display: flex;
  gap: 8px;
}

.detail-description {
  margin: 12px 0 0;
  color: var(--color-text-muted);
  font-size: 14px;
}

.detail-classes {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--color-text-muted);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.summary-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 16px;
}

.summary-card__label {
  display: block;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.summary-card__value {
  font-size: 24px;
}

.summary-card--success .summary-card__value { color: #16a34a; }
.summary-card--danger .summary-card__value { color: #dc2626; }
.summary-card--warning .summary-card__value { color: #2563eb; }

.collecte-bar {
  height: 10px;
  background: var(--color-bg);
  border-radius: 999px;
  overflow: hidden;
}

.collecte-bar__fill {
  height: 100%;
  background: var(--color-primary);
}

.collecte-label {
  margin: 10px 0 0;
  font-size: 14px;
}

.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th,
.data-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.data-table th {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-text-muted);
}

.table-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.btn-table {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
}

.participant-cards {
  display: none;
  list-style: none;
  margin: 0;
  padding: 0;
}

.participant-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 14px;
}

.participant-card + .participant-card {
  margin-top: 12px;
}

.participant-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.participant-card__title {
  min-width: 0;
}

.participant-card__name {
  display: block;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
}

.participant-card__classe {
  display: block;
  margin-top: 2px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.participant-card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.participant-card__amounts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.participant-card__amount {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.participant-card__label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.participant-card__amount strong {
  font-size: 14px;
}

.participant-card__action {
  width: 100%;
  margin-top: 12px;
}

.student-badge.is-paid { background: #dcfce7; color: #16a34a; }
.student-badge.is-partial { background: #dbeafe; color: #2563eb; }
.student-badge.is-unpaid { background: #fee2e2; color: #dc2626; }
.student-badge.is-active { background: #dbeafe; color: #2563eb; }
.student-badge.is-cancelled { background: var(--color-bg); color: var(--color-text-muted); }

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

@media (max-width: 768px) {
  .participants-table {
    display: none;
  }

  .participant-cards {
    display: block;
  }

  .list-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .list-toolbar select {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
