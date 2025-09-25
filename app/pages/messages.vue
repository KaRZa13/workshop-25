<template>
  <UDashboardGroup>
    <UDashboardSidebar>
      <UUser
        :name="user?.username || 'Utilisateur'"
        :description="user?.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : 'Wallet connecté'"
        :avatar="{
          src: user?.username ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}` : 'https://i.pravatar.cc/150?u=default',
          icon: 'i-lucide-user',
        }"
      />
      
      <div class="mt-4">
        <UButton 
          color="error" 
          variant="outline" 
          block
          @click="handleLogout"
        >
          <UIcon name="i-lucide-log-out" class="mr-2" />
          Déconnexion
        </UButton>
      </div>
    </UDashboardSidebar>

    <UDashboardPanel>
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-2xl font-bold">Messages</h1>
            <p class="text-gray-600">
              Bienvenue, 
              <span v-if="user?.username" class="font-medium">{{ user.username }}</span>
              <span v-else>{{ user?.address?.slice(0, 6) }}...{{ user?.address?.slice(-4) }}</span>
              !
            </p>
          </div>
        </div>
        
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p class="text-green-800 font-medium">🎉 Vous êtes connecté avec succès !</p>
          <div class="mt-2 space-y-1">
            <p class="text-sm text-green-600">
              <span class="font-medium">Adresse:</span> {{ user?.address }}
            </p>
            <p v-if="user?.username" class="text-sm text-green-600">
              <span class="font-medium">Username:</span> {{ user.username }}
            </p>
          </div>
        </div>

        <!-- Contenu des messages à venir -->
        <div class="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <UIcon name="i-lucide-message-circle" class="text-4xl text-gray-400 mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun message pour le moment</h3>
          <p class="text-gray-600">Vos conversations apparaîtront ici une fois que vous aurez commencé à échanger.</p>
        </div>
      </div>
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
  // Redirection supprimée - l'utilisateur reste sur la page courante
}
</script>