<template>
  <Modal :title="`Écolage — ${month?.nom || ''}`" @close="$emit('close')">
    <div v-if="payment" class="payment-detail">
      <div class="payment-detail__status">
        <span class="status-badge is-paid">{{ payment.status_label }}</span>
      </div>
      <div class="detail-grid">
        <div class="detail-row">
          <span class="detail-label">Montant</span>
          <span class="detail-value">{{ formatMontant(payment.montant) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">{{ formatDate(payment.date) }}</span>
        </div>
        <div class="detail-row" v-if="payment.description">
          <span class="detail-label">Détails</span>
          <span class="detail-value">{{ payment.description }}</span>
        </div>
      </div>
      <div class="form-actions" style="justify-content: flex-start; margin-top: 16px;">
        <router-link
          v-if="payment.url"
          :to="payment.url"
          class="btn-secondary"
          style="text-decoration: none; display: inline-block;"
        >
          Voir le paiement
        </router-link>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import Modal from '../Modal.vue'

defineProps({
  month: { type: Object, default: null },
  payment: { type: Object, default: null }
})

defineEmits(['close'])

function formatMontant(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} Ar`
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.payment-detail__status {
  margin-bottom: 14px;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.is-paid {
  background: #dcfce7;
  color: #16a34a;
}
</style>
