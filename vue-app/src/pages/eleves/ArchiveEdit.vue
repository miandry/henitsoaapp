<template>
  <section>
    <div class="page-header">
      <button type="button" class="btn-back" @click="goBack">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Retour
      </button>
    </div>

    <p v-if="loading" class="list-loading">Chargement...</p>
    <p v-else-if="error" class="list-error">{{ error }}</p>

    <template v-else>
      <div class="page-header page-header--title">
        <h1 class="page-title">Modifier l'élève</h1>
        <p v-if="fullName" class="page-lead">{{ fullName }}</p>
      </div>

      <div class="list-card form-card">
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

          <div class="form-row">
            <div class="form-field">
              <label for="edit-matricule">Matricule</label>
              <input id="edit-matricule" v-model="form.matricule" type="text" required />
            </div>
            <div class="form-field">
              <label for="edit-genre">Genre</label>
              <select id="edit-genre" v-model="form.genre">
                <option value="1">Garçon</option>
                <option value="0">Fille</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label for="edit-nom">Nom</label>
              <input id="edit-nom" v-model="form.nom" type="text" required />
            </div>
            <div class="form-field">
              <label for="edit-prenom">Prénom</label>
              <input id="edit-prenom" v-model="form.prenom" type="text" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label for="edit-date-naissance">Date de naissance</label>
              <input id="edit-date-naissance" v-model="form.date_de_naissance" type="date" />
            </div>
            <div class="form-field">
              <label for="edit-lieu-naissance">Lieu de naissance</label>
              <input id="edit-lieu-naissance" v-model="form.lieu_de_naissance" type="text" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label for="edit-date-entre">Date d'entrée</label>
              <input id="edit-date-entre" v-model="form.date_entre" type="date" required />
            </div>
            <div class="form-field">
              <label for="edit-date-sortie">Date de sortie <small>(optionnel)</small></label>
              <input id="edit-date-sortie" v-model="form.date_sortie" type="date" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label for="edit-phone">Téléphone</label>
              <input id="edit-phone" v-model="form.phone" type="text" />
            </div>
            <div class="form-field">
              <label for="edit-adresse">Adresse</label>
              <input id="edit-adresse" v-model="form.adresse" type="text" />
            </div>
          </div>

          <div class="form-field">
            <label>Parent référencé</label>
            <div v-if="selectedParent" class="parent-selected">
              <div class="parent-selected__title">{{ selectedParent.title || 'Parent' }}</div>
              <div class="parent-selected__meta">
                {{ selectedParent.nom_pere || '—' }} · {{ selectedParent.nom_mere || '—' }} · {{ selectedParent.nom_tuteur || '—' }}
              </div>
              <button type="button" class="btn-secondary btn-secondary--sm" @click="clearParent">Changer</button>
            </div>
            <div v-else class="parent-picker">
              <input
                v-model="parentQuery"
                type="text"
                placeholder="Rechercher un parent existant..."
                @input="onParentInput"
              />
              <ul v-if="parentResults.length" class="autocomplete-results parent-results">
                <li v-for="parent in parentResults" :key="parent.id" @click="selectParent(parent)">
                  <strong>{{ parent.title || 'Parent' }}</strong>
                  <small>{{ parent.nom_pere || '—' }} · {{ parent.nom_mere || '—' }} · {{ parent.nom_tuteur || '—' }}</small>
                </li>
              </ul>
              <div class="parent-create-trigger">
                <button type="button" class="btn-secondary btn-secondary--sm" @click="openCreateParent">
                  Ajouter nouveau parent
                </button>
              </div>
            </div>
          </div>

          <div v-if="showCreateParent" class="parent-create-box">
            <h3>Nouveau parent</h3>
            <div class="form-row">
              <div class="form-field">
                <label for="parent-nom-pere">Nom du père</label>
                <input id="parent-nom-pere" v-model="newParent.nom_pere" type="text" />
              </div>
              <div class="form-field">
                <label for="parent-prof-pere">Profession du père</label>
                <input id="parent-prof-pere" v-model="newParent.profession_pere" type="text" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label for="parent-nom-mere">Nom de la mère</label>
                <input id="parent-nom-mere" v-model="newParent.nom_mere" type="text" />
              </div>
              <div class="form-field">
                <label for="parent-prof-mere">Profession de la mère</label>
                <input id="parent-prof-mere" v-model="newParent.profession_mere" type="text" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label for="parent-nom-tuteur">Nom du tuteur</label>
                <input id="parent-nom-tuteur" v-model="newParent.nom_tuteur" type="text" />
              </div>
              <div class="form-field">
                <label for="parent-phone-tuteur">Téléphone du tuteur</label>
                <input id="parent-phone-tuteur" v-model="newParent.phone_tuteur" type="text" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label for="parent-phone">Téléphone</label>
                <input id="parent-phone" v-model="newParent.phone" type="text" />
              </div>
              <div class="form-field">
                <label for="parent-adresse">Adresse</label>
                <input id="parent-adresse" v-model="newParent.adresse" type="text" />
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="showCreateParent = false">Annuler</button>
              <button type="button" class="btn-primary" :disabled="creatingParent" @click="submitCreateParent">
                {{ creatingParent ? 'Création...' : 'Créer ce parent' }}
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="goBack">Annuler</button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="saving || !form.matricule.trim() || !form.nom.trim() || !form.prenom.trim()"
            >
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getArchiveDetail,
  updateArchive,
  uploadArchivePhoto,
  searchParents,
  createParent
} from '../../services/api.js'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const editError = ref('')
const photoPreview = ref('')
const photoFile = ref(null)
const parentQuery = ref('')
const parentResults = ref([])
const parentLoading = ref(false)
const showCreateParent = ref(false)
const creatingParent = ref(false)
const selectedParent = ref(null)
let parentSearchTimeout = null

