<template>
  <UDashboardGroup>
    <UDashboardSidebar class="h-full flex flex-col justify-between pt-16">
      <div>
        <UUser
          :name="user?.username || 'Utilisateur'"
          :description="user?.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : 'Wallet connecté'"
          :avatar="{
            src: user?.username ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}` : 'https://i.pravatar.cc/150?u=default',
            icon: 'i-lucide-user',
          }"
        />
      </div>
      
      <div class="space-y-4">
        <!-- Section d'ajout de contact -->
        <div class="border-t pt-4">
          <h3 class="text-sm font-medium text-gray-900 mb-3">Ajouter un contact</h3>
          
          <div class="space-y-2">
            <UInput 
              v-model="searchUsername"
              placeholder="Rechercher par username..."
              :loading="searchLoading"
              @keyup.enter="handleSearchUser"
            />
            
            <div v-if="searchResult && !searchResult.success" class="text-xs text-red-600">
              {{ searchResult.error }}
            </div>
            
            <div v-if="searchResult?.success && searchResult.user" class="p-2 bg-gray-50 rounded border">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {{ searchResult.user.username.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="text-sm font-medium">{{ searchResult.user.username }}</div>
                    <div class="text-xs text-gray-600">{{ searchResult.user.address.slice(0, 6) }}...{{ searchResult.user.address.slice(-4) }}</div>
                  </div>
                </div>
                <UButton 
                  size="xs" 
                  color="primary" 
                  :loading="addContactLoading"
                  @click="handleAddContact"
                >
                  Ajouter
                </UButton>
              </div>
            </div>
            
            <div v-if="addContactResult && !addContactResult.success" class="text-xs text-red-600">
              {{ addContactResult.error }}
            </div>
            
            <div v-if="addContactResult?.success" class="text-xs text-green-600">
              Contact ajouté avec succès !
            </div>
          </div>
        </div>
        
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
      <div class="p-6 mt-16">
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
const { searchUser, addContact, searchLoading, addContactLoading } = useContacts()

// États pour la recherche et l'ajout de contacts
const searchUsername = ref('')
const searchResult = ref<any>(null)
const addContactResult = ref<any>(null)

const handleLogout = async () => {
  logout()
  // Redirection supprimée - l'utilisateur reste sur la page courante
}

// Rechercher un utilisateur
const handleSearchUser = async () => {
  if (!searchUsername.value.trim()) {
    return
  }

  // Reset previous results
  searchResult.value = null
  addContactResult.value = null

  const result = await searchUser(searchUsername.value.trim())
  searchResult.value = result
}

// Ajouter un contact
const handleAddContact = async () => {
  if (!searchResult.value?.user || !user.value?.id) {
    return
  }

  const result = await addContact(searchResult.value.user.id, user.value.id)
  addContactResult.value = result
  
  if (result.success) {
    // Reset search after successful addition
    setTimeout(() => {
      searchUsername.value = ''
      searchResult.value = null
      addContactResult.value = null
    }, 2000)
  }
}
</script>