<template>
  <Modal :title="`Enregistrer un paiement — ${row?.eleve || ''}`" wide @close="$emit('close')">
    <form @submit.prevent="submit">
      <p v-if="error" class="form-error">{{ error }}</p>
      <p v-if="successMessage" class="form-success">{{ successMessage }}</p>
      <p v-if="skippedMessage" class="form-warning">{{ skippedMessage }}</p>

      <div v-if="lockMois" class="form-field">
        <label for="pay-mois">Mois</label>
        <select id="pay-mois" v-model="form.mois_tid" disabled required>
          <option value="" disabled>Sélectionner</option>
          <option v-for="m in mois" :key="m.id" :value="m.id">{{ m.nom }}</option>
        </select>
      </div>

      <div v-else class="form-field">
        <label>Mois <small>(sélection multiple)</small></label>
        <div class="checkbox-grid">
          <label v-for="m in mois" :key="m.id" class="checkbox-item">
            <input v-model="moisTids" type="checkbox" :value="m.id" />
            {{ m.nom }}
          </label>
        </div>
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
        <button
          type="submit"
          class="btn-primary"
          :disabled="saving || (lockMois ? !form.mois_tid : moisTids.length === 0)"
        >
          {{ saving ? 'Enregistrement...' : submitLabel }}
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
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
const moisTids = ref([])
const saving = ref(false)
const error = ref('')
const successMessage = ref('')
const skippedMessage = ref('')

const submitLabel = computed(() => {
  if (props.lockMois) return 'Enregistrer'
  const count = moisTids.value.length
  return count > 0 ? `Enregistrer ${count} paiement(s)` : 'Enregistrer'
})

watch(() => [props.row, props.initialMoisId], ([row, moisId]) => {
  if (row) {
    form.montant = row.monthly_fee || row.montant_du || 25000
    form.mois_tid = moisId ? String(moisId) : ''
    moisTids.value = moisId ? [Number(moisId)] : []
    error.value = ''
    successMessage.value = ''
    skippedMessage.value = ''
  }
}, { immediate: true })

async function submit() {
  if (!props.row) return
  saving.value = true
  error.value = ''
  successMessage.value = ''
  skippedMessage.value = ''
  try {
    const payload = {
      inscrit_nid: props.row.inscription_id,
      annee_scolaire: props.anneeScolaire,
      montant: form.montant || 0,
      status: '1',
      date_paiement: form.date_paiement,
      mode_paiement: form.mode_paiement
    }

    if (props.lockMois) {
      payload.mois_tid = form.mois_tid
    } else {
      payload.mois_tids = moisTids.value
    }

    const { data } = await createEcolage(payload)
    const items = data.items || (data.item ? [data.item] : [])

    if (items.length === 1) {
      successMessage.value = `Paiement enregistré. Reçu : ${items[0].receipt_number}`
    } else {
      const moisLabels = items.map((item) => item.mois).join(', ')
      successMessage.value = `${data.created || items.length} paiement(s) enregistré(s) — ${moisLabels}.`
    }

    if (data.skipped?.length) {
      skippedMessage.value = `${data.skipped.length} mois ignoré(s) (déjà enregistrés) : ${data.skipped.map((s) => s.mois).join(', ')}.`
    }

    emit('saved', data.items || data.item)
    setTimeout(() => emit('close'), 1200)
  } catch (e) {
    error.value = e.response?.data?.message || e.message
    if (e.response?.data?.skipped?.length) {
      skippedMessage.value = `${e.response.data.skipped.length} mois déjà enregistré(s) : ${e.response.data.skipped.map((s) => s.mois).join(', ')}.`
    }
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

.form-warning {
  background: #fffbeb;
  color: #b45309;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  margin-bottom: 12px;
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
