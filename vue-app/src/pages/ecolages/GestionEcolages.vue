<template>
  <section>
    <div class="page-header">
      <h1 class="page-title">Gestion des ecolages</h1>
    </div>

    <div class="list-card form-card">
      <p v-if="formError" class="form-error">{{ formError }}</p>
      <p v-if="successMessage" class="form-success">{{ successMessage }}</p>
      <p v-if="skippedMessage" class="form-warning">{{ skippedMessage }}</p>

      <form @submit.prevent="submit">
        <div class="form-field">
          <label>Inscription</label>
          <InscriptionAutocomplete v-model="inscrit" :annee-scolaire="anneeScolaire" />
        </div>

        <div class="form-field">
          <label>Mois <small>(sélection multiple)</small></label>
          <div class="checkbox-grid">
            <label v-for="m in mois" :key="m.id" class="checkbox-item">
              <input v-model="moisTids" type="checkbox" :value="m.id" />
              {{ m.nom }}
            </label>
          </div>
        </div>

        <div class="form-field">
          <label>Année scolaire</label>
          <div class="annee-readonly">{{ anneeScolaire || '—' }}</div>
        </div>

        <div class="form-field">
          <label for="ecolage-montant">Montant (Ar)</label>
          <input id="ecolage-montant" v-model.number="montant" type="number" min="0" placeholder="ex. 30000" required />
        </div>

        <div class="form-field">
          <label for="ecolage-status">Statut</label>
          <select id="ecolage-status" v-model="statusValue" required>
            <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn-primary"
            :disabled="submitting || !inscrit || moisTids.length === 0 || !anneeScolaire"
          >
            {{ submitting ? 'Enregistrement...' : `Enregistrer ${moisTids.length || ''} paiement(s)` }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createEcolage, getEcolageFormOptions, getClasses } from '../../services/api.js'
import InscriptionAutocomplete from '../../components/InscriptionAutocomplete.vue'

const inscrit = ref(null)
const moisTids = ref([])
const anneeScolaire = ref('')
const montant = ref(null)
const statusValue = ref(1)
const mois = ref([])
const statuses = ref([])
const submitting = ref(false)
const formError = ref('')
const successMessage = ref('')
const skippedMessage = ref('')

async function loadOptions() {
  try {
    const [{ data: formOptions }, { data: classesData }] = await Promise.all([
      getEcolageFormOptions(),
      getClasses({})
    ])
    mois.value = formOptions.mois || []
    statuses.value = formOptions.statuses || []
    anneeScolaire.value = classesData.annee_scolaire || formOptions.annee_scolaire || ''
  } catch (e) {
    formError.value = "Impossible de charger le formulaire : " + e.message
  }
}

async function submit() {
  submitting.value = true
  formError.value = ''
  successMessage.value = ''
  skippedMessage.value = ''
  try {
    const { data } = await createEcolage({
      inscrit_nid: inscrit.value.id,
      mois_tids: moisTids.value,
      annee_scolaire: anneeScolaire.value,
      montant: montant.value || 0,
      status: statusValue.value
    })

    const items = data.items || (data.item ? [data.item] : [])
    const moisLabels = items.map((item) => item.mois).join(', ')
    successMessage.value = `${data.created || items.length} écolage(s) enregistré(s) pour ${items[0]?.eleve || inscrit.value.matricule} — ${moisLabels} (${items[0]?.status_label || ''}).`

    if (data.skipped?.length) {
      skippedMessage.value = `${data.skipped.length} mois ignoré(s) (déjà enregistrés) : ${data.skipped.map((s) => s.mois).join(', ')}.`
    }

    inscrit.value = null
    moisTids.value = []
    montant.value = null
    statusValue.value = 1
  } catch (e) {
    formError.value = e.response?.data?.message || "Impossible d'enregistrer l'écolage : " + e.message
    if (e.response?.data?.skipped?.length) {
      skippedMessage.value = `${e.response.data.skipped.length} mois déjà enregistré(s) : ${e.response.data.skipped.map((s) => s.mois).join(', ')}.`
    }
  } finally {
    submitting.value = false
  }
}

onMounted(loadOptions)
</script>

<style scoped>
.form-card {
  max-width: 560px;
}

.annee-readonly {
  padding: 9px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  background: var(--color-bg);
  color: var(--color-text);
}

.form-success {
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  margin-bottom: 16px;
}

.form-warning {
  background: #fffbeb;
  color: #b45309;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  margin-bottom: 16px;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px 12px;
}

.checkbox-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  line-height: 1.35;
}

.checkbox-item input[type='checkbox'] {
  width: auto;
  flex-shrink: 0;
  margin-top: 2px;
  accent-color: var(--color-primary);
}
</style>
