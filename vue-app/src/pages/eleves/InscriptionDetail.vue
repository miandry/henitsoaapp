<template>
  <section>
    <div class="page-header">
      <button type="button" class="btn-back" @click="$router.back()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Retour
      </button>
      <button v-if="item" type="button" class="btn-add" @click="openEdit">
        Modifier
      </button>
    </div>

    <p v-if="loading" class="list-loading">Chargement...</p>
    <p v-else-if="error" class="list-error">{{ error }}</p>

    <template v-else-if="item">
      <div class="detail-card">
        <div class="detail-header">
          <img v-if="item.eleve?.photo_url" :src="item.eleve.photo_url" :alt="fullName" class="detail-photo" />
          <div v-else class="detail-photo detail-photo--placeholder">{{ initials(fullName) }}</div>
          <div class="detail-header__info">
            <h1 class="detail-name">{{ fullName }}</h1>
            <div class="detail-meta">
              <span class="student-badge">{{ item.classe || '—' }}</span>
              <span>{{ item.annee_scolaire || '—' }}</span>
            </div>
          </div>
        </div>
        <div class="detail-actions">
          <a class="btn-secondary" :href="`/admin/build?id=${item.id}`">
            Télécharger le carnet
          </a>
          <button
            v-if="item.eleve_nid"
            type="button"
            class="btn-secondary btn-secondary--sm"
            @click="$router.push(`/app/archives-eleves/${item.eleve_nid}`)"
          >
            Voir la fiche élève
          </button>
        </div>
      </div>

      <div class="detail-card">
        <h2 class="detail-section-title">Informations de l'inscription</h2>
        <div class="detail-grid">
          <div class="detail-row">
            <span class="detail-label">Référence</span>
            <span class="detail-value">#{{ item.id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Année scolaire</span>
            <span class="detail-value">{{ item.annee_scolaire || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Classe</span>
            <span class="detail-value">{{ item.classe || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Droit d'inscription</span>
            <span class="detail-value">{{ item.droit_inscription_label || item.droits_status_label || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date de paiement</span>
            <span class="detail-value">{{ formatDate(item.date_payment || item.date_de_payement) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Montant</span>
            <span class="detail-value">{{ formatMontant(item.montant) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Description</span>
            <span class="detail-value">{{ item.description || '—' }}</span>
          </div>
        </div>
      </div>

      <div class="detail-card" v-if="item.eleve">
        <h2 class="detail-section-title">Informations de l'élève</h2>
        <div class="detail-grid">
          <div class="detail-row">
            <span class="detail-label">Matricule</span>
            <span class="detail-value">{{ item.eleve.matricule || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nom</span>
            <span class="detail-value">{{ item.eleve.nom || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Prénom</span>
            <span class="detail-value">{{ item.eleve.prenom || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Genre</span>
            <span class="detail-value">{{ item.eleve.genre_label || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date de naissance</span>
            <span class="detail-value">{{ formatDate(item.eleve.date_de_naissance) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Lieu de naissance</span>
            <span class="detail-value">{{ item.eleve.lieu_de_naissance || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date d'entrée</span>
            <span class="detail-value">{{ formatDate(item.eleve.date_entre) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date de sortie</span>
            <span class="detail-value">{{ formatDate(item.eleve.date_sortie) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Téléphone</span>
            <span class="detail-value">{{ item.eleve.phone || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Adresse</span>
            <span class="detail-value">{{ item.eleve.adresse || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Père</span>
            <span class="detail-value">{{ item.eleve.nom_pere || '—' }} <small v-if="item.eleve.profession_pere">({{ item.eleve.profession_pere }})</small></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Mère</span>
            <span class="detail-value">{{ item.eleve.nom_mere || '—' }} <small v-if="item.eleve.profession_mere">({{ item.eleve.profession_mere }})</small></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Tuteur</span>
            <span class="detail-value">{{ item.eleve.tuteur || '—' }}</span>
          </div>
        </div>
      </div>

      <div class="detail-card">
        <h2 class="detail-section-title">Écolages {{ item.annee_scolaire }}</h2>
        <p class="ecolage-hint">Cliquez sur un mois pour enregistrer ou voir le paiement.</p>
        <div class="months-grid">
          <button
            v-for="m in item.ecolage_months"
            :key="m.id"
            type="button"
            class="month-chip month-chip--clickable"
            :class="{ 'is-paid': m.paid }"
            @click="onMonthClick(m)"
          >
            <span class="dot-icon"></span>
            {{ m.nom }}
          </button>
        </div>
      </div>
    </template>

    <Modal v-if="showEdit" title="Modifier l'inscription" @close="closeEdit">
      <form @submit.prevent="submitEdit">
        <p v-if="editError" class="form-error">{{ editError }}</p>

        <div class="form-field">
          <label for="edit-ins-classe">Classe</label>
          <select id="edit-ins-classe" v-model="form.classe_tid" required>
            <option value="" disabled>Sélectionner une classe</option>
            <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.nom }}</option>
          </select>
        </div>

        <div class="form-field">
          <label for="edit-ins-annee">Année scolaire</label>
          <select id="edit-ins-annee" v-model="form.annee_scolaire" required>
            <option value="" disabled>Sélectionner une année</option>
            <option v-for="y in anneesScolaires" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <div class="form-field">
          <label for="edit-ins-droit">Droit d'inscription</label>
          <select id="edit-ins-droit" v-model="form.droit_inscription" required>
            <option value="" disabled>Sélectionner</option>
            <option v-for="d in droitsInscription" :key="d.value" :value="d.value">{{ d.label }}</option>
          </select>
        </div>

        <div class="form-field">
          <label for="edit-ins-date-payement">Date de paiement</label>
          <input id="edit-ins-date-payement" v-model="form.date_de_payement" type="date" required />
        </div>

        <div class="form-field">
          <label for="edit-ins-montant">Montant (Ar)</label>
          <input id="edit-ins-montant" v-model.number="form.montant" type="number" min="0" required />
        </div>

        <div class="form-field">
          <label for="edit-ins-description">Description</label>
          <textarea id="edit-ins-description" v-model="form.description" rows="3" placeholder="Optionnel"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="closeEdit">Annuler</button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="saving || !form.classe_tid || !form.annee_scolaire || !form.droit_inscription || !form.date_de_payement || form.montant === null || form.montant < 0"
          >
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </Modal>

    <PaymentModal
      v-if="payMonth"
      :row="paymentRow"
      :mois="item?.ecolage_months || []"
      :modes-paiement="modesPaiement"
      :annee-scolaire="item?.annee_scolaire || ''"
      :initial-mois-id="payMonth.id"
      lock-mois
      @close="payMonth = null"
      @saved="onPaymentSaved"
    />

    <EcolageMonthDetail
      v-if="detailMonth"
      :month="detailMonth"
      :payment="detailMonth.payment"
      @close="detailMonth = null"
    />
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  getInscriptionDetail,
  updateInscription,
  getClasses,
  getInscriptionFormOptions,
  getEcolageFormOptions
} from '../../services/api.js'
import Modal from '../../components/Modal.vue'
import PaymentModal from '../../components/ecolages/PaymentModal.vue'
import EcolageMonthDetail from '../../components/ecolages/EcolageMonthDetail.vue'

const route = useRoute()
const item = ref(null)
const loading = ref(true)
const error = ref('')
const showEdit = ref(false)
const saving = ref(false)
const editError = ref('')
const classes = ref([])
const anneesScolaires = ref([])
const droitsInscription = ref([])
const payMonth = ref(null)
const detailMonth = ref(null)
const modesPaiement = ref([
  { value: 'especes', label: 'Espèces' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'virement', label: 'Virement' }
])

const paymentRow = computed(() => {
  if (!item.value) return null
  return {
    inscription_id: item.value.id,
    eleve: fullName.value,
    monthly_fee: 25000
  }
})

const form = reactive({
  classe_tid: '',
  annee_scolaire: '',
  droit_inscription: '',
  date_de_payement: '',
  montant: null,
  description: ''
})

const fullName = computed(() => {
  if (!item.value) return ''
  if (item.value.eleve) {
    return [item.value.eleve.nom, item.value.eleve.prenom].filter(Boolean).join(' ').trim() || item.value.matricule
  }
  return item.value.matricule || 'Sans nom'
})

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatMontant(value) {
  if (value === null || value === undefined || value === '') return '—'
  return `${Number(value).toLocaleString('fr-FR')} Ar`
}

function toInputDate(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function fillForm(data) {
  form.classe_tid = data.classe_tid || ''
  form.annee_scolaire = data.annee_scolaire || ''
  form.droit_inscription = data.droit_inscription ?? data.droits_status ?? ''
  form.date_de_payement = toInputDate(data.date_payment || data.date_de_payement)
  form.montant = data.montant ?? null
  form.description = data.description || ''
}

async function openEdit() {
  fillForm(item.value)
  editError.value = ''
  showEdit.value = true
  try {
    const [classesRes, formRes] = await Promise.all([
      getClasses({}),
      getInscriptionFormOptions()
    ])
    classes.value = classesRes.data.items || []
    anneesScolaires.value = formRes.data.annees_scolaires || classesRes.data.annees_scolaires || []
    droitsInscription.value = formRes.data.droits_inscription || []
  } catch (e) {
    editError.value = "Impossible de charger le formulaire : " + e.message
  }
}

function closeEdit() {
  showEdit.value = false
}

function onMonthClick(month) {
  if (month.paid && month.payment) {
    detailMonth.value = month
    payMonth.value = null
  } else {
    payMonth.value = month
    detailMonth.value = null
  }
}

async function onPaymentSaved() {
  payMonth.value = null
  await loadItem()
}

async function loadItem() {
  const { data } = await getInscriptionDetail(route.params.id)
  item.value = data.item
}

async function submitEdit() {
  saving.value = true
  editError.value = ''
  try {
    const { data } = await updateInscription(route.params.id, {
      classe_tid: form.classe_tid,
      annee_scolaire: form.annee_scolaire,
      droit_inscription: form.droit_inscription,
      date_de_payement: form.date_de_payement,
      montant: form.montant ?? 0,
      description: form.description.trim()
    })
    item.value = data.item
    showEdit.value = false
  } catch (e) {
    editError.value = e.response?.data?.message || "Impossible d'enregistrer : " + e.message
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    await loadItem()
    const { data: formRes } = await getEcolageFormOptions()
    modesPaiement.value = [
      { value: 'especes', label: 'Espèces' },
      { value: 'mobile_money', label: 'Mobile Money' },
      { value: 'virement', label: 'Virement' }
    ]
  } catch (e) {
    error.value = e.response?.data?.message || "Impossible de charger l'inscription : " + e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.ecolage-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.month-chip--clickable {
  cursor: pointer;
  font-family: inherit;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.month-chip--clickable:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.month-chip--clickable.is-paid:hover {
  border-color: #16a34a;
}
</style>
