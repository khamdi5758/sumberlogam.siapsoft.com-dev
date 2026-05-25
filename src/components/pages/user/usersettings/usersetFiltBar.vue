<template>
  <div class="flex flex-col gap-3">
    <div class="flex min-w-0 items-center gap-2 sm:gap-3">
      <button
        class="p-2 border border-outline rounded-lg hover:bg-outline/30 transition shrink-0"
      >
        <Filter :size="20" class="text-main-text" />
      </button>

      <div class="relative min-w-0 flex-1">
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          type="text"
          placeholder="Search by Name"
          class="w-full rounded-lg border border-outline bg-white py-2 pl-3 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
        />
      </div>

      <button
        @click="$emit('search')"
        class="p-2 bg-outline hover:bg-outline/30 rounded-lg transition shrink-0"
      >
        <Search :size="20" class="text-main-text" />
      </button>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="text-xs text-main-text sm:text-sm">Show</span>
        <select
          :value="itemsPerPage"
          @change="$emit('update:itemsPerPage', Number($event.target.value))"
          class="px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>

      <div
        class="flex items-center gap-2 text-xs text-sub-text sm:gap-3 sm:text-sm"
      >
        <button
          @click="$emit('prev-page')"
          class="p-2 rounded hover:bg-gray-100 transition disabled:opacity-40"
          :disabled="currentPage === 1"
        >
          <ChevronLeft :size="18" class="text-sub-text" />
        </button>

        <span class="hidden sm:inline">Page</span>
        <span class="sm:hidden">Pg</span>

        <input
          type="number"
          :value="currentPage"
          min="1"
          :max="totalPages"
          @input="$emit('update:currentPage', Number($event.target.value))"
          class="w-12 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-sub-text"
        />

        <span class="hidden sm:inline">of {{ totalPages }}</span>
        <span class="sm:hidden">/ {{ totalPages }}</span>

        <button
          @click="$emit('next-page')"
          class="p-2 rounded hover:bg-gray-100 transition disabled:opacity-40"
          :disabled="currentPage === totalPages"
        >
          <ChevronRight :size="18" class="text-sub-text" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Filter, Search, ChevronLeft, ChevronRight } from "lucide-vue-next";

export default {
  name: "UsersFilterBar",
  components: { Filter, Search, ChevronLeft, ChevronRight },
  props: {
    searchQuery: { type: String, default: "" },
    itemsPerPage: { type: Number, default: 5 },
    currentPage: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
  },
};
</script>
