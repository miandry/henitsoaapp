<template>
  <section>
    <div class="page-header">
      <button type="button" class="btn-back" @click="$router.back()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Retour
      </button>
      <button v-if="item" type="button" class="btn-add" @click="openEdit">
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
            <span class="detail-label">Père</span>
            <span class="detail-value">{{ item.nom_pere || '—' }} <small v-if="item.profession_pere">({{ item.profession_pere }})</small></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Mère</span>
            <span class="detail-value">{{ item.nom_mere || '—' }} <small v-if="item.profession_mere">({{ item.profession_mere }})</small></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Tuteur</span>
            <span class="detail-value">{{ item.tuteur || '—' }}</span>
          </div>
        </div>
      </div>
    </template>

    <Modal v-if="showEdit" title="Modifier l'élève" wide @close="closeEdit">
      <form @submit.prevent="submitEdit">
        <p v-if="editError" class="form-error">{{ editError }}</p>

        <div class="form-field photo-field">
          <label>Photo</label>
          <div class="photo-upload">
            <img v-if="photoPreview" :src="photoPreview" alt="Aperçu" class="photo-upload__preview" />
            <div v-else class="photo-upload__preview photo-upload__preview--empty">{{ editInitials }}</div>
            <div>
              <input id="arch-photo" type="file" accept="image/*" @change="onPhotoChange" />
              <p class="photo-upload__hint">JPG, PNG ou WebP</p>
            </div>
          </div>
        </div>

        <div class="form-field">
          <label for="edit-nom">Nom</label>
          <input id="edit-nom" v-model="form.nom" type="text" required />
        </div>

        <div class="form-field">
          <label for="edit-prenom">Prénom</label>
          <input id="edit-prenom" v-model="form.prenom" type="text" required />
        </div>

        <div class="form-field">
          <label for="edit-genre">Genre</label>
          <select id="edit-genre" v-model="form.genre">
            <option value="1">Garçon</option>
            <option value="0">Fille</option>
          </select>
        </div>

        <div class="form-field">
          <label for="edit-date-naissance">Date de naissance</label>
          <input id="edit-date-naissance" v-model="form.date_de_naissance" type="date" />
        </div>

        <div class="form-field">
          <label for="edit-lieu-naissance">Lieu de naissance</label>
          <input id="edit-lieu-naissance" v-model="form.lieu_de_naissance" type="text" />
        </div>

        <div class="form-field">
          <label for="edit-date-entre">Date d'entrée</label>
          <input id="edit-date-entre" v-model="form.date_entre" type="date" required />
        </div>

        <div class="form-field">
          <label for="edit-date-sortie">Date de sortie <small>(optionnel)</small></label>
          <input id="edit-date-sortie" v-model="form.date_sortie" type="date" />
        </div>

        <div class="form-field">
          <label for="edit-phone">Téléphone</label>
          <input id="edit-phone" v-model="form.phone" type="text" />
        </div>

        <div class="form-field">
          <label for="edit-adresse">Adresse</label>
          <input id="edit-adresse" v-model="form.adresse" type="text" />
        </div>

        <div class="form-field">
          <label for="edit-nom-pere">Nom du père</label>
          <input id="edit-nom-pere" v-model="form.nom_pere" type="text" />
        </div>

        <div class="form-field">
          <label for="edit-profession-pere">Profession du père</label>
          <input id="edit-profession-pere" v-model="form.profession_pere" type="text" />
        </div>

        <div class="form-field">
          <label for="edit-nom-mere">Nom de la mère</label>
          <input id="edit-nom-mere" v-model="form.nom_mere" type="text" />
        </div>

        <div class="form-field">
          <label for="edit-profession-mere">Profession de la mère</label>
          <input id="edit-profession-mere" v-model="form.profession_mere" type="text" />
        </div>

        <div class="form-field">
          <label for="edit-tuteur">Tuteur</label>
          <input id="edit-tuteur" v-model="form.tuteur" type="text" />
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="closeEdit">Annuler</button>
          <button type="submit" class="btn-primary" :disabled="saving || !form.nom.trim() || !form.prenom.trim()">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </Modal>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getArchiveDetail, updateArchive, uploadArchivePhoto } from '../../services/api.js'
