<script setup>
import { Search, Filter, ChevronDown } from "lucide-vue-next";
import { ref } from "vue";

const props = defineProps({
  searchQuery: String,
});

const emit = defineEmits(["update:searchQuery"]);

// Data Mata Uang & Pipeline (Local state for dropdowns)
const currencies = ["IDR", "USD", "SGD", "EUR"];
const selectedCurrency = ref("IDR");
const isCurrencyOpen = ref(false);

const pipelines = ["Sales Pipeline", "Marketing Pipeline", "Dev Pipeline"];
const selectedPipeline = ref("Sales Pipeline");
const isPipelineOpen = ref(false);
</script>

<template>
  <div class="pt-4 pr-4 pl-4">
    <div class="flex items-center gap-4 w-full">
      <!-- LEFT: Filter & Search -->
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <!-- Filter Button -->
        <button
          class="p-2 border border-outline rounded-lg hover:bg-outline/30 transition flex-shrink-0"
        >
          <Filter :size="20" class="text-dark-base" />
        </button>

        <!-- Search Input -->
        <div class="relative w-64 flex-shrink-0">
          <input
            :value="searchQuery"
            @input="emit('update:searchQuery', $event.target.value)"
            type="text"
            placeholder="Search by Name"
            class="w-full pl-3 pr-10 py-2 bg-white border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
          />
          <div class="absolute right-3 top-1/2 -translate-y-1/2">
            <Search :size="18" class="text-sub-text opacity-60" />
          </div>
        </div>

        <!-- Search button for accessibility/intent -->
        <button
          class="p-2 bg-outline hover:bg-outline/30 rounded-lg transition"
        >
          <Search :size="20" class="text-dark-base" />
        </button>
      </div>

      <!-- RIGHT: Currency & Pipeline Selective Dropdowns -->
      <div class="flex items-center gap-4 text-sm font-medium text-slate-600">
        <!-- Currency Dropdown -->
        <div class="relative">
          <button
            @click="isCurrencyOpen = !isCurrencyOpen"
            class="flex items-center gap-1 hover:text-dark-base transition"
          >
            <span class="whitespace-nowrap">
              Currency:
              <span class="text-dark-base font-bold">{{
                selectedCurrency
              }}</span>
            </span>
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
                @click="
                  selectedCurrency = curr;
                  isCurrencyOpen = false;
                "
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-dark-base"
              >
                {{ curr }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Vertical Divider -->
        <div class="hidden sm:block w-px h-5 bg-outline"></div>

        <!-- Pipeline Dropdown -->
        <div class="relative">
          <button
            @click="isPipelineOpen = !isPipelineOpen"
            class="flex items-center gap-1 hover:text-dark-base transition"
          >
            <span class="whitespace-nowrap">
              Pipeline:
              <span class="text-dark-base font-bold">{{
                selectedPipeline
              }}</span>
            </span>
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
                @click="
                  selectedPipeline = pipe;
                  isPipelineOpen = false;
                "
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-dark-base"
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
