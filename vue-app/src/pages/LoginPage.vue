<template>
  <section class="login-page">
    <div class="login-card">
      <h1 class="login-title">Connexion</h1>
      <p class="login-text">Connectez-vous avec votre compte pour acceder a l'application.</p>

      <form class="login-form" @submit.prevent="submitLogin">
        <label class="login-label" for="login-name">Nom d'utilisateur</label>
        <input
          id="login-name"
          v-model.trim="name"
          class="login-input"
          type="text"
          autocomplete="username"
          required
        />

        <label class="login-label" for="login-pass">Mot de passe</label>
        <input
          id="login-pass"
          v-model="pass"
          class="login-input"
          type="password"
          autocomplete="current-password"
          required
        />

        <p v-if="errorMessage" class="login-error">{{ errorMessage }}</p>

        <button class="login-button" type="submit" :disabled="submitting || !name || !pass">
          {{ submitting ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const pass = ref('')
const submitting = ref(false)
const errorMessage = ref('')

onMounted(() => {
  if (document.body.classList.contains('user-logged-in')) {
    router.replace('/app/dashboard')
  }
})

async function submitLogin() {
  submitting.value = true
  errorMessage.value = ''
  try {
    const response = await fetch('/user/login?_format=json', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        name: name.value,
        pass: pass.value
      })
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      errorMessage.value = data?.message || 'Identifiants invalides.'
      return
    }

    document.body.classList.add('user-logged-in')
    window.dispatchEvent(new CustomEvent('auth-changed'))
    router.replace('/app/dashboard')
  } catch (error) {
    errorMessage.value = "Connexion impossible. Verifiez votre reseau."
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 160px);
  display: grid;
  place-items: center;
}

.login-card {
  width: min(100%, 380px);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
}

.login-title {
  margin: 0;
  font-size: 24px;
}

.login-text {
  margin: 8px 0 0;
  color: var(--color-text-muted);
}

.login-form {
  margin-top: 16px;
}

.login-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-top: 12px;
  margin-bottom: 6px;
}

.login-input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  background: #fff;
}

.login-error {
  margin: 10px 0 0;
  color: #b91c1c;
  font-size: 13px;
}

.login-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 16px;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.login-button:disabled {
  opacity: 0.7;
  cursor: default;
}
</style>
