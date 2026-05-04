<script setup>
import { Search } from "lucide-vue-next";
</script>

<template>
  <tr>
    <td colspan="7" class="px-6 py-20 text-center text-sub-text bg-slate-50/50">
      <div
        class="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300"
      >
        <div
          class="w-16 h-16 bg-white shadow-sm border border-outline rounded-full flex items-center justify-center"
        >
          <Search :size="32" class="text-gray-300" />
        </div>
        <div class="space-y-1">
          <p class="text-lg font-bold text-dark-base">No deals found</p>
          <p class="text-sm text-gray-400 max-w-xs mx-auto">
            Start adding deals or adjust your search filters to see them here
          </p>
        </div>
      </div>
    </td>
  </tr>
</template>
