<template>
  <UModal v-model="isOpen" :prevent-close="true">
    
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-user" class="text-primary" />
            <h3 class="text-lg font-semibold">Choisir votre nom d'utilisateur</h3>
          </div>
        </template>
  
        <div class="space-y-4">
          <p class="text-gray-600">
            Bienvenue ! Vous devez choisir un nom d'utilisateur unique pour continuer.
          </p>
  
          <UFormGroup 
            label="Nom d'utilisateur" 
            :error="usernameError"
            help="3-20 caractères, lettres, chiffres, tirets et underscores uniquement"
          >
            <UInput
              v-model="username"
              placeholder="votre-username"
              :loading="checkingAvailability"
              :color="usernameStatus === 'available' ? 'success' : usernameError ? 'error' : 'primary'"
              autocomplete="off"
              spellcheck="false"
              @input="onUsernameInput"
            />
            
            <template #trailing>
              <UIcon 
                v-if="usernameStatus === 'available'" 
                name="i-lucide-check-circle" 
                class="text-green-500" 
              />
              <UIcon 
                v-else-if="usernameError" 
                name="i-lucide-x-circle" 
                class="text-red-500" 
              />
              <UIcon 
                v-else-if="checkingAvailability" 
                name="i-lucide-loader" 
                class="animate-spin text-gray-400" 
              />
            </template>
          </UFormGroup>
  
          <div v-if="usernameStatus === 'available'" class="text-sm text-green-600 flex items-center gap-1">
            <UIcon name="i-lucide-check" />
            Nom d'utilisateur disponible !
          </div>
        </div>
  
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton 
              variant="outline" 
              color="neutral" 
              @click="logout"
              :disabled="submitting"
            >
              Annuler
            </UButton>
            <UButton 
              @click="submitUsername" 
              :disabled="!canSubmit"
              :loading="submitting"
            >
              Confirmer
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  userId: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'username-set', username: string): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { logout } = useAuth()

// État local
const username = ref('')
const usernameError = ref('')
const usernameStatus = ref<'idle' | 'checking' | 'available' | 'taken'>('idle')
const checkingAvailability = ref(false)
const submitting = ref(false)
let checkTimeout: NodeJS.Timeout | null = null

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const canSubmit = computed(() => {
  return username.value.length >= 3 && 
    usernameStatus.value === 'available' && 
    !checkingAvailability.value && 
    !submitting.value
})

// Méthodes
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
        userId: props.userId,
        username: username.value
      }
    })

    if (response.success) {
      emit('username-set', username.value)
      isOpen.value = false
    }
  } catch (error: any) {
    console.error('Error setting username:', error)
    usernameError.value = error.data?.message || 'Erreur lors de la sauvegarde du nom d\'utilisateur'
  } finally {
    submitting.value = false
  }
}

// Nettoyer le timeout à la destruction du composant
onUnmounted(() => {
  if (checkTimeout) {
    clearTimeout(checkTimeout)
  }
})
</script>