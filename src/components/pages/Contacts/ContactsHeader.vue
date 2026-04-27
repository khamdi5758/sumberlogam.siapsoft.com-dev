<template>
  <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
    <div class="flex min-w-0 items-baseline gap-3">
      <h1 class="text-2xl font-bold text-dark-base">Contacts</h1>
      <span class="text-sm" :class="contactsStatusClass">{{
        contactsStatusText
      }}</span>
    </div>

    <div
      class="flex w-full flex-wrap items-center justify-end gap-1 sm:w-auto sm:gap-2"
    >
      <button
        class="flex h-9 w-9 items-center justify-center gap-2 rounded-lg border border-fecbuk bg-white px-2 py-2 text-fecbuk shadow-sm transition hover:bg-fecbuk hover:text-white sm:h-10 sm:w-auto sm:px-4"
      >
        <Facebook :size="18" />
        <span class="hidden text-sm font-medium md:inline"
          >Connect Facebook</span
        >
        <ChevronDown :size="16" class="hidden md:inline" />
      </button>

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
            <span class="font-medium">Single Contact</span>
          </button>

          <button
            @click="$emit('open-bulk-add')"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <FolderPlus :size="18" />
            <span class="font-medium">Bulk Contact</span>
          </button>
        </div>
      </div>

      <!-- Download -->
      <div class="relative inline-block printable-dropdown">
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
            <FolderDown :size="16" />
            <span class="font-medium">Download All</span>
          </button>

          <button
            @click="$emit('download')"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <FileDown :size="16" />
            <span class="font-medium">{{ downloadLabel }}</span>
          </button>
        </div>
      </div>

      <button
        class="flex h-9 w-9 items-center justify-center gap-2 rounded-lg border border-outline bg-white px-2 py-2 text-sub-text transition hover:bg-sub-text hover:text-white sm:h-10 sm:w-auto sm:px-4"
      >
        <Edit :size="18" />
        <span class="hidden text-sm font-medium md:inline">Bulk Edit</span>
      </button>

      <!-- <button
        @click="$emit('delete-selected')"
        class="h-9 w-9 rounded-lg border border-red bg-white p-2 text-red transition hover:bg-red hover:text-white sm:h-10 sm:w-10"
      >
        <Trash2 :size="18" />
      </button> -->
    </div>
  </div>
</template>

<script>
import {
  ChevronDown,
  Download,
  Edit,
  Trash2,
  Facebook,
  FolderPlus,
  FilePlus,
  FileDown,
  FolderDown,
  RefreshCw,
} from "lucide-vue-next";

export default {
  name: "ContactsHeader",
  components: {
    ChevronDown,
    Download,
    Edit,
    Trash2,
    Facebook,
    FolderPlus,
    FilePlus,
    FileDown,
    FolderDown,
    RefreshCw,
  },
  props: {
    isLoading: { type: Boolean, default: false },
    contactsStatusText: { type: String, default: "" },
    contactsStatusClass: { type: String, default: "" },
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
};
</script>
