<script setup>
import { ref, computed, watch } from "vue";
import {
  RefreshCcw,
  Filter,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Eye,
} from "lucide-vue-next";

//data
const documents = ref([
  {
    id: 1,
    name: "Company Profile 2026",
    owner: "Hanan Hafizhah",
    created: "12 Feb 2026",
    update: "15 Feb 2026",
  },
  {
    id: 2,
    name: "Marketing Strategy",
    owner: "Aulia Rahman",
    created: "10 Feb 2026",
    update: "18 Feb 2026",
  },
  {
    id: 3,
    name: "UI Design Guidelines",
    owner: "Rizky Pratama",
    created: "02 Feb 2026",
    update: "14 Feb 2026",
  },
  {
    id: 4,
    name: "Project Timeline",
    owner: "Siti Lestari",
    created: "01 Feb 2026",
    update: "16 Feb 2026",
  },
  {
    id: 5,
    name: "Financial Report",
    owner: "Budi Santoso",
    created: "22 Jan 2026",
    update: "12 Feb 2026",
  },
  {
    id: 6,
    name: "Product Roadmap",
    owner: "Kevin Wijaya",
    created: "18 Jan 2026",
    update: "11 Feb 2026",
  },
]);

//pagination

const itemsPerPage = ref(5);
const currentPage = ref(1);

const totalDocuments = computed(() => documents.value.length);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalDocuments.value / itemsPerPage.value)),
);

/* pastikan page valid */
watch(currentPage, (val) => {
  if (val < 1) currentPage.value = 1;
  if (val > totalPages.value) currentPage.value = totalPages.value;
});

/* reset page jika jumlah per page berubah */
watch(itemsPerPage, () => (currentPage.value = 1));

/* data yang tampil di tabel */
const currentDocuments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return documents.value.slice(start, end);
});

//checkbox select all

const selectedIds = ref([]);

const isAllSelected = computed({
  get() {
    return (
      currentDocuments.value.length > 0 &&
      currentDocuments.value.every((d) => selectedIds.value.includes(d.id))
    );
  },
  set(val) {
    if (val) {
      selectedIds.value = currentDocuments.value.map((d) => d.id);
    } else {
      selectedIds.value = [];
    }
  },
});

//action page

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}
</script>

