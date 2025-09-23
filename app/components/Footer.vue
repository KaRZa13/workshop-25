<template>
  <div class="flex flex-col justify-center items-center gap-4 py-4">
    <UFooterColumns :columns="columns">

      <template #right>
        <UFormField name="email" label="Subscribe to our Outernet newsletter" size="lg">
          <UInput type="email" class="w-full">
            <template #trailing>
              <UButton type="submit" size="xs" color="neutral" label="Subscribe" />
            </template>
          </UInput>
        </UFormField>
      </template>
    </UFooterColumns>

    <USeparator />

    <UFooter>
    <template #left>
      <p class="text-muted text-sm whitespace-nowrap">Copyright © {{ new Date().getFullYear() }}</p>
    </template>

    <template #right>
      <UButton
        icon="i-simple-icons-discord"
        color="neutral"
        variant="ghost"
        to="https://www.youtube.com/watch?v=dQw4w9WgXcQ&autoplay=1"
        target="_blank"
        aria-label="Discord"
      />
      <UButton
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
        to="https://github.com/KaRZa13/workshop-25"
        target="_blank"
        aria-label="GitHub"
      />
    </template>
  </UFooter>
  </div>
</template>

<script setup lang="ts">
import type { FooterColumn } from '@nuxt/ui'

const columns: FooterColumn[] = [
  {
    label: 'Solutions',
    children: [
      {
        label: 'Messenger',
        to: '/',
        target: '_blank'
      },
      {
        label: 'Prices (free)',
        to: '/',
        target: '_blank'
      },
      {
        label: 'Outernet on GitHub',
        to: '/',
        target: '_blank'
      }
    ]
  },
  {
    label: 'About',
    children: [
      {
        label: 'Contact',
        to: '/',
        target: '_blank'
      },
      {
        label: 'Team',
        to: '/',
        target: '_blank'
      },
      {
        label: 'Legal',
        to: '/',
        target: '_blank'
      },
      {
        label: 'Support',
        to: '/',
        target: '_blank'
      }
    ]
  }
]
</script>

