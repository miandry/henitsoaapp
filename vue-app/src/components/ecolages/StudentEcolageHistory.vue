<template>
  <Modal :title="`Historique — ${history?.item?.eleve || ''}`" wide @close="$emit('close')">
    <p v-if="loading" class="list-loading">Chargement...</p>
    <p v-else-if="error" class="form-error">{{ error }}</p>
    <template v-else-if="history">
      <div class="history-summary">
        <div><span>Dû</span><strong>{{ formatMontant(history.item.montant_du) }}</strong></div>
        <div><span>Payé</span><strong>{{ formatMontant(history.item.montant_paye) }}</strong></div>
        <div><span>Solde</span><strong class="is-solde">{{ formatMontant(history.item.solde) }}</strong></div>
        <div>
          <span>Statut</span>
          <span class="status-badge" :class="statusClass(history.item.statut)">{{ history.item.statut_label }}</span>
        </div>
      </div>

      <h3 class="history-subtitle">Mois de l'année</h3>
      <div class="months-grid">
        <span
          v-for="m in history.mois_status"
          :key="m.id"
          class="month-chip"
          :class="{ 'is-paid': m.paid }"
        >{{ m.nom }}</span>
      </div>

      <h3 class="history-subtitle">Paiements enregistrés</h3>
      <ul v-if="history.paiements?.length" class="history-list">
        <li v-for="p in history.paiements" :key="p.id">
          <router-link :to="p.url" class="history-list__item">
            <span>{{ p.mois }} · {{ p.date }}</span>
            <strong>{{ formatMontant(p.montant) }}</strong>
            <small>{{ p.description || p.status_label }}</small>
          </router-link>
        </li>
      </ul>
      <p v-else class="history-empty">Aucun paiement enregistré.</p>

      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="printReceipt">
          Imprimer relevé
        </button>
        <button type="button" class="btn-primary" @click="$emit('pay', history.item)">
          Enregistrer un paiement
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import Modal from '../Modal.vue'
import { getEcolageSuiviHistory } from '../../services/api.js'

const props = defineProps({
  inscriptionId: { type: [Number, String], default: null }
})

const emit = defineEmits(['close', 'pay'])

const loading = ref(false)
const error = ref('')
const history = ref(null)

watch(() => props.inscriptionId, load, { immediate: true })

async function load() {
  if (!props.inscriptionId) return
  loading.value = true
  error.value = ''
  try {
    const { data } = await getEcolageSuiviHistory(props.inscriptionId)
    history.value = data
  } catch (e) {
    error.value = e.response?.data?.message || e.message
  } finally {
    loading.value = false
  }
}

function formatMontant(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} Ar`
}

function statusClass(statut) {
  return `is-${statut}`
}

function printReceipt() {
  window.print()
}
</script>

<style scoped>
.history-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--color-bg);
  border-radius: 8px;
}

.history-summary span {
  display: block;
  font-size: 11px;
  color: var(--color-text-muted);
}

.history-summary strong {
  font-size: 15px;
}

.is-solde { color: var(--color-primary); }

.history-subtitle {
  margin: 16px 0 8px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.months-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.month-chip {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  background: #fee2e2;
  color: #dc2626;
}

.month-chip.is-paid {
  background: #dcfce7;
  color: #16a34a;
}

.history-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.history-list__item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2px 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border);
  text-decoration: none;
  color: inherit;
  font-size: 13px;
}

.history-list__item small {
  grid-column: 1 / -1;
  color: var(--color-text-muted);
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge.is-a_jour { background: #dcfce7; color: #16a34a; }
.status-badge.is-partiel { background: #ffedd5; color: #c2410c; }
.status-badge.is-retard { background: #fee2e2; color: #dc2626; }
.status-badge.is-exonere { background: var(--color-bg); color: var(--color-text-muted); }

.history-empty {
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>
