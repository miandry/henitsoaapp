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
        <h1 class="detail-name">{{ item.nom }}</h1>
        <div class="detail-meta">
          <span class="student-badge">{{ item.effectif }} élève{{ item.effectif > 1 ? 's' : '' }}</span>
          <span>Année {{ item.annee_scolaire }}</span>
        </div>
      </div>

      <div class="list-card">
        <h2 class="detail-section-title">Élèves de la classe</h2>
        <ul class="student-list">
          <router-link
            v-for="student in students"
            :key="student.id"
            :to="`/app/eleves-inscrits/${student.id}`"
            custom
            v-slot="{ navigate }"
          >
            <li
              class="student-list-item"
              style="cursor: pointer;"
              tabindex="0"
              role="link"
              @click="navigate"
              @keydown.enter="navigate"
            >
              <img v-if="student.photo_url" :src="student.photo_url" :alt="student.matricule" class="student-avatar student-avatar--photo" />
              <div v-else class="student-avatar">{{ initials(student.matricule) }}</div>
              <div class="student-list-item__info">
                <div class="student-list-item__name">{{ student.matricule }}</div>
              </div>
              <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </li>
          </router-link>
          <li v-if="students.length === 0" class="list-empty">Aucun élève dans cette classe pour cette année.</li>
        </ul>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getClasseDetail } from '../../services/api.js'

const route = useRoute()
const item = ref(null)
const students = ref([])
const loading = ref(true)
const error = ref('')

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
}

onMounted(async () => {
  try {
    const { data } = await getClasseDetail(route.params.id)
    item.value = data.item
    students.value = data.students || []
  } catch (e) {
    error.value = e.response?.data?.message || "Impossible de charger la classe : " + e.message
  } finally {
    loading.value = false
  }
})
</script>
