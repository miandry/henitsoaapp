<template>
  <Modal :title="`Enregistrer un paiement — ${row?.eleve || ''}`" @close="$emit('close')">
    <form @submit.prevent="submit">
      <p v-if="error" class="form-error">{{ error }}</p>
      <p v-if="success" class="form-success">
        Paiement enregistré. Reçu : <strong>{{ success.receipt_number }}</strong>
      </p>

      <div class="form-field">
        <label for="pay-mois">Mois</label>
        <select id="pay-mois" v-model="form.mois_tid" :disabled="lockMois" required>
          <option value="" disabled>Sélectionner</option>
          <option v-for="m in mois" :key="m.id" :value="m.id">{{ m.nom }}</option>
        </select>
      </div>

      <div class="form-field">
        <label for="pay-montant">Montant (Ar)</label>
        <input id="pay-montant" v-model.number="form.montant" type="number" min="0" required />
      </div>

      <div class="form-field">
        <label for="pay-date">Date de paiement</label>
        <input id="pay-date" v-model="form.date_paiement" type="date" required />
      </div>

      <div class="form-field">
        <label for="pay-mode">
          Mode de paiement
          <span class="badge-demo">démo</span>
        </label>
        <select id="pay-mode" v-model="form.mode_paiement">
          <option v-for="m in modesPaiement" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="$emit('close')">Annuler</button>
        <button type="submit" class="btn-primary" :disabled="saving || !form.mois_tid">
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import Modal from '../Modal.vue'
import { createEcolage } from '../../services/api.js'

const props = defineProps({
  row: { type: Object, default: null },
  mois: { type: Array, default: () => [] },
  modesPaiement: { type: Array, default: () => [] },
  anneeScolaire: { type: String, default: '' },
  initialMoisId: { type: [Number, String], default: '' },
  lockMois: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'saved'])

const form = reactive({
  mois_tid: '',
  montant: null,
  date_paiement: new Date().toISOString().slice(0, 10),
  mode_paiement: 'especes'
})
const saving = ref(false)
const error = ref('')
const success = ref(null)

watch(() => [props.row, props.initialMoisId], ([row, moisId]) => {
  if (row) {
    form.montant = row.monthly_fee || row.montant_du || 25000
    form.mois_tid = moisId ? String(moisId) : ''
    error.value = ''
    success.value = null
  }
}, { immediate: true })

async function submit() {
  if (!props.row) return
  saving.value = true
  error.value = ''
  try {
    const { data } = await createEcolage({
      inscrit_nid: props.row.inscription_id,
      mois_tid: form.mois_tid,
      annee_scolaire: props.anneeScolaire,
      montant: form.montant || 0,
      status: '1',
      date_paiement: form.date_paiement,
      mode_paiement: form.mode_paiement
    })
    success.value = data.item
    emit('saved', data.item)
    setTimeout(() => emit('close'), 1200)
  } catch (e) {
    error.value = e.response?.data?.message || e.message
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.badge-demo {
  font-size: 9px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--color-accent-light);
  color: #92400e;
  text-transform: uppercase;
  margin-left: 6px;
}

.form-success {
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  margin-bottom: 12px;
}
</style>
