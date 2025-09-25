<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        title="Login"
        description="Login to access your account."
        icon="i-lucide-user"
        :providers="providers"
      />
    </UPageCard>

    <!-- Modal pour choisir le username -->
    <UsernameModal
      v-model="showUsernameModal"
      :user-id="currentUserId"
      @username-set="onUsernameSet"
      @cancel="onCancel"
      v-if="currentUserId"
    />
  </div>
</template>

<script setup lang="ts">
const { login, updateUsername } = useAuth()

// Rediriger si déjà authentifié
const { isAuthenticated } = useAuth()
if (isAuthenticated.value) {
  await navigateTo('/messages')
}

// État pour la modal username
const showUsernameModal = ref(false)
const currentUserId = ref('')

// S'assurer que la modal est fermée au démarrage (une seule fois)
onMounted(() => {
  if (process.client) {
    showUsernameModal.value = false
    currentUserId.value = ''
  }
})

const providers = [{
  label: 'Ethereum',
  icon: 'i-simple-icons-ethereum',
  onClick: async () => {
    try {
      console.log('🚀 Début de la connexion...')
      const result = await login()
      console.log('📊 Résultat de la connexion:', result)
      
      if (result && result.needsUsername) {
        // L'utilisateur doit choisir un username
        console.log('👤 Username requis pour:', result.user.id)
        currentUserId.value = result.user.id
        await nextTick() // Attendre que le DOM soit mis à jour
        showUsernameModal.value = true
      } else {
        // Rediriger vers les messages après connexion réussie
        console.log('✅ Redirection vers messages')
        await navigateTo('/messages')
      }
    } catch (error) {
      // L'erreur est déjà gérée dans le composable
      console.error('❌ Login failed:', error)
    }
  }
}]

// Gérer la confirmation du username
const onUsernameSet = async (username: string) => {
  try {
    console.log('✅ Username sélectionné:', username)
    await updateUsername(username)
    showUsernameModal.value = false
    currentUserId.value = ''
    console.log('🎉 Redirection vers messages avec username')
    await navigateTo('/messages')
  } catch (error) {
    console.error('❌ Failed to set username:', error)
  }
}

// Gérer l'annulation (déconnexion)
const onCancel = () => {
  console.log('🚫 Annulation de la sélection username')
  showUsernameModal.value = false
  currentUserId.value = ''
  // L'utilisateur sera déconnecté par le composant modal
}
</script>