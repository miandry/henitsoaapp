<template>
  <section>
    <div class="page-header">
      <h1 class="page-title">Configuration du carnet</h1>
    </div>

    <p v-if="loading" class="list-loading">Chargement...</p>
    <p v-else-if="error" class="list-error">{{ error }}</p>

    <div v-else class="list-card config-card">
      <p class="config-lead">
        Définissez le chemin Drupal du template Word utilisé pour générer les carnets scolaires.
      </p>

      <form @submit.prevent="submit">
        <div class="form-field">
          <label for="school-year">Année scolaire globale</label>
          <select id="school-year" v-model="selectedSchoolYear">
            <option value="">Sélectionner une année</option>
            <option v-for="year in schoolYearOptions" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
          <p class="field-hint">
            Cette année sera utilisée par défaut dans les affichages et actions du système.
          </p>
        </div>

        <div class="form-field">
          <label for="carnet-path">Chemin du template carnet.docx</label>
          <input
            id="carnet-path"
            v-model="templatePath"
            type="text"
            placeholder="public://2022-10/carnet.docx"
          />
          <p class="field-hint">
            Exemples : <code>public://2022-10/carnet.docx</code> ou chemin absolu vers le fichier.
            Laissez vide pour utiliser le média Drupal nommé <strong>carnet.docx</strong>.
          </p>
        </div>

        <div class="config-status" :class="{ 'is-ok': config.exists, 'is-error': !config.exists }">
          <div class="config-status__row">
            <span class="config-status__label">Chemin actif</span>
            <span class="config-status__value">{{ config.active_path || '—' }}</span>
          </div>
          <div class="config-status__row">
            <span class="config-status__label">Chemin résolu</span>
            <span class="config-status__value">{{ config.resolved_path || '—' }}</span>
          </div>
          <div class="config-status__row">
            <span class="config-status__label">Fichier trouvé</span>
            <span class="config-status__value">{{ config.exists ? 'Oui' : 'Non' }}</span>
          </div>
          <div v-if="config.uses_default" class="config-status__note">
            Aucun chemin personnalisé : le média par défaut <code>carnet.docx</code> est utilisé.
          </div>
          <div v-if="config.default_path" class="config-status__note">
            Média par défaut : <code>{{ config.default_path }}</code>
          </div>
        </div>

        <p v-if="saveError" class="form-error">{{ saveError }}</p>
        <p v-if="saveSuccess" class="form-success">{{ saveSuccess }}</p>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="useDefaultPath" :disabled="saving">
            Utiliser le média par défaut
          </button>
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCarnetConfig, updateCarnetConfig } from '../services/api.js'

const loading = ref(true)
const error = ref('')
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref('')
const templatePath = ref('')
const selectedSchoolYear = ref('')
const schoolYearOptions = ref([])
const config = ref({
  template_path: '',
  default_path: '',
  active_path: '',
  resolved_path: null,
  exists: false,
  uses_default: true,
  selected_school_year: '',
  school_year_options: []
})

async function loadConfig() {
  const { data } = await getCarnetConfig()
  config.value = data.item
  templatePath.value = data.item.template_path || ''
  selectedSchoolYear.value = data.item.selected_school_year || ''
  schoolYearOptions.value = data.item.school_year_options || []
}

function useDefaultPath() {
  templatePath.value = ''
}

async function submit() {
  saving.value = true
  saveError.value = ''
  saveSuccess.value = ''
  try {
    const { data } = await updateCarnetConfig({
      template_path: templatePath.value.trim(),
      selected_school_year: selectedSchoolYear.value
    })
    config.value = data.item
    templatePath.value = data.item.template_path || ''
    selectedSchoolYear.value = data.item.selected_school_year || ''
    schoolYearOptions.value = data.item.school_year_options || []
    saveSuccess.value = 'Configuration enregistrée.'
  } catch (e) {
    saveError.value = e.response?.data?.message || "Impossible d'enregistrer : " + e.message
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    await loadConfig()
  } catch (e) {
    error.value = e.response?.data?.message || 'Impossible de charger la configuration : ' + e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.config-card {
  padding: 20px;
}

.config-lead {
  margin: 0 0 20px;
  color: var(--color-text-muted);
  font-size: 14px;
}

.field-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.field-hint code,
.config-status__value code,
.config-status__note code {
  font-size: 12px;
}

.config-status {
  margin: 20px 0;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-bg);
}

.config-status.is-ok {
  border-color: #86efac;
  background: #f0fdf4;
}

.config-status.is-error {
  border-color: #fca5a5;
  background: #fef2f2;
}

.config-status__row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 13px;
}

.config-status__row:last-of-type {
  margin-bottom: 0;
}

.config-status__label {
  flex: 0 0 120px;
  color: var(--color-text-muted);
  font-weight: 600;
}

.config-status__value {
  flex: 1;
  word-break: break-all;
}

.config-status__note {
  margin-top: 10px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.form-success {
  margin: 0 0 12px;
  color: #15803d;
  font-size: 14px;
}
</style>
