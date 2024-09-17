<script setup>
import UpgradeToPro from '@/components/UpgradeToPro.vue'
// For now, want to apply auth check on every page. 
// TODO: only certain page will not required to check auth. 
import { useAuthStore } from '@/plugins/auth'

// Initialize the authentication state
const authStore = useAuthStore()
authStore.initializeAuth()
</script>

<template>
  <VApp>
    <RouterView />
    <UpgradeToPro />
  </VApp>
</template>
