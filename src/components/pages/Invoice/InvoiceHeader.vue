<template>
  <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
    <div class="flex min-w-0 items-baseline gap-3">
      <h1 class="text-2xl font-bold text-main-text">Invoices</h1>
      <span class="hidden text-sm md:inline" :class="invoiceStatusClass">
        {{ invoiceStatusText }}
      </span>
    </div>

    <div class="relative md:hidden" ref="mobileActionsRef">
      <button
        type="button"
        @click="toggleMobileActions"
        class="flex h-10 w-10 items-center justify-center rounded-lg border border-outline bg-white text-sub-text transition hover:bg-sub-text hover:text-white"
        aria-label="Open invoice actions"
      >
        <ChevronDown
          :size="16"
          class="transition-transform duration-200"
          :class="{ 'rotate-180': showMobileActions }"
        />
      </button>

      <div
        v-show="showMobileActions"
        class="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-outline bg-white shadow-lg"
      >
        <button
          @click="runMobileAction('refresh')"
          :disabled="isLoading"
          class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-main-text hover:bg-gray-100 disabled:opacity-50"
        >
          <RefreshCw :size="16" :class="{ 'animate-spin': isLoading }" />
          <span>Refresh</span>
        </button>

        <button
          @click="runMobileAction('open-add-single')"
          class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-main-text hover:bg-gray-100"
        >
          <FilePlus :size="16" />
          <span>Single Invoice</span>
        </button>

        <button
          @click="runMobileAction('open-bulk-add')"
          class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-main-text hover:bg-gray-100"
        >
          <FolderPlus :size="16" />
          <span>Bulk Invoice</span>
        </button>

        <button
          @click="runMobileAction('download')"
          class="flex w-full items-center gap-2 border-t border-gray-50 px-4 py-3 text-left text-sm text-main-text hover:bg-gray-100"
        >
          <FileDown :size="16" />
          <span>{{ downloadLabel }}</span>
        </button>

        <button
          @click="runMobileAction('download-all')"
          class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-main-text hover:bg-gray-100"
        >
          <FolderDown :size="16" />
          <span>Download All</span>
        </button>

        <button
          @click="runMobileAction('bulk-edit')"
          class="flex w-full items-center gap-2 border-t border-gray-50 px-4 py-3 text-left text-sm text-main-text hover:bg-gray-100"
        >
          <Edit :size="16" />
          <span>Bulk Edit</span>
        </button>

        <button
          @click="runMobileAction('delete-selected')"
          class="flex w-full items-center gap-2 border-t border-gray-50 px-4 py-3 text-left text-sm text-red hover:bg-gray-100"
        >
          <Trash2 :size="16" />
          <span>Delete Selected</span>
        </button>
      </div>
    </div>

    <div
      class="hidden w-full flex-wrap items-center justify-end gap-1 sm:w-auto sm:gap-2 md:flex"
    >
      <button
        @click="$emit('refresh')"
        :disabled="isLoading"
        class="h-9 w-9 rounded-lg border border-outline bg-white p-2 transition-all hover:bg-light-base active:scale-95 disabled:opacity-50 sm:h-10 sm:w-10"
        title="Refresh Data"
      >
        <RefreshCw
          :size="18"
          :class="{ 'animate-spin': isLoading }"
          class="text-sub-text"
        />
      </button>

      <!-- Add New -->
      <div class="relative inline-block add-dropdown">
        <button
          type="button"
          @click="$emit('toggle-add-dropdown')"
          class="flex h-9 w-9 items-center justify-center gap-2 rounded-lg border border-outline bg-white px-2 py-2 text-sub-text transition hover:bg-sub-text hover:text-white sm:h-10 sm:w-auto sm:px-4"
        >
          <span class="text-lg font-semibold">+</span>
          <span class="hidden text-sm font-medium md:inline">Add New</span>
          <ChevronDown
            :size="16"
            class="hidden transition-transform duration-200 md:inline"
            :class="{ 'rotate-180': showAddDropdown }"
          />
        </button>

        <div
          v-show="showAddDropdown"
          class="absolute right-0 text-sub-text mt-2 w-44 bg-white border border-outline rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95"
        >
          <button
            @click="$emit('open-add-single')"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <FilePlus :size="18" />
            <span class="font-medium">Single Invoice</span>
          </button>

          <button
            @click="$emit('open-bulk-add')"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <FolderPlus :size="18" />
            <span class="font-medium">Bulk Invoice</span>
          </button>
        </div>
      </div>

      <!-- Download -->
      <div class="relative inline-block download-dropdown">
        <button
          type="button"
          @click="$emit('toggle-download-dropdown')"
          class="flex h-9 w-9 items-center justify-center gap-2 rounded-lg border border-outline bg-white px-2 py-2 text-sub-text transition hover:bg-sub-text hover:text-white sm:h-10 sm:w-auto sm:px-4"
        >
          <Download :size="18" />
          <span class="hidden text-sm font-medium md:inline">Download</span>
          <ChevronDown
            :size="16"
            class="hidden transition-transform duration-200 md:inline"
            :class="{ 'rotate-180': showDownloadDropdown }"
          />
        </button>

        <div
          v-show="showDownloadDropdown"
          class="absolute text-sub-text right-0 mt-2 w-48 bg-white border border-outline rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95"
        >
          <button
            @click="$emit('download-all')"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <FolderDown :size="18" class="text-sub-text" />
            <span class="font-medium">Download All</span>
          </button>

          <button
            @click="$emit('download')"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 border-t border-gray-50"
          >
            <FileDown :size="18" class="text-sub-text" />
            <span class="font-medium">{{ downloadLabel }}</span>
          </button>
        </div>
      </div>

      <!-- Bulk Edit -->
      <button
        class="flex h-9 w-9 items-center justify-center gap-2 rounded-lg border border-outline bg-white px-2 py-2 text-sub-text transition hover:bg-sub-text hover:text-white sm:h-10 sm:w-auto sm:px-4"
      >
        <Edit :size="18" />
        <span class="hidden text-sm font-medium md:inline">Bulk Edit</span>
      </button>

      <!-- Delete -->
      <button
        @click="$emit('delete-selected')"
        class="h-9 w-9 rounded-lg border border-red bg-white p-2 text-red transition hover:bg-red hover:text-white sm:h-10 sm:w-10"
      >
        <Trash2 :size="18" />
      </button>
    </div>
  </div>
