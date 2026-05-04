<script setup>
import { ChevronLeft, ChevronRight, Trash } from "lucide-vue-next";

const props = defineProps({
  isAllSelected: Boolean,
  currentPage: Number,
  totalPages: Number,
  selectedCount: Number,
  itemsPerPage: Number,
});

const emit = defineEmits([
  "toggleAll",
  "page",
  "update:itemsPerPage",
  "delete",
]);
</script>

<template>
  <div class="px-6 py-4 flex items-center justify-between">
    <!-- LEFT: Selection & Bulk Actions -->
    <div class="flex items-center gap-4">
      <label
        class="flex items-center gap-2 text-sm text-sub-text cursor-pointer hover:text-dark-base transition"
      >
        <input
          type="checkbox"
          :checked="isAllSelected"
          @change="emit('toggleAll', $event.target.checked)"
          class="h-4 w-4 rounded border-gray-300 text-sub-text focus:ring-sub-text transition"
        />
        <span>Select all filtered result</span>
      </label>

      <!-- Delete Selected 
      <button
        type="button"
        @click="emit('delete')"
        :disabled="selectedCount === 0"
        class="h-10 w-10 rounded-lg border border-red bg-white p-2 text-red transition hover:bg-red hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-red"
        title="Delete selected deals"
      >
        <Trash :size="16" />
      </button>

      <!-- Items Per Page Dropdown -->
      <div class="flex items-center gap-2 ml-4">
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
    </div>

    <!-- RIGHT: Pagination Controls -->
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
</template>