const form = reactive({
  matricule: '',
  nom: '',
  prenom: '',
  genre: '1',
  date_de_naissance: '',
  lieu_de_naissance: '',
  date_entre: '',
  date_sortie: '',
  phone: '',
  adresse: ''
})

const newParent = reactive({
  nom_pere: '',
  profession_pere: '',
  nom_mere: '',
  profession_mere: '',
  nom_tuteur: '',
  phone_tuteur: '',
  phone: '',
  adresse: ''
})

const fullName = computed(() => {
  return [form.nom, form.prenom].filter(Boolean).join(' ').trim()
})

const editInitials = computed(() => {
  return ((form.nom?.trim()?.[0] || '') + (form.prenom?.trim()?.[0] || '')).toUpperCase() || '?'
})

function toInputDate(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function fillForm(data) {
  form.matricule = data.matricule || ''
  form.nom = data.nom || ''
  form.prenom = data.prenom || ''
  form.genre = data.genre ?? '1'
  form.date_de_naissance = toInputDate(data.date_de_naissance)
  form.lieu_de_naissance = data.lieu_de_naissance || ''
  form.date_entre = toInputDate(data.date_entre)
  form.date_sortie = toInputDate(data.date_sortie)
  form.phone = data.phone || ''
  form.adresse = data.adresse || ''
  selectedParent.value = data.parent || null
  parentQuery.value = ''
  parentResults.value = []
  showCreateParent.value = false
}

function resetNewParent() {
  newParent.nom_pere = ''
  newParent.profession_pere = ''
  newParent.nom_mere = ''
  newParent.profession_mere = ''
  newParent.nom_tuteur = ''
  newParent.phone_tuteur = ''
  newParent.phone = ''
  newParent.adresse = ''
}

function clearParent() {
  selectedParent.value = null
  parentQuery.value = ''
  parentResults.value = []
  showCreateParent.value = false
}

function selectParent(parent) {
  selectedParent.value = parent
  parentQuery.value = ''
  parentResults.value = []
  showCreateParent.value = false
}

function onParentInput() {
  clearTimeout(parentSearchTimeout)
  showCreateParent.value = false
  if (parentQuery.value.trim().length < 2) {
    parentResults.value = []
    return
  }
  parentSearchTimeout = setTimeout(async () => {
    parentLoading.value = true
    try {
      const { data } = await searchParents({ search: parentQuery.value.trim(), limit: 8 })
      parentResults.value = data.items || []
    } catch {
      parentResults.value = []
    } finally {
      parentLoading.value = false
    }
  }, 250)
}

function openCreateParent() {
  showCreateParent.value = true
  resetNewParent()
  if (parentQuery.value.trim()) {
    newParent.nom_tuteur = parentQuery.value.trim()
  }
}

async function submitCreateParent() {
  creatingParent.value = true
  editError.value = ''
  try {
    const { data } = await createParent({ ...newParent })
    selectedParent.value = data.item
    showCreateParent.value = false
    parentQuery.value = ''
    parentResults.value = []
  } catch (e) {
    editError.value = e.response?.data?.message || "Impossible de créer le parent : " + e.message
  } finally {
    creatingParent.value = false
  }
}

function goBack() {
  router.push(`/app/archives-eleves/${route.params.id}`)
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

async function submitEdit() {
  saving.value = true
  editError.value = ''
  try {
    const payload = {
      matricule: form.matricule.trim(),
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      genre: form.genre,
      date_de_naissance: form.date_de_naissance,
      lieu_de_naissance: form.lieu_de_naissance.trim(),
      date_entre: form.date_entre,
      date_sortie: form.date_sortie,
      phone: form.phone.trim(),
      adresse: form.adresse.trim(),
      parent_nid: selectedParent.value?.id || 0
    }
    await updateArchive(route.params.id, payload)
    if (photoFile.value) {
      await uploadArchivePhoto(route.params.id, photoFile.value)
    }
    router.push(`/app/archives-eleves/${route.params.id}`)
  } catch (e) {
    editError.value = e.response?.data?.message || "Impossible d'enregistrer : " + e.message
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await getArchiveDetail(route.params.id)
    fillForm(data.item)
    photoPreview.value = data.item.photo_url || ''
    photoFile.value = null
  } catch (e) {
    error.value = e.response?.data?.message || "Impossible de charger l'élève : " + e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-header--title {
  margin-bottom: 16px;
}

.page-lead {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--color-text-muted);
}

.form-card {
  max-width: 720px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.parent-selected,
.parent-create-box {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  padding: 12px;
}

.parent-selected__title {
  font-size: 14px;
  font-weight: 600;
}

.parent-selected__meta {
  margin: 4px 0 10px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.parent-picker {
  position: relative;
}

.parent-results {
  z-index: 20;
}

.parent-results li {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.parent-results small {
  color: var(--color-text-muted);
  font-size: 12px;
}

.parent-create-trigger {
  margin-top: 10px;
}

.parent-create-box {
  margin-bottom: 16px;
}

.parent-create-box h3 {
  margin: 0 0 10px;
  font-size: 14px;
}

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

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
