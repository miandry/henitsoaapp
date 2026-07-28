<template>
  <section>
    <div class="page-header">
      <button type="button" class="btn-back" @click="$router.back()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Retour
      </button>
      <button
        v-if="item"
        type="button"
        class="btn-add"
        @click="$router.push(`/app/archives-eleves/${item.id}/edit`)"
      >
        Modifier
      </button>
    </div>

    <p v-if="loading" class="list-loading">Chargement...</p>
    <p v-else-if="error" class="list-error">{{ error }}</p>

    <template v-else-if="item">
      <div class="detail-card">
        <div class="detail-header">
          <img v-if="item.photo_url" :src="photoDisplayUrl" :alt="fullName" class="detail-photo" />
          <div v-else class="detail-photo detail-photo--placeholder">{{ initials }}</div>
          <div class="detail-header__info">
            <h1 class="detail-name">{{ fullName }}</h1>
            <div class="detail-meta">
              <span v-if="item.date_sortie" class="student-badge">Sorti le {{ formatDate(item.date_sortie) }}</span>
              <span v-else class="student-badge">Encore inscrit</span>
              <span>Entré le {{ formatDate(item.date_entre) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-card">
        <h2 class="detail-section-title">Informations</h2>
        <div class="detail-grid">
          <div class="detail-row">
            <span class="detail-label">Matricule</span>
            <span class="detail-value">{{ item.matricule || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Genre</span>
            <span class="detail-value">{{ item.genre_label || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date de naissance</span>
            <span class="detail-value">{{ formatDate(item.date_de_naissance) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Lieu de naissance</span>
            <span class="detail-value">{{ item.lieu_de_naissance || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Téléphone</span>
            <span class="detail-value">{{ item.phone || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Adresse</span>
            <span class="detail-value">{{ item.adresse || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Parent référencé</span>
            <span class="detail-value">{{ item.parent?.title || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Père</span>
            <span class="detail-value">{{ item.parent?.nom_pere || '—' }} <small v-if="item.parent?.profession_pere">({{ item.parent.profession_pere }})</small></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Mère</span>
            <span class="detail-value">{{ item.parent?.nom_mere || '—' }} <small v-if="item.parent?.profession_mere">({{ item.parent.profession_mere }})</small></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Tuteur</span>
            <span class="detail-value">{{ item.parent?.nom_tuteur || '—' }}</span>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getArchiveDetail } from '../../services/api.js'

const route = useRoute()
const item = ref(null)
const loading = ref(true)
const error = ref('')
const photoVersion = ref(0)

const fullName = computed(() => {
  if (!item.value) return ''
  return [item.value.nom, item.value.prenom].filter(Boolean).join(' ').trim() || 'Sans nom'
})

const initials = computed(() => {
  if (!item.value) return '?'
  return ((item.value.nom?.trim()?.[0] || '') + (item.value.prenom?.trim()?.[0] || '')).toUpperCase() || '?'
})

const photoDisplayUrl = computed(() => {
  if (!item.value?.photo_url) return ''
  const separator = item.value.photo_url.includes('?') ? '&' : '?'
  return `${item.value.photo_url}${separator}v=${photoVersion.value}`
})

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function loadItem() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await getArchiveDetail(route.params.id)
    item.value = data.item
    photoVersion.value += 1
  } catch (e) {
    error.value = e.response?.data?.message || "Impossible de charger l'archive : " + e.message
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, loadItem)
onMounted(loadItem)
</script>
