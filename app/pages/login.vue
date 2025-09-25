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
  </div>
</template>

<script setup lang="ts">
const { login } = useAuth()

const providers = [{
  label: 'Ethereum',
  icon: 'i-simple-icons-ethereum',
  onClick: async () => {
    try {
      console.log('🚀 Début de la connexion...')
      const result = await login()
      console.log('📊 Résultat de la connexion:', result)
      
      // Toujours rediriger vers les messages après connexion
      // La modal pour le username sera gérée automatiquement par app.vue si nécessaire
      console.log('✅ Redirection vers messages')
      navigateTo('/messages')
      
    } catch (error) {
      // L'erreur est déjà gérée dans le composable
      console.error('❌ Login failed:', error)
    }
  }
}]
</script>