<template>
  <NuxtRouteAnnouncer />
  <UApp>
    <UHeader title="Outernet">
      <template #title>
        <!-- LOGO -->
      </template>

      <UNavigationMenu :items="items" />

      <template #right>
        <UColorModeButton />

        <!-- Afficher les informations utilisateur si connecté -->
        <div v-if="isAuthenticated" class="flex items-center gap-2">
          <UTooltip :text="user?.address">
            <UBadge color="success" variant="soft" class="hidden sm:inline-flex">
              {{ user?.address?.slice(0, 6) }}...{{ user?.address?.slice(-4) }}
            </UBadge>
          </UTooltip>

          <UDropdown :items="userMenuItems">
            <UButton color="neutral" variant="ghost" icon="i-lucide-user-round" />
          </UDropdown>
        </div>

        <!-- Bouton de connexion si non connecté -->
        <UTooltip v-else text="Sign Up / Sign In">
          <UButton color="neutral" variant="ghost" to="/login" icon="i-lucide-user-round" aria-label="Login" />
        </UTooltip>
      </template>

    </UHeader>

    <UMain>
      <NuxtLayout>
        <NuxtPage />
        
      </NuxtLayout>
    </UMain>

    <!-- Modal pour définir le nom d'utilisateur lors de la première connexion -->
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center gap-2 p-6 border-b border-gray-200">
          <UIcon name="i-lucide-user" class="text-primary" />
          <h3 class="text-lg font-semibold">Choisir votre nom d'utilisateur</h3>
        </div>
        
        <!-- Content -->
        <div class="p-6 space-y-4">
          <p class="text-gray-600">
            Bienvenue ! Vous devez choisir un nom d'utilisateur unique pour continuer.
          </p>
        
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Nom d'utilisateur
            </label>
            <div class="relative">
              <input
                v-model="username"
                type="text"
                placeholder="votre-username"
                :disabled="checkingAvailability"
                :class="[
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  usernameStatus === 'available' ? 'border-green-500' : usernameError ? 'border-red-500' : 'border-gray-300'
                ]"
                autocomplete="off"
                spellcheck="false"
                @input="onUsernameInput"
              />
              
              <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                <UIcon 
                  v-if="usernameStatus === 'available'" 
                  name="i-lucide-check-circle" 
                  class="text-green-500 w-5 h-5" 
                />
                <UIcon 
                  v-else-if="usernameError" 
                  name="i-lucide-x-circle" 
                  class="text-red-500 w-5 h-5" 
                />
                <UIcon 
                  v-else-if="checkingAvailability" 
                  name="i-lucide-loader" 
                  class="animate-spin text-gray-400 w-5 h-5" 
                />
              </div>
            </div>
            
            <p class="text-xs text-gray-500">
              3-20 caractères, lettres, chiffres, tirets et underscores uniquement
            </p>
            
            <p v-if="usernameError" class="text-sm text-red-600">
              {{ usernameError }}
            </p>
            
            <div v-if="usernameStatus === 'available'" class="text-sm text-green-600 flex items-center gap-1">
              <UIcon name="i-lucide-check" class="w-4 h-4" />
              Nom d'utilisateur disponible !
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="flex justify-end gap-2 p-6 border-t border-gray-200 bg-gray-50">
          <button 
            @click="logout"
            :disabled="submitting"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button 
            @click="submitUsername" 
            :disabled="!canSubmit"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <UIcon v-if="submitting" name="i-lucide-loader" class="animate-spin w-4 h-4" />
            {{ submitting ? 'En cours...' : 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
  </UApp>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { user, isAuthenticated, logout, updateUsername, refreshUserData } = useAuth()
const showUsernameModal = ref(false)
const currentUserId = ref('')

// Username modal logic
const username = ref('')
const usernameError = ref('')
const usernameStatus = ref<'idle' | 'checking' | 'available' | 'taken'>('idle')
const checkingAvailability = ref(false)
const submitting = ref(false)
let checkTimeout: NodeJS.Timeout | null = null

// Alias for modal binding
const isOpen = computed({
  get: () => showUsernameModal.value,
  set: (value) => showUsernameModal.value = value
})

// Computed properties for username validation
const canSubmit = computed(() => {
  return username.value.length >= 3 && 
    usernameStatus.value === 'available' && 
    !checkingAvailability.value && 
    !submitting.value
})

// Username validation methods
const validateUsername = (value: string): boolean => {
  if (value.length < 3) {
    usernameError.value = 'Le nom d\'utilisateur doit contenir au moins 3 caractères'
    return false
  }
  
  if (value.length > 20) {
    usernameError.value = 'Le nom d\'utilisateur ne peut pas dépasser 20 caractères'
    return false
  }
  
  const regex = /^[a-zA-Z0-9_-]+$/
  if (!regex.test(value)) {
    usernameError.value = 'Seuls les lettres, chiffres, tirets et underscores sont autorisés'
    return false
  }
  
  usernameError.value = ''
  return true
}

const checkUsernameAvailability = async (value: string) => {
  if (!validateUsername(value)) {
    usernameStatus.value = 'idle'
    return
  }

  checkingAvailability.value = true
  usernameStatus.value = 'checking'

  try {
    const response = await $fetch<{
      available: boolean
      error?: string
    }>(`/api/auth/check-username?username=${encodeURIComponent(value)}`)

    if (response.available) {
      usernameStatus.value = 'available'
      usernameError.value = ''
    } else {
      usernameStatus.value = 'taken'
      usernameError.value = response.error || 'Ce nom d\'utilisateur n\'est pas disponible'
    }
  } catch (error) {
    console.error('Error checking username:', error)
    usernameError.value = 'Erreur lors de la vérification du nom d\'utilisateur'
    usernameStatus.value = 'idle'
  } finally {
    checkingAvailability.value = false
  }
}

const onUsernameInput = () => {
  // Réinitialiser l'état
  usernameStatus.value = 'idle'
  usernameError.value = ''
  
  // Annuler le timeout précédent
  if (checkTimeout) {
    clearTimeout(checkTimeout)
  }
  
  // Vérifier après 500ms de pause dans la saisie
  if (username.value.length >= 3) {
    checkTimeout = setTimeout(() => {
      checkUsernameAvailability(username.value)
    }, 500)
  }
}

const submitUsername = async () => {
  if (!canSubmit.value) return

  submitting.value = true
  
  try {
    const response = await $fetch<{
      success: boolean
      user: any
    }>('/api/auth/update-username', {
      method: 'POST',
      body: {
        userId: currentUserId.value,
        username: username.value
      }
    })

    if (response.success) {
      showUsernameModal.value = false
      // Rafraîchir les données utilisateur
      await refreshUserData()
      
      // Réinitialiser les états
      username.value = ''
      usernameError.value = ''
      usernameStatus.value = 'idle'
      currentUserId.value = ''
    }
  } catch (error: any) {
    console.error('Error setting username:', error)
    usernameError.value = error.data?.message || 'Erreur lors de la sauvegarde du nom d\'utilisateur'
  } finally {
    submitting.value = false
  }
}

// Fonction pour vérifier et afficher la modal si nécessaire
const checkForUsernameModal = () => {
  
  if (isAuthenticated.value && user.value && !user.value.username && process.client) {
    console.log('🔍 Utilisateur connecté sans username détecté, affichage de la modal')
    currentUserId.value = user.value.id
    nextTick(() => {
      showUsernameModal.value = true
    })
  } else {
    console.log('🔍 Modal not shown because:', {
      isAuthenticated: isAuthenticated.value,
      hasUser: !!user.value,
      hasUsername: user.value?.username,
      processClient: process.client
    })
  }
}

// changements d'état d'authentification
watch([isAuthenticated, user], ([newIsAuth, newUser], [oldIsAuth, oldUser]) => {
  
  if (newIsAuth && newUser && !newUser.username && process.client) {
    checkForUsernameModal()
  }
  else if (!newIsAuth && showUsernameModal.value) {
    showUsernameModal.value = false
    currentUserId.value = ''
  }
}, { immediate: false })

onMounted(() => {
  if (process.client) {
    setTimeout(() => {
      checkForUsernameModal()
    }, 500)
  }
})

onUnmounted(() => {
  if (checkTimeout) {
    clearTimeout(checkTimeout)
  }
})



const items = computed<NavigationMenuItem[]>(() => {
  const baseItems = [
    {
      label: 'Home',
      to: '/'
    }
  ]
  
  // Ajouter "Messages" seulement si l'utilisateur est connecté
  if (isAuthenticated.value) {
    baseItems.push({
      label: 'Messages',
      to: '/messages'
    })
  }
  
  return baseItems
})

const userMenuItems = computed(() => [
  [{
    label: 'Messages',
    icon: 'i-lucide-message-circle',
    to: '/messages'
  }],
  [{
    label: 'Déconnexion',
    icon: 'i-lucide-log-out',
    click: async () => {
      logout()
      // Pas de redirection automatique - laisse l'utilisateur où il est
    }
  }]
])


</script>

<style>
* {
  font-family: "Poppins", sans-serif;
}
</style>
