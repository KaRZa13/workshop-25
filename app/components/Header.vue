<template>
  <UHeader title="Outernet">
    <template #title>
      <!-- LOGO -->
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton />

      <UTooltip text="Open on GitHub" :kbds="['meta', 'G']">
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/KaRZa13/workshop-25"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          />
      </UTooltip>
    </template>

  </UHeader>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Home',
    to: '/'
  },
  {
    label: 'Messages',
    to: '/messages'
  }
])
</script>