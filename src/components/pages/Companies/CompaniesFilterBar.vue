<template>
  <div class="space-y-3 md:space-y-0">
    <!-- Mobile layout -->
    <div class="flex flex-col gap-3 md:hidden">
      <div class="flex items-center gap-2 w-full">
        <button
          class="p-2 border border-outline rounded-lg hover:bg-outline/30 transition shrink-0"
        >
          <Filter :size="20" class="text-main-text" />
        </button>

        <div class="relative flex-1 min-w-0">
          <input
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            type="text"
            placeholder="Search by Name, Email, or Address"
            class="w-full rounded-lg border border-outline bg-white py-2 pl-3 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
          />
        </div>

        <button
          class="p-2 bg-outline hover:bg-outline/30 rounded-lg transition shrink-0"
          @click="$emit('search')"
        >
          <Search :size="20" class="text-main-text" />
        </button>
      </div>

      <div
        class="flex items-center justify-between gap-2 text-xs text-sub-text"
      >
        <div class="flex items-center gap-1 min-w-0">
          <span class="text-main-text whitespace-nowrap">Show</span>
          <select
            :value="itemsPerPage"
            @change="$emit('update:itemsPerPage', Number($event.target.value))"
            class="px-2 py-1 border border-outline rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sub-text"
          >
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <button
            @click="$emit('prev-page')"
            class="p-1 rounded hover:bg-gray-100 transition disabled:opacity-40 shrink-0"
            :disabled="currentPage === 1"
            title="Previous page"
          >
            <ChevronLeft :size="18" class="text-sub-text" />
          </button>

          <div class="flex items-center gap-1">
            <input
              type="number"
              :value="currentPage"
              min="1"
              :max="totalPages"
              @input="$emit('update:currentPage', Number($event.target.value))"
              @keyup.enter="$emit('onEnter')"
              class="w-10 px-1 py-1 border border-gray-300 rounded text-center text-xs focus:outline-none focus:ring-1 focus:ring-sub-text"
            />
            <span class="whitespace-nowrap">/ {{ totalPages }}</span>
          </div>

          <button
            @click="$emit('next-page')"
            class="p-1 rounded hover:bg-gray-100 transition disabled:opacity-40 shrink-0"
            :disabled="currentPage === totalPages"
            title="Next page"
          >
            <ChevronRight :size="18" class="text-sub-text" />
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop layout -->
    <div class="hidden md:flex items-center gap-4 w-full">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <button
          class="p-2 border border-outline rounded-lg hover:bg-outline/30 transition shrink-0"
        >
          <Filter :size="20" class="text-main-text" />
        </button>

        <div class="relative flex-1 min-w-0 max-w-65">
          <input
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            type="text"
            placeholder="Search by Name, Email, or Address"
            class="w-full rounded-lg border border-outline bg-white py-2 pl-3 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-sub-text"
          />
        </div>

        <button
          class="p-2 bg-outline hover:bg-outline/30 rounded-lg transition shrink-0"
          @click="$emit('search')"
        >
          <Search :size="20" class="text-main-text" />
        </button>
      </div>

      <div class="flex items-center gap-6 shrink-0 text-sm text-sub-text">
        <div class="flex items-center gap-2 whitespace-nowrap">
          <span class="text-main-text">Show</span>
          <select
            :value="itemsPerPage"
            @change="$emit('update:itemsPerPage', Number($event.target.value))"
            class="px-3 py-2 border border-outline rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-sub-text"
          >
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>

        <div class="flex items-center gap-3 whitespace-nowrap">
          <button
            @click="$emit('prev-page')"
            class="p-2 rounded hover:bg-gray-100 transition disabled:opacity-40 shrink-0"
            :disabled="currentPage === 1"
            title="Previous page"
          >
            <ChevronLeft :size="18" class="text-sub-text" />
          </button>

          <div class="flex items-center gap-2">
            <span class="font-medium text-main-text">Page</span>
            <input
              type="number"
              :value="currentPage"
              min="1"
              :max="totalPages"
              @input="$emit('update:currentPage', Number($event.target.value))"
              @keyup.enter="$emit('onEnter')"
              class="w-12 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-sub-text"
            />
            <span class="text-gray-400">of {{ totalPages }}</span>
          </div>

          <button
            @click="$emit('next-page')"
            class="p-2 rounded hover:bg-gray-100 transition disabled:opacity-40 shrink-0"
            :disabled="currentPage === totalPages"
            title="Next page"
          >
            <ChevronRight :size="18" class="text-sub-text" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Filter, Search, ChevronLeft, ChevronRight } from "lucide-vue-next";

export default {
  name: "CompaniesFilterBar",
  components: { Filter, Search, ChevronLeft, ChevronRight },
  props: {
    searchQuery: { type: String, default: "" },
    itemsPerPage: { type: Number, default: 10 },
    currentPage: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
  },
  emits: [
    "update:searchQuery",
    "update:itemsPerPage",
    "update:currentPage",
    "search",
    "prev-page",
    "next-page",
    "onEnter",
  ],
};
</script>
