import axios from 'axios'

const api = axios.create({
  baseURL: '/',
  timeout: 30000,
  headers: {
    Accept: 'application/json'
  }
})

let csrfTokenPromise = null
const inflightGets = new Map()

function getCsrfToken() {
  if (!csrfTokenPromise) {
    csrfTokenPromise = api
      .get('/session/token', { responseType: 'text', headers: { Accept: 'text/plain' } })
      .then((res) => res.data)
      .catch((error) => {
        csrfTokenPromise = null
        throw error
      })
  }
  return csrfTokenPromise
}

/**
 * Deduplicates identical in-flight GET requests and supports AbortSignal.
 */
function getDeduped(url, config = {}) {
  const key = `${url}?${JSON.stringify(config.params || {})}`
  if (!config.signal && inflightGets.has(key)) {
    return inflightGets.get(key)
  }
  const promise = api.get(url, config).finally(() => {
    if (inflightGets.get(key) === promise) {
      inflightGets.delete(key)
    }
  })
  if (!config.signal) {
    inflightGets.set(key, promise)
  }
  return promise
}

async function authenticatedPost(url, body) {
  const token = await getCsrfToken()
  return api.post(url, body, { headers: { 'X-CSRF-Token': token } })
}

async function authenticatedPatch(url, body) {
  const token = await getCsrfToken()
  return api.patch(url, body, { headers: { 'X-CSRF-Token': token } })
}

export function getInscriptions(params = {}, config = {}) {
  return getDeduped('/api/inscriptions', { ...config, params })
}

export function createInscription(payload) {
  return authenticatedPost('/api/inscriptions', payload)
}

export function getInscriptionFormOptions() {
  return api.get('/api/inscriptions/form-options')
}

export function getDashboardStats(params = {}, config = {}) {
  return getDeduped('/api/dashboard', { ...config, params })
}

export function getArchives(params = {}, config = {}) {
  return getDeduped('/api/archives', { ...config, params })
}

export function getClasses(params = {}, config = {}) {
  return getDeduped('/api/classes', { ...config, params })
}

export function createClasse(nom) {
  return authenticatedPost('/api/classes', { nom })
}

export function getMatieres(params = {}) {
  return api.get('/api/matieres', { params })
}

export function createMatiere(nom) {
  return authenticatedPost('/api/matieres', { nom })
}

export function searchEtudiants(params = {}) {
  return api.get('/api/etudiants', { params })
}

export function createEtudiant(payload) {
  return authenticatedPost('/api/etudiants', payload)
}

export function searchParents(params = {}) {
  return api.get('/api/parents', { params })
}

export function createParent(payload) {
  return authenticatedPost('/api/parents', payload)
}

export function getEcolages(params = {}) {
  return api.get('/api/ecolages', { params })
}

export function getEcolageFormOptions() {
  return api.get('/api/ecolages/form-options')
}

export function createEcolage(payload) {
  return authenticatedPost('/api/ecolages', payload)
}

export function getInscriptionDetail(id) {
  return api.get(`/api/inscriptions/${id}`)
}

export function updateInscription(id, payload) {
  return authenticatedPatch(`/api/inscriptions/${id}`, payload)
}

export function getArchiveDetail(id) {
  return api.get(`/api/archives/${id}`)
}

export function updateArchive(id, payload) {
  return authenticatedPatch(`/api/archives/${id}`, payload)
}

export async function uploadArchivePhoto(id, file) {
  const token = await getCsrfToken()
  const formData = new FormData()
  formData.append('photo', file)
  return api.post(`/api/archives/${id}/photo`, formData, {
    headers: { 'X-CSRF-Token': token }
  })
}

export function getClasseDetail(id) {
  return api.get(`/api/classes/${id}`)
}

export function getMatiereDetail(id) {
  return api.get(`/api/matieres/${id}`)
}

export function getEcolageSuivi(params = {}, config = {}) {
  return getDeduped('/api/ecolages/suivi', { ...config, params })
}

export function getEcolageSuiviHistory(inscriptionId) {
  return api.get(`/api/ecolages/suivi/${inscriptionId}/history`)
}

export function exportEcolageSuivi(params = {}) {
  return api.get('/api/ecolages/suivi/export', {
    params,
    responseType: 'blob'
  })
}

export function getEcolageDetail(id) {
  return api.get(`/api/ecolages/${id}`)
}

export function getCarnetConfig() {
  return api.get('/api/config/carnet')
}

export function updateCarnetConfig(payload) {
  return authenticatedPatch('/api/config/carnet', payload)
}

export function getActivites(params = {}, config = {}) {
  return getDeduped('/api/activites', { ...config, params })
}

export function getActiviteFormOptions() {
  return api.get('/api/activites/form-options')
}

export function createActivite(payload) {
  return authenticatedPost('/api/activites', payload)
}

export function getActiviteDetail(id) {
  return api.get(`/api/activites/${id}`)
}

export function updateActivite(id, payload) {
  return authenticatedPatch(`/api/activites/${id}`, payload)
}

export function createActiviteParticipation(id, payload) {
  return authenticatedPost(`/api/activites/${id}/participations`, payload)
}

export function createActivitePaiement(id, payload) {
  return authenticatedPost(`/api/activites/${id}/paiements`, payload)
}

export async function getLoginStatus() {
  const bodyLogged = document.body.classList.contains('user-logged-in')
  const uid = Number(window?.drupalSettings?.user?.uid || 0)
  if (bodyLogged || uid > 0) {
    return true
  }
  return false
}