<template>
  <!-- Document List -->
  <div
    class="bg-white rounded-lg shadow-sm border border-outline flex flex-col min-h-0 flex-1"
  >
    <div class="p-4 border-b border-outline">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- Left Section: Filter + Search + Show -->
        <div class="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <!-- Filter Icon -->
          <button
            class="p-2 border border-outline rounded-lg hover:bg-outline/30 transition shrink-0"
          >
            <Filter :size="20" class="text-main-text" />
          </button>

          <!-- Search Input -->
          <div class="relative w-full sm:w-auto">
            <Search
              :size="16"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by Name"
              class="w-full rounded-lg border border-outline bg-white py-2 pl-9 pr-4 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-sub-text sm:w-40"
            />
          </div>

          <!-- Show Dropdown -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-main-text">Show</span>
            <select
              v-model="itemsPerPage"
              class="px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>

        <!-- Right Section: Action Buttons -->
        <div
          class="flex w-full flex-wrap items-center justify-end gap-1 sm:w-auto sm:gap-2"
        >
          <!-- Add New -->
          <div class="relative inline-block add-dropdown">
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center gap-2 rounded-lg border border-outline bg-white px-2 py-2 text-sub-text shadow-sm transition hover:bg-sub-text hover:text-white sm:h-10 sm:w-auto sm:px-4"
            >
              <span class="text-lg font-semibold">+</span>
              <span class="hidden text-sm font-medium md:inline"
                >Add Documents</span
              >
            </button>
          </div>

          <!-- Download PDF -->
          <button
            :disabled="selectedIds.length === 0"
            class="flex h-9 w-9 items-center justify-center gap-2 rounded-lg border px-2 py-2 shadow-sm transition sm:h-10 sm:w-auto sm:px-4"
            :class="[
              selectedIds.length === 0
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-sub-text border-outline hover:bg-sub-text hover:text-white',
            ]"
          >
            <FileText :size="18" />
            <span
              class="hidden text-sm font-medium uppercase text-[10px] md:inline"
              >PDF</span
            >
          </button>

          <!-- Delete -->
          <button
            class="h-9 w-9 rounded-lg border border-red bg-white p-2 text-red transition hover:bg-red hover:text-white sm:h-10 sm:w-10"
          >
            <Trash2 :size="18" />
          </button>
        </div>
      </div>
    </div>

    <!--- filter select n page -->
    <div
      class="flex flex-wrap items-center border-b border-outline px-6 py-4 gap-3"
    >
      <!-- KIRI -->
      <label class="flex items-center gap-2 text-sm text-sub-text">
        <input
          type="checkbox"
          v-model="isAllSelected"
          class="h-4 w-4 rounded border-gray-300 text-sub-text focus:ring-sub-text"
        />
        Select all filtered result
      </label>

      <!-- PUSH KANAN -->
      <div
        class="flex w-full items-center justify-end gap-3 text-sm text-sub-text sm:w-auto sm:ml-auto"
      >
        <button
          @click="prevPage"
          class="p-2 rounded hover:bg-gray-100 transition disabled:opacity-40"
          :disabled="currentPage === 1"
        >
          <ChevronLeft :size="18" class="text-sub-text" />
        </button>

        <span>Page</span>

        <input
          type="number"
          v-model="currentPage"
          min="1"
          class="w-12 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-sub-text"
        />

        <span>of {{ totalPages }}</span>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="p-2 rounded hover:bg-gray-100 transition disabled:opacity-40"
        >
          <ChevronRight :size="18" class="text-sub-text" />
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="mt-4 flex-1 min-h-0 overflow-auto relative">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50/50">
              <th class="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 rounded focus:ring-sub-text border-gray-300"
                />
              </th>
              <th
                class="px-6 py-4 text-left text-sm font-semibold text-gray-700"
              >
                <div class="flex items-center gap-2">
                  Document Title
                  <ChevronDown :size="16" class="text-gray-400" />
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-sm font-semibold text-gray-700"
              >
                <div class="flex items-center gap-2">
                  Owner
                  <ChevronDown :size="16" class="text-gray-400" />
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-sm font-semibold text-gray-700"
              >
                <div class="flex items-center gap-2">
                  Created
                  <ChevronDown :size="16" class="text-gray-400" />
                </div>
              </th>
              <th
                class="px-6 py-4 text-left text-sm font-semibold text-gray-700"
              >
                <div class="flex items-center gap-2">
                  Update
                  <ChevronDown :size="16" class="text-gray-400" />
                </div>
              </th>
              <th
                class="px-6 py-4 text-center text-sm font-semibold text-gray-700 w-20"
              >
                Preview
              </th>
            </tr>
          </thead>

          <tbody>
            <!-- Empty State -->
            <tr v-if="currentDocuments.length === 0">
              <td colspan="5" class="px-6 py-20 text-center text-sub-text">
                <div class="flex flex-col items-center gap-3">
                  <div
                    class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"
                  >
                    <Search :size="32" class="text-gray-400" />
                  </div>
                  <p class="text-lg font-medium">No documents found</p>
                  <p class="text-sm text-gray-400">
                    Start adding documents to see them here
                  </p>
                </div>
              </td>
            </tr>

            <!-- Sample rows -->
            <tr
              v-for="doc in currentDocuments"
              :key="doc.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition"
            >
              <td class="px-6 py-4">
                <input
                  type="checkbox"
                  :value="doc.id"
                  v-model="selectedIds"
                  class="w-4 h-4 text-blue-600 rounded focus:ring-sub-text border-gray-300"
                />
              </td>
              <td class="px-6 py-4 text-sm text-gray-800 font-medium">
                {{ doc.name }}
              </td>
              <td class="px-6 py-4 text-sm text-main-text">
                {{ doc.owner }}
              </td>
              <td class="px-6 py-4 text-sm text-main-text">
                {{ doc.created }}
              </td>
              <td class="px-6 py-4 text-sm text-main-text">
                {{ doc.update }}
              </td>
              <td class="px-6 py-4 text-center">
                <button
                  class="p-1.5 border border-outline bg-white text-sub-text rounded-md shadow-sm hover:bg-sub-text hover:text-white transition group relative"
                >
                  <Eye :size="18" />
                  <!-- Mini Tooltip -->
                  <div
                    class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10"
                  >
                    Preview Item
                  </div>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
