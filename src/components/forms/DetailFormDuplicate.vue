<script>
import {
  X,
  ChevronDown,
  ChevronRight,
  Plus,
  MapPin,
  Camera,
  Mic,
} from "lucide-vue-next";

export default {
  name: "DetailFormDuplicate",
  components: {
    X,
    ChevronDown,
    ChevronRight,
    Plus,
    MapPin,
    Camera,
    Mic,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "Add Contact / Details",
    },
    saveButtonText: {
      type: String,
      default: "Save",
    },
    isSaving: {
      type: Boolean,
      default: false,
    },
    entityType: {
      type: String,
      default: "contact",
    },
    contact: {
      type: Object,
      default: () => ({}),
    },
    // NEW: Dynamic options props
    statusOptions: {
      type: Array,
      default: () => [
        { value: "", label: "Select Data" },
        { value: "todo", label: "To Do" },
        { value: "in_progress", label: "In Progress" },
        { value: "done", label: "Done" },
      ],
    },
    assigneeOptions: {
      type: Array,
      default: () => [
        { value: "", label: "Select Data" },
        { value: "thomas", label: "Thomas Anree" },
        { value: "abdul", label: "Abdul" },
      ],
    },
    priorityOptions: {
      type: Array,
      default: () => [
        { value: "", label: "Select Data" },
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
      ],
    },
  },
  emits: ["close", "submit", "back"],
  data() {
    return {
      showNotes: true,
      showTasks: true,
      showDocs: true,
      noteContent: "",
      taskName: "",
      taskContent: "",
      taskStatus: "",
      taskAssignee: "",
      taskDueDate: "",
      taskTime: "",
      taskPriority: "",
      taskAssociatedContact: "",
      docDescription: "",
      docFileSource: "",
      docDropdownOpen: false,
      selectedDocFiles: [],
      fileSourceOptions: [
        { value: "", label: "Select File Source" },
        { value: "local", label: "Local File" },
        { value: "google_drive", label: "Google Drive" },
        { value: "dropbox", label: "Dropbox" },
      ],
    };
  },
  methods: {
    handleDocFileChange(e) {
      this.selectedDocFiles = Array.from(e.target.files);
    },
    removeDocFile(index) {
      this.selectedDocFiles.splice(index, 1);
    },
    handleClose() {
      this.$emit("close");
    },
    handleBack() {
      this.$emit("back");
    },
    handleSave() {
      if (this.isSaving) {
        return;
      }
      this.$emit("submit", {
        entityType: this.entityType,
        note: this.noteContent,
        task: {
          name: this.taskName,
          content: this.taskContent,
          status: this.taskStatus,
          assignee: this.taskAssignee,
          dueDate: this.taskDueDate,
          time: this.taskTime,
          priority: this.taskPriority,
          associatedContact: this.taskAssociatedContact,
        },
        docs: {
          description: this.docDescription,
          fileSource: this.docFileSource,
          files: this.selectedDocFiles,
        },
      });
      this.handleReset();
    },
    handleReset() {
      this.noteContent = "";
      this.taskName = "";
      this.taskContent = "";
      this.taskStatus = "";
      this.taskAssignee = "";
      this.taskDueDate = "";
      this.taskTime = "";
      this.taskPriority = "";
      this.taskAssociatedContact = "";
      this.docDescription = "";
      this.docFileSource = "";
      this.selectedDocFiles = [];
    },
  },
};
</script>

