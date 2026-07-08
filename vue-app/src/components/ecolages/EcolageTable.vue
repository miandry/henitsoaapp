<template>
  <div class="ecolage-table-wrap">
    <table class="ecolage-table">
      <thead>
        <tr>
          <th><button type="button" class="th-sort" @click="sortBy('eleve')">Élève {{ sortIcon('eleve') }}</button></th>
          <th><button type="button" class="th-sort" @click="sortBy('classe')">Classe {{ sortIcon('classe') }}</button></th>
          <th class="num"><button type="button" class="th-sort" @click="sortBy('montant_du')">Dû {{ sortIcon('montant_du') }}</button></th>
          <th class="num"><button type="button" class="th-sort" @click="sortBy('montant_paye')">Payé {{ sortIcon('montant_paye') }}</button></th>
          <th class="num"><button type="button" class="th-sort" @click="sortBy('solde')">Solde {{ sortIcon('solde') }}</button></th>
          <th><button type="button" class="th-sort" @click="sortBy('statut')">Statut {{ sortIcon('statut') }}</button></th>
          <th>Dernier paiement</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="8" class="ecolage-table__loading">Chargement...</td>
        </tr>
        <tr v-else-if="!items.length">
          <td colspan="8" class="ecolage-table__empty">Aucun élève trouvé.</td>
        </tr>
        <tr
          v-for="row in items"
          :key="row.inscription_id"
          class="ecolage-table__row"
          @click="$emit('row-click', row)"
        >
          <td><strong>{{ row.eleve }}</strong></td>
          <td>{{ row.classe }}</td>
          <td class="num">{{ formatMontant(row.montant_du) }}</td>
          <td class="num">{{ formatMontant(row.montant_paye) }}</td>
          <td class="num is-solde">{{ formatMontant(row.solde) }}</td>
          <td>
            <span class="status-badge" :class="statusClass(row.statut)">{{ row.statut_label }}</span>
          </td>
          <td>{{ row.dernier_paiement || '—' }}</td>
          <td>
            <button
              type="button"
              class="btn-secondary btn-secondary--sm"
              @click.stop="$emit('pay', row)"
            >
              Payer
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="total > limit" class="ecolage-table__pagination">
      <button type="button" class="btn-secondary btn-secondary--sm" :disabled="page <= 0" @click="$emit('page', page - 1)">
        Précédent
      </button>
      <span>Page {{ page + 1 }} / {{ totalPages }}</span>
      <button type="button" class="btn-secondary btn-secondary--sm" :disabled="page >= totalPages - 1" @click="$emit('page', page + 1)">
        Suivant
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  total: { type: Number, default: 0 },
  page: { type: Number, default: 0 },
  limit: { type: Number, default: 25 },
  sort: { type: String, default: 'solde' },
  direction: { type: String, default: 'desc' }
})

const emit = defineEmits(['sort', 'page', 'pay', 'row-click'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.limit)))

function formatMontant(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} Ar`
}

function statusClass(statut) {
  return `is-${statut}`
}

function sortBy(column) {
  const direction = props.sort === column && props.direction === 'desc' ? 'asc' : 'desc'
  emit('sort', { sort: column, direction })
}

function sortIcon(column) {
  if (props.sort !== column) return ''
  return props.direction === 'asc' ? '↑' : '↓'
}
</script>

<style scoped>
.ecolage-table-wrap {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow-x: auto;
}

.ecolage-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.ecolage-table th,
.ecolage-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.ecolage-table th.num,
.ecolage-table td.num {
  text-align: right;
}

.th-sort {
  border: none;
  background: none;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  color: inherit;
}

.ecolage-table__row {
  cursor: pointer;
}

.ecolage-table__row:hover {
  background: var(--color-bg);
}

.ecolage-table__loading,
.ecolage-table__empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: 24px !important;
}

.is-solde {
  color: var(--color-primary);
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge.is-a_jour { background: #dcfce7; color: #16a34a; }
.status-badge.is-partiel { background: #ffedd5; color: #c2410c; }
.status-badge.is-retard { background: #fee2e2; color: #dc2626; }
.status-badge.is-exonere { background: var(--color-bg); color: var(--color-text-muted); }

.ecolage-table__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .ecolage-table th:nth-child(2),
  .ecolage-table td:nth-child(2),
  .ecolage-table th:nth-child(7),
  .ecolage-table td:nth-child(7) {
    display: none;
  }
}
</style>
