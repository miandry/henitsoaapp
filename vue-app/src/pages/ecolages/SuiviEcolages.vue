<template>
  <section>
    <div class="page-header">
      <div>
        <h1 class="page-title">Suivi des écolages</h1>
        <p class="page-lead">Qui a payé, qui est en retard, et combien il reste à collecter.</p>
      </div>
      <div class="page-header__actions">
        <button type="button" class="btn-secondary" @click="exportCsv">
          Exporter Excel (CSV)
        </button>
        <button type="button" class="btn-secondary" disabled title="Bientôt disponible">
          Export PDF <span class="badge-demo">démo</span>
        </button>
        <button type="button" class="btn-secondary" disabled title="Module SMS non installé">
          Rappel SMS <span class="badge-demo">bientôt</span>
        </button>
      </div>
    </div>

    <EcolageFilters
      v-model="filters"
      :classes="filterOptions.classes"
      :mois="filterOptions.mois"
      :statuts="filterOptions.statuts"
      :annee-scolaire="anneeScolaire"
      @change="reload"
    />

    <p v-if="error" class="list-error">{{ error }}</p>

    <template v-else>
      <EcolageSummaryCards :summary="summary" />
      <EcolageAlerts :alerts="alerts" />
      <EcolageTable
        :items="items"
        :loading="loading"
        :total="total"
        :page="page"
        :limit="limit"
        :sort="sort"
        :direction="direction"
        @sort="onSort"
        @page="onPage"
        @pay="openPayment"
        @row-click="openHistory"
      />
    </template>

    <PaymentModal
      v-if="paymentRow"
      :row="paymentRow"
      :mois="filterOptions.mois"
      :modes-paiement="config.modes_paiement || []"
      :annee-scolaire="anneeScolaire"
      @close="paymentRow = null"
      @saved="reload"
    />

    <StudentEcolageHistory
      v-if="historyId"
      :inscription-id="historyId"
      @close="historyId = null"
      @pay="onHistoryPay"
    />
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getEcolageSuivi, exportEcolageSuivi } from '../../services/api.js'
import EcolageFilters from '../../components/ecolages/EcolageFilters.vue'
import EcolageSummaryCards from '../../components/ecolages/EcolageSummaryCards.vue'
import EcolageAlerts from '../../components/ecolages/EcolageAlerts.vue'
import EcolageTable from '../../components/ecolages/EcolageTable.vue'
import PaymentModal from '../../components/ecolages/PaymentModal.vue'
import StudentEcolageHistory from '../../components/ecolages/StudentEcolageHistory.vue'

const filters = reactive({
  classe_tid: '',
  statut: '',
  mois_tid: '',
  search: ''
})

const filterOptions = reactive({ classes: [], mois: [], statuts: [] })
const config = reactive({})
const summary = ref({})
const alerts = ref([])
const items = ref([])
const anneeScolaire = ref('')
const loading = ref(true)
const error = ref('')
const total = ref(0)
const page = ref(0)
const limit = ref(25)
const sort = ref('solde')
const direction = ref('desc')
const paymentRow = ref(null)
const historyId = ref(null)

function buildParams() {
  return {
    classe_tid: filters.classe_tid || undefined,
    statut: filters.statut || undefined,
    mois_tid: filters.mois_tid || undefined,
    search: filters.search || undefined,
    page: page.value,
    limit: limit.value,
    sort: sort.value,
    direction: direction.value
  }
}

async function reload() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await getEcolageSuivi(buildParams())
    anneeScolaire.value = data.annee_scolaire || ''
    filterOptions.classes = data.filters?.classes || []
    filterOptions.mois = data.filters?.mois || []
    filterOptions.statuts = data.filters?.statuts || []
    Object.assign(config, data.config || {})
    summary.value = data.summary || {}
    alerts.value = data.alerts || []
    items.value = data.items || []
    total.value = data.total || 0
  } catch (e) {
    error.value = "Impossible de charger le suivi : " + e.message
  } finally {
    loading.value = false
  }
}

function onSort({ sort: s, direction: d }) {
  sort.value = s
  direction.value = d
  page.value = 0
  reload()
}

function onPage(p) {
  page.value = p
  reload()
}

function openPayment(row) {
  paymentRow.value = row
}

function openHistory(row) {
  historyId.value = row.inscription_id
}

function onHistoryPay(row) {
  historyId.value = null
  paymentRow.value = row
}

async function exportCsv() {
  try {
    const { data } = await exportEcolageSuivi({
      classe_tid: filters.classe_tid || undefined,
      statut: filters.statut || undefined,
      mois_tid: filters.mois_tid || undefined,
      search: filters.search || undefined,
      sort: sort.value,
      direction: direction.value
    })
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = `suivi-ecolages-${anneeScolaire.value || 'export'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    error.value = "Export impossible : " + e.message
  }
}

onMounted(reload)
</script>

<style scoped>
.page-lead {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--color-text-muted);
}

.page-header__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.badge-demo {
  font-size: 9px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--color-accent-light);
  color: #92400e;
  text-transform: uppercase;
  margin-left: 4px;
}
</style>
