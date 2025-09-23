<template>
  <UPageHero
    title="Welcome to Outernet"
    description="The best way to communicate without WIFI"
    headline="New release"
    orientation="horizontal"
    reverse
  >
    <img
      src=""
      alt="App screenshot"
      class="rounded-lg shadow-2xl ring ring-default"
    />
  </UPageHero>

  <USeparator />

  <UPageSection
    title="Features"
    description=""
    icon=""
    orientation="horizontal"
    :features="features"
  >
    <img
      src=""
      alt="App screenshot"
      class="w-full rounded-lg"
    />
  </UPageSection>

  <USeparator />

  <Footer />
</template>

<script setup lang="ts">
const features = ref([
  {
    title: 'Feature 1',
    description: 'Description for feature 1',
    icon: 'i-lucide-a-large-small'
  },
  {
    title: 'Feature 2',
    description: 'Description for feature 2',
    icon: 'i-simple-icons-nuxtdotjs'
  },
  {
    title: 'Feature 3',
    description: 'Description for feature 3',
    icon: 'i-simple-icons-tailwindcss'
  }
])
</script>