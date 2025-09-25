<template>
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
        <UButton
          color="neutral"
          variant="ghost"
          to="/login"
          icon="i-lucide-user-round"
          aria-label="Login"
        />
      </UTooltip>
    </template>

  </UHeader>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { user, isAuthenticated, logout } = useAuth()

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
      // Redirection supprimée - l'utilisateur reste sur la page courante
    }
  }]
])
</script>