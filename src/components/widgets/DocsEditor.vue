<script>
import { ChevronDown, ChevronRight } from "lucide-vue-next";

export default {
  name: "DocsEditor",

  components: {
    ChevronDown,
    ChevronRight,
  },

  emits: ["update:modelValue"],

  props: {
    modelValue: {
      type: Object,
      default: () => ({
        description: "",
        fileSource: "",
        fileUrl: "",
        files: [],
      }),
    },

    fileSourceOptions: {
      type: Array,
      default: () => [
        { value: "local", label: "Upload Local" },
        { value: "url", label: "From URL" },
        { value: "drive", label: "Google Drive" },
      ],
    },

    defaultOpen: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      showDocs: this.defaultOpen,
      docDropdownOpen: false,
      localDocs: this.createLocalDocs(this.modelValue),
    };
  },

  watch: {
    modelValue: {
      deep: true,
      handler(val) {
        this.localDocs = this.createLocalDocs(val);
      },
    },
    localDocs: {
      deep: true,
      handler(val) {
        this.$emit("update:modelValue", val);
      },
    },
  },

  methods: {
    createLocalDocs(value) {
      const safeValue = value || {};

      return {
        description: safeValue.description || "",
        fileSource: safeValue.fileSource || "",
        fileUrl: safeValue.fileUrl || "",
        files: Array.isArray(safeValue.files) ? [...safeValue.files] : [],
      };
    },

    isValidUrl(url) {
      if (!url) return true;
      const pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
          "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
          "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
          "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
          "(\\#[-a-z\\d_]*)?$",
        "i",
      ); // fragment locator
      return !!pattern.test(url);
    },

    isAllowedDocFile(file) {
      const name = String(file?.name || "").toLowerCase();
      const type = String(file?.type || "").toLowerCase();

      return (
        name.endsWith(".pdf") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx") ||
        name.endsWith(".xls") ||
        name.endsWith(".xlsx") ||
        type === "application/pdf" ||
        type === "application/msword" ||
        type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        type === "application/vnd.ms-excel" ||
        type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
    },

    getDocKind(file) {
      if (!file) return "file";

      // Prioritaskan cek pathfile karena biasanya mengandung extension asli
      const name = String(
        file?.pathfile || file?.name || file?.descdocs || file || "",
      ).toLowerCase();

      if (name.endsWith(".pdf")) return "pdf";
      if (name.endsWith(".doc") || name.endsWith(".docx")) return "doc";
      if (name.endsWith(".xls") || name.endsWith(".xlsx")) return "sheet";
      if (
        name.endsWith(".png") ||
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".webp")
      )
        return "image";
      return "file";
    },

    getDocLabel(file) {
      if (typeof file === "string") {
        return file.split("/").pop() || file;
      }

      if (file?.name || file?.descdocs) {
        return file.name || file.descdocs;
      }

      return "Dokumen";
    },

    formatFileSize(file) {
      const size = Number(file?.size || 0);

      if (!size) {
        return "";
      }

      const units = ["B", "KB", "MB", "GB"];
      let value = size;
      let unitIndex = 0;

      while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
      }

      return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
    },

    getDocPreviewUrl(file) {
      if (!file) {
        return "";
      }

      if (typeof file === "string") {
        return file;
      }

      if (file.url) {
        return file.url;
      }

      if (file.src) {
        return file.src;
      }

      if (file instanceof File) {
        if (!file._preview) {
          file._preview = URL.createObjectURL(file);
        }

        return file._preview;
      }

      if (file?.pathfile) {
        return file.pathfile;
      }

      return "";
    },

    openDocFile(file) {
      const previewUrl = this.getDocPreviewUrl(file);

      if (!previewUrl) {
        return;
      }

      window.open(previewUrl, "_blank", "noopener,noreferrer");
    },

    cleanupDocFile(file) {
      if (file && typeof file === "object" && file._preview) {
        URL.revokeObjectURL(file._preview);
        delete file._preview;
      }
    },

    handleDocFileChange(e) {
      const files = Array.from(e.target.files);
      const validFiles = [];

      files.forEach((file) => {
        if (!this.isAllowedDocFile(file)) {
          alert(
            `File ${file.name} tidak didukung. Gunakan PDF, DOC, DOCX, XLS, atau XLSX.`,
          );
          return;
        }

        validFiles.push(file);
      });

      this.localDocs.files = [...this.localDocs.files, ...validFiles];
      this.localDocs.fileSource = "local";
      this.docDropdownOpen = false;

      this.$nextTick(() => {
        e.target.value = "";
      });
    },

    removeDocFile(index) {
      this.cleanupDocFile(this.localDocs.files[index]);
      this.localDocs.files.splice(index, 1);
    },

    selectSource(val) {
      this.localDocs.fileSource = val;
      this.docDropdownOpen = false;
    },
  },

  computed: {
    currentIcon() {
      return this.showDocs ? ChevronDown : ChevronRight;
    },

    docAccept() {
      return ".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    },

    selectedSourceLabel() {
      if (!this.localDocs.fileSource) return "Select File Source";
      const option = this.fileSourceOptions.find(
        (opt) => opt.value === this.localDocs.fileSource,
      );
      return option ? option.label : "Select File Source";
    },
  },

  beforeUnmount() {
    (this.localDocs.files || []).forEach((file) => {
      this.cleanupDocFile(file);
    });
  },
};
</script>

