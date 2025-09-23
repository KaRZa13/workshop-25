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

// Rediriger si déjà authentifié
const { isAuthenticated } = useAuth()
if (isAuthenticated.value) {
  await navigateTo('/messages')
}

const providers = [{
  label: 'Ethereum',
  icon: 'i-simple-icons-ethereum',
  onClick: async () => {
    try {
      await login()
      // Rediriger vers les messages après connexion réussie
      await navigateTo('/messages')
    } catch (error) {
      // L'erreur est déjà gérée dans le composable
      console.error('Login failed:', error)
    }
  }
}]
</script>