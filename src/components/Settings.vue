<script setup>
import { RefreshCcw, Construction, Settings } from "lucide-vue-next";
</script>

<template>
  <!-- Header with Title and Update Button -->
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-3">
      <h1 class="text-2xl font-bold text-main-text">Settings</h1>
    </div>

    <!-- Update Button -->
    <button
      class="flex items-center gap-2 px-4 py-2 border border-outline bg-white text-sub-text rounded-lg hover:bg-sub-text hover:text-white transition shadow-sm"
    >
      <span class="text-sm font-medium">Update</span>
      <RefreshCcw :size="18" />
    </button>
  </div>

  <!-- Content Area -->
  <div
    class="bg-white rounded-xl shadow-sm border border-outline p-12 flex flex-col items-center justify-center min-h-[400px] text-center"
  >
    <!-- Warning Icon -->
    <div
      class="w-16 h-16 bg-light-base rounded-full flex items-center justify-center mb-6"
    >
      <Construction :size="32" class="text-sub-text animate-pulse" />
    </div>

    <!-- Warning Text -->
    <h2 class="text-2xl font-bold text-main-text mb-2">
      Page Under Construction
    </h2>
    <p class="text-sub-text max-w-md mx-auto">
      We are currently working hard to bring you the best settings experience.
      Please check back later for updates on this feature.
    </p>

    <!-- Decorative Settings Icon -->
    <div class="mt-8 opacity-20 transform rotate-12">
      <Settings :size="64" class="text-gray-400" />
    </div>
  </div>
</template>

<style scoped>
/* Keyframes for a subtle pulse if needed, although animate-pulse is built into Tailwind */
</style>
