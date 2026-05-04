<script setup>
import DealsStageDropdown from "./DealsStageDropdown.vue";
import { ChevronDown } from "lucide-vue-next";

const props = defineProps({
  deal: Object,
  selectedDeals: Array,
});

const emit = defineEmits(["view", "toggle"]);
</script>

<template>
  <tr
    @click="emit('view', deal)"
    class="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer group"
  >
    <!-- Checkbox Column -->
    <td class="px-6 py-4" @click.stop>
      <input
        type="checkbox"
        :checked="selectedDeals.includes(deal.id)"
        @change="emit('toggle', deal.id)"
        class="w-4 h-4 text-blue-600 rounded focus:ring-sub-text border-gray-300 transition cursor-pointer"
      />
    </td>

    <!-- Deal Name Column -->
    <td class="px-6 py-4 text-sm text-gray-800 font-medium truncate max-w-50">
      {{ deal.name }}
    </td>

    <!-- Stage Column -->
    <td class="px-6 py-4 text-sm text-dark-base" @click.stop>
      <DealsStageDropdown :deal="deal" />
    </td>

    <!-- Amount / Date Column -->
    <td class="px-6 py-4 text-sm text-dark-base whitespace-nowrap">
      <div class="flex flex-col">
        <span class="font-semibold">{{ deal.jumlah }}</span>
        <span class="text-[11px] text-gray-400">{{ deal.tertanggal }}</span>
      </div>
    </td>

    <!-- Association Column -->
    <td class="px-6 py-4 text-sm text-dark-base truncate max-w-62.5">
      <div class="flex items-center gap-1.5 overflow-hidden">
        <span class="font-medium text-gray-600 shrink-0">{{
          deal.contact
        }}</span>
        <span class="text-gray-300 shrink-0">—</span>
        <span class="text-gray-500 truncate">{{ deal.company }}</span>
      </div>
    </td>

    <!-- Created/Updated Column -->
    <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap text-[11px]">
      {{ deal.updatedAt }}
    </td>

    <!-- Owner Column -->
    <td class="px-6 py-4 text-sm text-gray-700 font-medium whitespace-nowrap">
      <div class="flex items-center gap-2">
        <div
          class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold border border-slate-200"
        >
          {{ (deal.owner || "U").charAt(0).toUpperCase() }}
        </div>
        <span>{{ deal.owner }}</span>
      </div>
    </td>
  </tr>
</template>
