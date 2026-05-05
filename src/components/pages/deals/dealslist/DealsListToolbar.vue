<script setup>
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

const props = defineProps({
  currentPage: Number,
  totalPages: Number,
  itemsPerPage: Number,
});

const emit = defineEmits(["page", "update:itemsPerPage"]);
</script>

<template>
  <div class="px-4 py-2 md:px-6 border-b border-outline bg-slate-50/50">
    <div class="flex items-center justify-between gap-3 md:hidden">
      <div class="flex items-center gap-2 min-w-0 shrink-0">
        <span class="text-sm text-sub-text whitespace-nowrap">Show</span>
        <select
          :value="itemsPerPage"
          @change="emit('update:itemsPerPage', Number($event.target.value))"
          class="px-2 py-1 border border-outline rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-sub-text"
        >
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>

      <div
        class="flex items-center justify-end gap-2 text-sm text-sub-text min-w-0"
      >
        <button
          @click="emit('page', currentPage - 1)"
          class="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed group shrink-0"
          :disabled="currentPage <= 1"
          title="Previous Page"
        >
          <ChevronLeft
            :size="18"
            class="text-sub-text group-hover:text-dark-base"
          />
        </button>

        <div class="flex items-center gap-1 sm:gap-2 min-w-0">
          <span class="font-medium whitespace-nowrap">Page</span>
          <input
            type="number"
            :value="currentPage"
            @input="emit('page', Number($event.target.value))"
            min="1"
            :max="totalPages"
            class="w-11 px-2 py-1 border border-outline rounded text-center focus:outline-none focus:ring-1 focus:ring-sub-text text-dark-base font-bold bg-white"
          />
          <span class="text-gray-400 whitespace-nowrap"
            >of {{ totalPages }}</span
          >
        </div>

        <button
          @click="emit('page', currentPage + 1)"
          class="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed group shrink-0"
          :disabled="currentPage >= totalPages"
          title="Next Page"
        >
          <ChevronRight
            :size="18"
            class="text-sub-text group-hover:text-dark-base"
          />
        </button>
      </div>
    </div>

    <div class="hidden md:flex items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <span class="text-sm text-sub-text">Show</span>
        <select
          :value="itemsPerPage"
          @change="emit('update:itemsPerPage', Number($event.target.value))"
          class="px-2 py-1 border border-outline rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-sub-text"
        >
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>

      <div class="flex items-center gap-3 text-sm text-sub-text">
        <button
          @click="emit('page', currentPage - 1)"
          class="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed group"
          :disabled="currentPage <= 1"
          title="Previous Page"
        >
          <ChevronLeft
            :size="18"
            class="text-sub-text group-hover:text-dark-base"
          />
        </button>

        <div class="flex items-center gap-2">
          <span class="font-medium">Page</span>
          <input
            type="number"
            :value="currentPage"
            @input="emit('page', Number($event.target.value))"
            min="1"
            :max="totalPages"
            class="w-12 px-2 py-1 border border-outline rounded text-center focus:outline-none focus:ring-1 focus:ring-sub-text text-dark-base font-bold bg-white"
          />
          <span class="text-gray-400">of {{ totalPages }}</span>
        </div>

        <button
          @click="emit('page', currentPage + 1)"
          class="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed group"
          :disabled="currentPage >= totalPages"
          title="Next Page"
        >
          <ChevronRight
            :size="18"
            class="text-sub-text group-hover:text-dark-base"
          />
        </button>
      </div>
    </div>
  </div>
</template>
