<template>
  <section>
    <div class="page-header">
      <h1 class="page-title">Gestion des ecolages</h1>
    </div>

    <div class="list-card" style="max-width: 480px;">
      <p v-if="formError" class="form-error">{{ formError }}</p>
      <p v-if="success" class="form-success">Écolage enregistré pour {{ success.eleve }} — {{ success.mois }} ({{ success.status_label }}).</p>

      <form @submit.prevent="submit">
        <div class="form-field">
          <label>Inscription</label>
          <InscriptionAutocomplete v-model="inscrit" />
        </div>

        <div class="form-field">
          <label for="ecolage-mois">Mois</label>
          <select id="ecolage-mois" v-model="moisTid" required>
            <option value="" disabled>Sélectionner un mois</option>
            <option v-for="m in mois" :key="m.id" :value="m.id">{{ m.nom }}</option>
          </select>
        </div>

        <div class="form-field">
          <label for="ecolage-annee">Année scolaire</label>
          <select id="ecolage-annee" v-model="anneeScolaire" required>
            <option value="" disabled>Sélectionner une année</option>
            <option v-for="y in anneesScolaires" :key="y" :value="y">{{ y }}</option>
          </select>
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
          <button type="submit" class="btn-primary" :disabled="submitting || !inscrit || !moisTid || !anneeScolaire">
            {{ submitting ? 'Enregistrement...' : 'Enregistrer le paiement' }}
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
const moisTid = ref('')
const anneeScolaire = ref('')
const montant = ref(null)
const statusValue = ref(1)
const mois = ref([])
const statuses = ref([])
const anneesScolaires = ref([])
const submitting = ref(false)
const formError = ref('')
const success = ref(null)

async function loadOptions() {
  try {
    const [{ data: formOptions }, { data: classesData }] = await Promise.all([
      getEcolageFormOptions(),
      getClasses({})
    ])
    mois.value = formOptions.mois || []
    statuses.value = formOptions.statuses || []
    anneesScolaires.value = classesData.annees_scolaires || []
    anneeScolaire.value = classesData.annee_scolaire || ''
  } catch (e) {
    formError.value = "Impossible de charger le formulaire : " + e.message
  }
}

async function submit() {
  submitting.value = true
  formError.value = ''
  success.value = null
  try {
    const { data } = await createEcolage({
      inscrit_nid: inscrit.value.id,
      mois_tid: moisTid.value,
      annee_scolaire: anneeScolaire.value,
      montant: montant.value || 0,
      status: statusValue.value
    })
    success.value = data.item
    inscrit.value = null
    moisTid.value = ''
    montant.value = null
    statusValue.value = 1
  } catch (e) {
    formError.value = e.response?.data?.message || "Impossible d'enregistrer l'écolage : " + e.message
  } finally {
    submitting.value = false
  }
}

onMounted(loadOptions)
</script>

<style scoped>
.form-success {
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  margin-bottom: 16px;
}
</style>
