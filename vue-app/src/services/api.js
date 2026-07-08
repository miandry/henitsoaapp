import axios from 'axios'

const api = axios.create({
  baseURL: '/',
  headers: {
    Accept: 'application/json'
  }
})

let csrfTokenPromise = null

function getCsrfToken() {
  if (!csrfTokenPromise) {
    csrfTokenPromise = api
      .get('/session/token', { responseType: 'text', headers: { Accept: 'text/plain' } })
      .then((res) => res.data)
  }
  return csrfTokenPromise
}

async function authenticatedPost(url, body) {
  const token = await getCsrfToken()
  return api.post(url, body, { headers: { 'X-CSRF-Token': token } })
}

async function authenticatedPatch(url, body) {
  const token = await getCsrfToken()
  return api.patch(url, body, { headers: { 'X-CSRF-Token': token } })
}

export function getInscriptions(params = {}) {
  return api.get('/api/inscriptions', { params })
}

export function createInscription(payload) {
  return authenticatedPost('/api/inscriptions', payload)
}

export function getInscriptionFormOptions() {
  return api.get('/api/inscriptions/form-options')
}

export function getDashboardStats() {
  return api.get('/api/dashboard')
}

export function getArchives(params = {}) {
  return api.get('/api/archives', { params })
}

export function getClasses(params = {}) {
  return api.get('/api/classes', { params })
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

export function getEcolageSuivi(params = {}) {
  return api.get('/api/ecolages/suivi', { params })
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

export async function getLoginStatus() {
  const bodyLogged = document.body.classList.contains('user-logged-in')
  const uid = Number(window?.drupalSettings?.user?.uid || 0)
  return bodyLogged || uid > 0
}
