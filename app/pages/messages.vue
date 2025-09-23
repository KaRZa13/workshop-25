<template>
  <UDashboardGroup>
    <UDashboardSidebar>
      <UUser
        name="Utilisateur"
        description="developpeur web3"
        :avatar="{
          src: 'https://i.pravatar.cc/150?u=john-doe',
          icon: 'i-lucide-user',
        }"
      />
    </UDashboardSidebar>

    <UDashboardPanel>

    </UDashboardPanel>
  </UDashboardGroup>
  <!-- <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Messages</h1>
        <p class="text-gray-600">Bienvenue, {{ user?.address?.slice(0, 6) }}...{{ user?.address?.slice(-4) }}</p>
      </div>
      <UButton color="error" variant="outline" @click="handleLogout">
        <UIcon name="i-lucide-log-out" class="mr-2" />
        Déconnexion
      </UButton>
    </div>
    
    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
      <p class="text-green-800">Vous êtes connecté avec succès !</p>
      <p class="text-sm text-green-600 mt-1">Adresse: {{ user?.address }}</p>
      <p class="text-sm text-green-600" v-if="user?.chainId">Chain ID: {{ user?.chainId }}</p>
    </div>
  </div> -->
</template>

<script setup lang="ts">
// Appliquer le middleware d'authentification
definePageMeta({
  middleware: 'authenticated'
})

const { user, logout } = useAuth()

const handleLogout = async () => {
  logout()
  await navigateTo('/login')
}
</script>