</template>

<script>
import {
  ChevronDown,
  Download,
  Edit,
  Trash2,
  FolderPlus,
  FilePlus,
  FileDown,
  FolderDown,
  RefreshCw,
} from "lucide-vue-next";

export default {
  name: "InvoiceHeader",
  components: {
    ChevronDown,
    Download,
    Edit,
    Trash2,
    FolderPlus,
    FilePlus,
    FileDown,
    FolderDown,
    RefreshCw,
  },
  props: {
    isLoading: { type: Boolean, default: false },
    invoiceStatusText: { type: String, default: "" },
    invoiceStatusClass: { type: String, default: "" },
    downloadLabel: { type: String, default: "Download" },
    showAddDropdown: { type: Boolean, default: false },
    showDownloadDropdown: { type: Boolean, default: false },
  },
  emits: [
    "refresh",
    "toggle-add-dropdown",
    "toggle-download-dropdown",
    "open-add-single",
    "open-bulk-add",
    "download-all",
    "download",
    "delete-selected",
  ],
  data() {
    return {
      showMobileActions: false,
    };
  },
  methods: {
    toggleMobileActions() {
      this.showMobileActions = !this.showMobileActions;
    },
    runMobileAction(action) {
      this.showMobileActions = false;
      this.$emit(action);
    },
    handleClickOutside(event) {
      if (!this.showMobileActions) return;
      if (
        this.$refs.mobileActionsRef &&
        !this.$refs.mobileActionsRef.contains(event.target)
      ) {
        this.showMobileActions = false;
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>
