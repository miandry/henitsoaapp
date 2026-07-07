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

    <div v-else-if="item" class="detail-card">
      <h1 class="detail-name">{{ item.nom }}</h1>
      <p class="detail-meta">Matière du programme scolaire.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getMatiereDetail } from '../services/api.js'

const route = useRoute()
const item = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const { data } = await getMatiereDetail(route.params.id)
    item.value = data.item
  } catch (e) {
    error.value = e.response?.data?.message || "Impossible de charger la matière : " + e.message
  } finally {
    loading.value = false
  }
})
</script>
