<template>
  <section>
    <div class="page-header">
      <button type="button" class="btn-back" @click="$router.back()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Retour
      </button>
    </div>

    <p v-if="loading" class="list-loading">Chargement...</p>
    <p v-else-if="error" class="list-error">{{ error }}</p>

    <template v-else-if="item">
      <div class="detail-card">
        <div class="detail-header">
          <img v-if="item.eleve?.photo_url" :src="item.eleve.photo_url" :alt="item.matricule" class="detail-photo" />
          <div v-else class="detail-photo detail-photo--placeholder">{{ initials(item.matricule) }}</div>
          <div class="detail-header__info">
            <h1 class="detail-name">{{ item.matricule }}</h1>
            <div class="detail-meta">
              <span class="student-badge">{{ item.classe || '—' }}</span>
              <span>{{ item.annee_scolaire }}</span>
              <span v-if="item.droits_status_label" class="student-badge">Droits : {{ item.droits_status_label }}</span>
            </div>
          </div>
        </div>
        <div class="form-actions" style="justify-content: flex-start; margin-top: 16px;">
          <a class="btn-secondary" :href="`/admin/build?id=${item.id}`" style="text-decoration: none; display: inline-block;">
            Télécharger le carnet
          </a>
        </div>
      </div>

      <div class="detail-card" v-if="item.eleve">
        <h2 class="detail-section-title">Informations de l'élève</h2>
        <div class="detail-grid">
          <div class="detail-row">
            <span class="detail-label">Nom</span>
            <span class="detail-value">{{ item.eleve.nom || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Prénom</span>
            <span class="detail-value">{{ item.eleve.prenom || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Genre</span>
            <span class="detail-value">{{ item.eleve.genre_label || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date de naissance</span>
            <span class="detail-value">{{ formatDate(item.eleve.date_de_naissance) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Lieu de naissance</span>
            <span class="detail-value">{{ item.eleve.lieu_de_naissance || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Téléphone</span>
            <span class="detail-value">{{ item.eleve.phone || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Adresse</span>
            <span class="detail-value">{{ item.eleve.adresse || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Père</span>
            <span class="detail-value">{{ item.eleve.nom_pere || '—' }} <small v-if="item.eleve.profession_pere">({{ item.eleve.profession_pere }})</small></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Mère</span>
            <span class="detail-value">{{ item.eleve.nom_mere || '—' }} <small v-if="item.eleve.profession_mere">({{ item.eleve.profession_mere }})</small></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Tuteur</span>
            <span class="detail-value">{{ item.eleve.tuteur || '—' }}</span>
          </div>
        </div>
      </div>

      <div class="detail-card">
        <h2 class="detail-section-title">Écolages {{ item.annee_scolaire }}</h2>
        <div class="months-grid">
          <div v-for="m in item.ecolage_months" :key="m.id" class="month-chip" :class="{ 'is-paid': m.paid }">
            <span class="dot-icon"></span>
            {{ m.nom }}
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getInscriptionDetail } from '../../services/api.js'

const route = useRoute()
const item = ref(null)
const loading = ref(true)
const error = ref('')

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(async () => {
  try {
    const { data } = await getInscriptionDetail(route.params.id)
    item.value = data.item
  } catch (e) {
    error.value = e.response?.data?.message || "Impossible de charger l'inscription : " + e.message
  } finally {
    loading.value = false
  }
})
</script>