import Modal from '../../components/Modal.vue'

const route = useRoute()
const item = ref(null)
const loading = ref(true)
const error = ref('')
const showEdit = ref(false)
const saving = ref(false)
const editError = ref('')
const photoPreview = ref('')
const photoFile = ref(null)
const photoVersion = ref(0)

const form = reactive({
  nom: '',
  prenom: '',
  genre: '1',
  date_de_naissance: '',
  lieu_de_naissance: '',
  date_entre: '',
  date_sortie: '',
  phone: '',
  adresse: '',
  nom_pere: '',
  profession_pere: '',
  nom_mere: '',
  profession_mere: '',
  tuteur: ''
})

const fullName = computed(() => {
  if (!item.value) return ''
  return [item.value.nom, item.value.prenom].filter(Boolean).join(' ').trim() || 'Sans nom'
})

const initials = computed(() => {
  if (!item.value) return '?'
  return ((item.value.nom?.trim()?.[0] || '') + (item.value.prenom?.trim()?.[0] || '')).toUpperCase() || '?'
})

const editInitials = computed(() => {
  return ((form.nom?.trim()?.[0] || '') + (form.prenom?.trim()?.[0] || '')).toUpperCase() || '?'
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

function toInputDate(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function fillForm(data) {
  form.nom = data.nom || ''
  form.prenom = data.prenom || ''
  form.genre = data.genre ?? '1'
  form.date_de_naissance = toInputDate(data.date_de_naissance)
  form.lieu_de_naissance = data.lieu_de_naissance || ''
  form.date_entre = toInputDate(data.date_entre)
  form.date_sortie = toInputDate(data.date_sortie)
  form.phone = data.phone || ''
  form.adresse = data.adresse || ''
  form.nom_pere = data.nom_pere || ''
  form.profession_pere = data.profession_pere || ''
  form.nom_mere = data.nom_mere || ''
  form.profession_mere = data.profession_mere || ''
  form.tuteur = data.tuteur || ''
}

function openEdit() {
  fillForm(item.value)
  photoPreview.value = photoDisplayUrl.value || item.value.photo_url || ''
  photoFile.value = null
  editError.value = ''
  showEdit.value = true
}

function closeEdit() {
  showEdit.value = false
}

function onPhotoChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    editError.value = 'Veuillez sélectionner une image.'
    return
  }
  photoFile.value = file
  editError.value = ''
  const reader = new FileReader()
  reader.onload = () => {
    photoPreview.value = reader.result
  }
  reader.readAsDataURL(file)
}

async function loadItem() {
  const { data } = await getArchiveDetail(route.params.id)
  item.value = data.item
}

async function submitEdit() {
  saving.value = true
  editError.value = ''
  try {
    const payload = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      genre: form.genre,
      date_de_naissance: form.date_de_naissance,
      lieu_de_naissance: form.lieu_de_naissance.trim(),
      date_entre: form.date_entre,
      date_sortie: form.date_sortie,
      phone: form.phone.trim(),
      adresse: form.adresse.trim(),
      nom_pere: form.nom_pere.trim(),
      profession_pere: form.profession_pere.trim(),
      nom_mere: form.nom_mere.trim(),
      profession_mere: form.profession_mere.trim(),
      tuteur: form.tuteur.trim()
    }
    const { data } = await updateArchive(route.params.id, payload)
    if (photoFile.value) {
      const { data: photoResponse } = await uploadArchivePhoto(route.params.id, photoFile.value)
      item.value = photoResponse.item
      photoVersion.value += 1
    } else {
      item.value = data.item
    }
    showEdit.value = false
  } catch (e) {
    editError.value = e.response?.data?.message || "Impossible d'enregistrer : " + e.message
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    await loadItem()
  } catch (e) {
    error.value = e.response?.data?.message || "Impossible de charger l'archive : " + e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.photo-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.photo-upload__preview {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--color-primary-light);
}

.photo-upload__preview--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  font-weight: 700;
  font-size: 22px;
}

.photo-upload__hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