<template>
  <!-- Overlay -->
  <transition name="overlay">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-sub-text/80 z-55 transition-all duration-300"
      @click="handleClose"
    ></div>
  </transition>

  <!-- Slide Panel -->
  <transition name="slide">
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-screen w-full max-w-2xl bg-white shadow-2xl z-60 flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
      >
        <h2 class="text-xl font-bold text-main-text">{{ title }}</h2>
        <button
          @click="handleClose"
          class="p-2 hover:bg-light-base rounded-lg transition-colors"
        >
          <X :size="20" class="text-sub-text" />
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto min-h-0">
        <div class="p-6 pb-10 space-y-6">
          <!-- NOTES SECTION -->
          <div>
            <button
              type="button"
              @click="showNotes = !showNotes"
              class="flex items-center gap-2 w-full text-left mb-3"
            >
              <component
                :is="showNotes ? ChevronDown : ChevronRight"
                :size="16"
                class="text-sub-text"
              />
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
                  <path
                    d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                  />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Notes
              </span>
            </button>

            <div
              v-if="showNotes"
              class="border border-outline rounded-lg overflow-hidden"
            >
              <!-- Toolbar -->
              <div
                class="flex items-center gap-1 px-3 py-2 border-b border-outline bg-light-base flex-wrap"
              >
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-sub-text text-xs"
                >
                  ↩
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-sub-text text-xs"
                >
                  ↪
                </button>
                <span class="text-outline mx-1">|</span>
                <select
                  class="text-xs border-none bg-transparent text-sub-text focus:outline-none"
                >
                  <option>Format</option>
                  <option>Heading 1</option>
                  <option>Heading 2</option>
                  <option>Paragraph</option>
                </select>
                <span class="text-outline mx-1">|</span>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded font-bold text-xs text-sub-text"
                >
                  B
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded italic text-xs text-sub-text"
                >
                  I
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded underline text-xs text-sub-text"
                >
                  U
                </button>
                <span class="text-outline mx-1">|</span>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  🔗
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ⚓
                </button>
                <span class="text-outline mx-1">|</span>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ≡
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ≡
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ≡
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ≡
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ☰
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ☰
                </button>
              </div>
              <!-- Editor area -->
              <textarea
                v-model="noteContent"
                rows="5"
                class="w-full px-4 py-3 text-sm text-sub-text focus:outline-none resize-none"
                placeholder="Tulis catatan..."
              ></textarea>
              <!-- Bottom actions -->
              <div
                class="flex items-center gap-4 px-4 py-2 border-t border-outline"
              >
                <button
                  type="button"
                  class="flex items-center gap-1.5 text-xs text-sub-text hover:text-main-text"
                >
                  <MapPin :size="14" /> Add GPS Location
                </button>
                <button
                  type="button"
                  class="flex items-center gap-1.5 text-xs text-sub-text hover:text-main-text"
                >
                  <Camera :size="14" /> Add Photo
                </button>
                <button
                  type="button"
                  class="flex items-center gap-1.5 text-xs text-sub-text hover:text-main-text"
                >
                  <Mic :size="14" /> Start Recording
                </button>
              </div>
            </div>
          </div>

          <!-- TASKS SECTION -->
          <div>
            <button
              type="button"
              @click="showTasks = !showTasks"
              class="flex items-center gap-2 w-full text-left mb-3"
            >
              <component
                :is="showTasks ? ChevronDown : ChevronRight"
                :size="16"
                class="text-sub-text"
              />
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
                  <polyline points="9 11 12 14 22 4" />
                  <path
                    d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                  />
                </svg>
                Tasks
              </span>
            </button>

            <div
              v-if="showTasks"
              class="border border-outline rounded-lg overflow-hidden space-y-0"
            >
              <!-- Task Name -->
              <div class="px-4 pt-4 pb-2">
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Name of Task</label
                >
                <input
                  v-model="taskName"
                  type="text"
                  placeholder="Task name..."
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                />
              </div>

              <!-- Task Rich Text -->
              <div class="px-4 pb-4">
                <!-- Toolbar -->
                <div
                  class="flex items-center gap-1 px-3 py-2 border border-outline rounded-t-lg bg-light-base flex-wrap"
                >
                  <button
                    type="button"
                    class="p-1 hover:bg-white rounded text-sub-text text-xs"
                  >
                    ↩
                  </button>
                  <button
                    type="button"
                    class="p-1 hover:bg-white rounded text-sub-text text-xs"
                  >
                    ↪
                  </button>
                  <span class="text-outline mx-1">|</span>
                  <select
                    class="text-xs border-none bg-transparent text-sub-text focus:outline-none"
                  >
                    <option>Format</option>
                    <option>Heading 1</option>
                    <option>Paragraph</option>
                  </select>
                  <span class="text-outline mx-1">|</span>
                  <button
                    type="button"
                    class="p-1 hover:bg-white rounded font-bold text-xs text-sub-text"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    class="p-1 hover:bg-white rounded italic text-xs text-sub-text"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    class="p-1 hover:bg-white rounded underline text-xs text-sub-text"
                  >
                    U
                  </button>
                  <span class="text-outline mx-1">|</span>
                  <button
                    type="button"
                    class="p-1 hover:bg-white rounded text-xs text-sub-text"
                  >
                    🔗
                  </button>
                  <button
                    type="button"
                    class="p-1 hover:bg-white rounded text-xs text-sub-text"
                  >
                    ⚓
                  </button>
                  <span class="text-outline mx-1">|</span>
                  <button
                    type="button"
                    class="p-1 hover:bg-white rounded text-xs text-sub-text"
                  >
                    ≡
                  </button>
                  <button
                    type="button"
                    class="p-1 hover:bg-white rounded text-xs text-sub-text"
                  >
                    ≡
                  </button>
                  <button
                    type="button"
                    class="p-1 hover:bg-white rounded text-xs text-sub-text"
                  >
                    ≡
                  </button>
                  <button
                    type="button"
                    class="p-1 hover:bg-white rounded text-xs text-sub-text"
                  >
                    ≡
                  </button>
                  <button
                    type="button"
                    class="p-1 hover:bg-white rounded text-xs text-sub-text"
                  >
                    ☰
                  </button>
                  <button
                    type="button"
                    class="p-1 hover:bg-white rounded text-xs text-sub-text"
                  >
                    ☰
                  </button>
                </div>
                <textarea
                  v-model="taskContent"
                  rows="4"
                  class="w-full px-3 py-3 text-sm text-sub-text border border-outline border-t-0 rounded-b-lg focus:outline-none resize-none"
                  placeholder="Deskripsi task..."
                ></textarea>
              </div>

              <!-- Status -->
              <div class="grid grid-cols-1 gap-4 px-4 pb-4">
                <div>
                  <label class="block text-sm font-medium text-main-text mb-2"
                    >Status</label
                  >
                  <select
                    v-model="taskStatus"
                    class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm bg-white"
                  >
                    <option
                      v-for="opt in statusOptions"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Due Date & Time -->
              <div class="grid grid-cols-2 gap-4 px-4 pb-4">
                <div>
                  <label class="block text-sm font-medium text-main-text mb-2"
                    >Due Date</label
                  >
                  <input
                    v-model="taskDueDate"
                    type="date"
                    class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-main-text mb-2"
                    >Time</label
                  >
                  <div class="relative">
                    <input
                      v-model="taskTime"
                      type="time"
                      class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
                    />
                  </div>
                </div>
              </div>

              <!-- Priority -->
              <div class="px-4 pb-4">
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Priority</label
                >
                <select
                  v-model="taskPriority"
                  class="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm bg-white"
                >
                  <option
                    v-for="opt in priorityOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- DOCS SECTION -->
          <div>
            <button
              type="button"
              @click="showDocs = !showDocs"
              class="flex items-center gap-2 w-full text-left mb-3"
            >
              <component
                :is="showDocs ? ChevronDown : ChevronRight"
                :size="16"
                class="text-sub-text"
              />
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
                  <path
                    d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                  />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Docs
              </span>
            </button>

            <div
              v-if="showDocs"
              class="border border-outline rounded-lg overflow-hidden"
            >
              <!-- Desc of Docs label -->
              <div class="px-4 pt-4 pb-2">
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Desc of Docs</label
                >
              </div>
              <!-- Toolbar -->
              <div
                class="flex items-center gap-1 px-3 py-2 border-t border-b border-outline bg-light-base flex-wrap mx-4"
              >
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-sub-text text-xs"
                >
                  ↩
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-sub-text text-xs"
                >
                  ↪
                </button>
                <span class="text-outline mx-1">|</span>
                <select
                  class="text-xs border-none bg-transparent text-sub-text focus:outline-none"
                >
                  <option>Format</option>
                  <option>Heading 1</option>
                  <option>Paragraph</option>
                </select>
                <span class="text-outline mx-1">|</span>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded font-bold text-xs text-sub-text"
                >
                  B
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded italic text-xs text-sub-text"
                >
                  I
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded underline text-xs text-sub-text"
                >
                  U
                </button>
                <span class="text-outline mx-1">|</span>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  🔗
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ⚓
                </button>
                <span class="text-outline mx-1">|</span>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ≡
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ≡
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ≡
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ≡
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ☰
                </button>
                <button
                  type="button"
                  class="p-1 hover:bg-white rounded text-xs text-sub-text"
                >
                  ☰
                </button>
              </div>
              <textarea
                v-model="docDescription"
                rows="5"
                class="w-full px-4 py-3 text-sm text-sub-text focus:outline-none resize-none"
                placeholder="Deskripsi dokumen..."
              ></textarea>

              <!-- Documents -->
              <div class="px-4 pb-4 border-t border-outline pt-4">
                <label class="block text-sm font-medium text-main-text mb-2"
                  >Documents</label
                >
                <!-- Custom dropup -->
                <div class="relative" ref="docDropdownRef">
                  <button
                    type="button"
                    @click="docDropdownOpen = !docDropdownOpen"
                    class="w-full flex items-center justify-between px-3 py-2 border border-outline rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-sub-text"
                  >
                    <span
                      :class="
                        docFileSource ? 'text-main-text' : 'text-gray-400'
                      "
                    >
                      Select File Source
                    </span>
                    <svg
                      class="w-4 h-4 text-sub-text transition-transform"
                      :class="docDropdownOpen ? 'rotate-180' : ''"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <!-- Dropdown list — terbuka ke ATAS -->
                  <ul
                    v-if="docDropdownOpen"
                    class="absolute bottom-full left-0 right-0 mb-1 bg-white border border-outline rounded-lg shadow-lg z-50 overflow-hidden"
                  >
                    <li
                      v-for="opt in fileSourceOptions"
                      :key="opt.value"
                      @click="
                        docFileSource = opt.value;
                        docDropdownOpen = false;
                      "
                      class="px-3 py-2 text-sm cursor-pointer hover:bg-light-base"
                      :class="
                        docFileSource === opt.value
                          ? 'text-sub-text font-medium bg-light-base'
                          : 'text-main-text'
                      "
                    >
                      {{ opt.label }}
                    </li>
                  </ul>
                </div>

                <!-- Local file picker -->
                <div v-if="docFileSource === 'local'" class="mt-3">
                  <label
                    class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-outline rounded-lg cursor-pointer hover:bg-light-base transition-colors"
                  >
                    <div class="flex flex-col items-center gap-1 text-sub-text">
                      <svg
                        class="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      <span class="text-xs font-medium"
                        >Klik untuk pilih file</span
                      >
                      <span class="text-xs text-gray-400"
                        >PDF, DOC, XLS, JPG, PNG</span
                      >
                    </div>
                    <input
                      type="file"
                      multiple
                      class="hidden"
                      @change="handleDocFileChange"
                    />
                  </label>
                  <ul v-if="selectedDocFiles.length" class="mt-2 space-y-1">
                    <li
                      v-for="(file, i) in selectedDocFiles"
                      :key="i"
                      class="flex items-center justify-between text-xs px-3 py-1.5 bg-light-base rounded-lg"
                    >
                      <span class="truncate text-main-text">{{
                        file.name
                      }}</span>
                      <button
                        type="button"
                        @click="removeDocFile(i)"
                        class="ml-2 text-sub-text hover:text-red-500 shrink-0"
                      >
                        ✕
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="bg-white flex items-center justify-between px-6 py-4 border-t border-outline shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
      >
        <button
          type="button"
          @click="handleReset"
          class="text-sm text-red font-medium hover:underline"
        >
          Reset
        </button>
        <div class="flex gap-3">
          <button
            type="button"
            @click="handleBack"
            class="px-6 py-2 border border-outline rounded-lg text-sub-text hover:bg-light-base transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleSave"
            :disabled="isSaving"
            class="flex items-center gap-2 px-5 py-2 bg-dark-base text-white rounded-lg hover:bg-dark-hover transition-colors text-sm font-medium"
            :class="{ 'opacity-60 cursor-not-allowed': isSaving }"
          >
            {{ isSaving ? "Saving..." : saveButtonText }}
            <ChevronDown :size="16" />
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* Overlay */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Slide from right — identik dengan AddContactForm */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