<template>
  <div class="mb-5">
    <!-- HEADER -->
    <button
      type="button"
      @click="showDocs = !showDocs"
      class="flex items-center gap-2 w-full text-left mb-3"
    >
      <component :is="currentIcon" :size="16" class="text-sub-text" />

      <span
        class="text-sm font-semibold text-main-text flex items-center gap-2"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        Docs
      </span>
    </button>

    <!-- CONTENT -->
    <div
      v-if="showDocs"
      class="border border-outline rounded-lg overflow-hidden"
    >
      <!-- Description -->
      <div class="px-4 pt-4 pb-2">
        <label class="block text-sm font-medium text-main-text mb-2">
          Desc of Docs
        </label>
      </div>

      <!-- Toolbar -->
      <div
        class="flex items-center gap-1 px-3 py-2 border-t border-b border-outline bg-light-base flex-wrap mx-4"
      >
        <button class="p-1 hover:bg-white rounded text-xs">↩</button>
        <button class="p-1 hover:bg-white rounded text-xs">↪</button>

        <span class="text-outline mx-1">|</span>

        <select class="text-xs bg-transparent focus:outline-none">
          <option>Format</option>
          <option>Heading 1</option>
          <option>Paragraph</option>
        </select>

        <span class="text-outline mx-1">|</span>

        <button class="p-1 font-bold text-xs">B</button>
        <button class="p-1 italic text-xs">I</button>
        <button class="p-1 underline text-xs">U</button>
      </div>

      <!-- TEXTAREA -->
      <textarea
        v-model="localDocs.description"
        rows="5"
        class="w-full px-4 py-3 text-sm text-sub-text focus:outline-none resize-none"
        placeholder="Deskripsi dokumen..."
      ></textarea>

      <!-- FILE SECTION -->
      <div class="px-4 pb-4 border-t border-outline pt-4">
        <label class="block text-sm font-medium text-main-text mb-2">
          Documents
        </label>

        <!-- Dropdown -->
        <div class="relative">
          <button
            type="button"
            @click="docDropdownOpen = !docDropdownOpen"
            class="w-full flex items-center justify-between px-3 py-2 border border-outline rounded-lg text-sm bg-white"
          >
            <span
              :class="localDocs.fileSource ? 'text-main-text' : 'text-gray-400'"
            >
              {{ selectedSourceLabel }}
            </span>

            <svg
              class="w-4 h-4 text-sub-text transition-transform"
              :class="docDropdownOpen ? 'rotate-180' : ''"
              fill="none"
              stroke="currentColor"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <ul
            v-if="docDropdownOpen"
            class="absolute bottom-full left-0 right-0 mb-1 bg-white border border-outline rounded-lg shadow-lg z-50"
          >
            <li
              v-for="opt in fileSourceOptions"
              :key="opt.value"
              @click="selectSource(opt.value)"
              class="px-3 py-2 text-sm cursor-pointer hover:bg-light-base"
            >
              {{ opt.label }}
            </li>
          </ul>
        </div>

        <!-- Upload -->
        <div v-if="localDocs.fileSource === 'local'" class="mt-3">
          <label
            class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-outline rounded-lg cursor-pointer hover:bg-light-base"
          >
            <span class="text-xs"
              >Klik untuk pilih file PDF, DOC, atau Excel</span
            >
            <input
              type="file"
              multiple
              :accept="docAccept"
              class="hidden"
              @change="handleDocFileChange"
            />
          </label>
        </div>

        <!-- URL / Drive Input -->
        <div
          v-if="
            localDocs.fileSource === 'url' || localDocs.fileSource === 'drive'
          "
          class="mt-3"
        >
          <input
            v-model="localDocs.fileUrl"
            type="text"
            placeholder="Masukkan URL atau Link Google Drive..."
            class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 transition-all"
            :class="[
              isValidUrl(localDocs.fileUrl) && localDocs.fileUrl
                ? 'border-green-500 focus:ring-green-200'
                : localDocs.fileUrl
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-outline focus:ring-sub-text',
            ]"
          />
          <p
            v-if="localDocs.fileUrl && !isValidUrl(localDocs.fileUrl)"
            class="text-[10px] text-red-500 mt-1 ml-1"
          >
            Format URL tidak valid (Gunakan http:// atau https://)
          </p>
        </div>

        <ul v-if="localDocs.files.length" class="mt-2 space-y-1">
          <li
            v-for="(file, i) in localDocs.files"
            :key="i"
            class="flex items-center justify-between gap-3 text-xs px-3 py-2 bg-light-base rounded-lg"
          >
            <div class="flex min-w-0 items-center gap-2">
              <span
                class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white border border-outline text-[10px] font-semibold text-main-text uppercase"
              >
                {{ getDocKind(file) }}
              </span>

              <div class="min-w-0">
                <p class="truncate text-main-text">{{ getDocLabel(file) }}</p>
                <p class="text-[10px] text-sub-text">
                  {{ formatFileSize(file) }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button
                type="button"
                class="text-xs text-sub-text hover:text-main-text"
                @click="openDocFile(file)"
              >
                Open
              </button>
              <button
                type="button"
                class="text-xs text-sub-text hover:text-red-600"
                @click="removeDocFile(i)"
              >
                ✕
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
