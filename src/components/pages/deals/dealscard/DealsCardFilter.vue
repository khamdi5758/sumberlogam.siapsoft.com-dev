<script setup>
import { ChevronDown, Search, Filter } from "lucide-vue-next";

const props = defineProps({
  searchQuery: {
    type: String,
    default: "",
  },
  selectedCurrency: {
    type: String,
    default: "IDR",
  },
  selectedPipeline: {
    type: String,
    default: "Sales Pipeline",
  },
  isSidebarCollapsed: {
    type: Boolean,
    default: false,
  },
  isCurrencyOpen: {
    type: Boolean,
    default: false,
  },
  isPipelineOpen: {
    type: Boolean,
    default: false,
  },
  itemsPerPage: {
    type: [Number, String],
    default: 10,
  },
});

const emit = defineEmits([
  "update:searchQuery",
  "update:itemsPerPage",
  "update:selectedCurrency",
  "update:selectedPipeline",
  "toggleCurrency",
  "togglePipeline",
  "selectCurrency",
  "selectPipeline",
]);

const currencies = ["IDR", "USD", "SGD", "EUR"];
const pipelines = ["Sales Pipeline", "Marketing Pipeline", "Dev Pipeline"];

const handleSearchInput = (e) => {
  emit("update:searchQuery", e.target.value);
};
</script>

<template>
  <div class="p-4 border-b border-outline">
    <!-- Mobile layout -->
    <div class="flex flex-col gap-3 md:hidden">
      <div class="flex items-center gap-2 w-full">
        <button
          class="p-2 border border-outline rounded-lg hover:bg-outline/30 transition shrink-0"
        >
          <Filter :size="20" class="text-main-text" />
        </button>

        <input
          :value="searchQuery"
          @input="handleSearchInput"
          type="text"
          placeholder="Search by Name"
          class="flex-1 min-w-0 pl-3 pr-4 py-2 bg-white border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
        />

        <button
          class="p-2 bg-outline hover:bg-outline/30 rounded-lg transition shrink-0"
        >
          <Search :size="20" class="text-main-text" />
        </button>
      </div>

      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-xs text-main-text whitespace-nowrap">Show</span>
          <select
            :value="itemsPerPage"
            @change="emit('update:itemsPerPage', Number($event.target.value))"
            class="px-2 py-1.5 border border-outline rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sub-text"
          >
            <option v-for="n in [10, 25, 50, 100]" :key="n" :value="n">
              {{ n }}
            </option>
          </select>
        </div>

        <div
          class="flex items-center gap-2 text-xs font-medium text-slate-600 min-w-0"
        >
          <div class="relative">
            <button
              @click="emit('toggleCurrency')"
              class="flex items-center gap-1 hover:text-main-text transition whitespace-nowrap"
            >
              <span>
                Curr:
                <span class="text-main-text font-bold">{{
                  selectedCurrency
                }}</span>
              </span>
              <ChevronDown
                :size="15"
                :class="{ 'rotate-180': isCurrencyOpen }"
                class="transition-transform"
              />
            </button>

            <div
              v-if="isCurrencyOpen"
              class="absolute right-0 mt-2 w-28 bg-white border border-outline rounded-lg shadow-lg z-20"
            >
              <ul class="py-1">
                <li
                  v-for="curr in currencies"
                  :key="curr"
                  @click="emit('selectCurrency', curr)"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-main-text font-normal"
                >
                  {{ curr }}
                </li>
              </ul>
            </div>
          </div>

          <div class="w-px h-4 bg-outline"></div>

          <div class="relative">
            <button
              @click="emit('togglePipeline')"
              class="flex items-center gap-1 hover:text-main-text transition whitespace-nowrap"
            >
              <span>
                Pipe:
                <span class="text-main-text font-bold">{{
                  selectedPipeline
                }}</span>
              </span>
              <ChevronDown
                :size="15"
                :class="{ 'rotate-180': isPipelineOpen }"
                class="transition-transform"
              />
            </button>

            <div
              v-if="isPipelineOpen"
              class="absolute right-0 mt-2 w-40 bg-white border border-outline rounded-lg shadow-lg z-20"
            >
              <ul class="py-1">
                <li
                  v-for="pipe in pipelines"
                  :key="pipe"
                  @click="emit('selectPipeline', pipe)"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-main-text font-normal"
                >
                  {{ pipe }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop layout unchanged -->
    <div class="hidden md:flex items-center gap-4 w-full">
      <!-- LEFT -->
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <!-- Filter -->
        <button
          class="p-2 border border-outline rounded-lg hover:bg-outline/30 transition"
        >
          <Filter :size="20" class="text-main-text" />
        </button>

        <!-- Search -->
        <input
          :value="searchQuery"
          @input="handleSearchInput"
          type="text"
          placeholder="Search by Name"
          class="pl-3 pr-4 py-2 bg-white border border-outline rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
        />

        <!-- Search Btn -->
        <button
          class="p-2 bg-outline hover:bg-outline/30 rounded-lg transition"
        >
          <Search :size="20" class="text-main-text" />
        </button>

        <!-- Show -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-main-text">Show</span>
          <select
            :value="itemsPerPage"
            @change="emit('update:itemsPerPage', $event.target.value)"
            class="px-3 py-2 border border-outline rounded-lg text-sm"
          >
            <option v-for="n in [10, 25, 50, 100]" :key="n" :value="n">
              {{ n }}
            </option>
          </select>
        </div>
      </div>

      <!-- Currency n pipeline -->
      <div class="flex items-center gap-4 text-sm font-medium text-slate-600">
        <!-- Currency Dropdown -->
        <div class="relative">
          <button
            @click="emit('toggleCurrency')"
            class="flex items-center gap-1 hover:text-main-text transition"
          >
            <span
              >Currency:
              <span class="text-main-text font-bold">{{
                selectedCurrency
              }}</span></span
            >
            <ChevronDown
              :size="16"
              :class="{ 'rotate-180': isCurrencyOpen }"
              class="transition-transform"
            />
          </button>

          <div
            v-if="isCurrencyOpen"
            class="absolute right-0 mt-2 w-32 bg-white border border-outline rounded-lg shadow-lg z-20"
          >
            <ul class="py-1">
              <li
                v-for="curr in currencies"
                :key="curr"
                @click="emit('selectCurrency', curr)"
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-main-text font-normal"
              >
                {{ curr }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Divider -->
        <div class="hidden sm:block w-px h-5 bg-outline"></div>

        <!-- Pipeline Dropdown -->
        <div class="relative">
          <button
            @click="emit('togglePipeline')"
            class="flex items-center gap-1 hover:text-main-text transition"
          >
            <span
              >Pipeline:
              <span class="text-main-text font-bold">{{
                selectedPipeline
              }}</span></span
            >
            <ChevronDown
              :size="16"
              :class="{ 'rotate-180': isPipelineOpen }"
              class="transition-transform"
            />
          </button>

          <div
            v-if="isPipelineOpen"
            class="absolute right-0 mt-2 w-48 bg-white border border-outline rounded-lg shadow-lg z-20"
          >
            <ul class="py-1">
              <li
                v-for="pipe in pipelines"
                :key="pipe"
                @click="emit('selectPipeline', pipe)"
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-main-text font-normal"
              >
                {{ pipe }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
