<template>
  <!-- Overlay form utama -->
  <transition name="overlay">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-sub-text/80 z-[55] transition-all duration-300"
      @click="handleClose"
    ></div>
  </transition>

  <!-- Slide Panel Utama -->
  <transition name="slide">
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-screen w-full sm:max-w-2xl bg-white shadow-2xl z-[60] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
      >
        <div class="flex items-center gap-2">
          <ClipboardList :size="20" class="text-dark-base" />
          <h2 class="text-xl font-bold text-dark-base">
            {{ isEditMode ? "Edit Task" : "Create Task" }}
          </h2>
        </div>
        <button
          @click="handleClose"
          class="p-2 hover:bg-light-base rounded-lg transition-colors"
        >
          <X :size="20" class="text-sub-text" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-outline px-6 bg-white">
        <button
          type="button"
          @click="activeTab = 'master'"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 transition',
            activeTab === 'master'
              ? 'border-dark-base text-dark-base'
              : 'border-transparent text-sub-text hover:text-dark-base',
          ]"
        >
          Master
        </button>
        <button
          v-if="hasTaskId"
          type="button"
          @click="activeTab = 'notes'"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 transition',
            activeTab === 'notes'
              ? 'border-dark-base text-dark-base'
              : 'border-transparent text-sub-text hover:text-dark-base',
          ]"
        >
          Notes
        </button>
      </div>

      <!-- Konten Scrollable -->
      <div class="flex-1 overflow-y-auto min-h-0 form-content-mobile">
        <!-- Tab Master: Form Task -->
        <form
          v-if="activeTab === 'master'"
          @submit.prevent="handleSubmit"
          class="p-4 sm:p-6 space-y-5"
        >
          <!-- Name of Task -->
          <div>
            <label class="block text-sm font-medium text-dark-base mb-2"
              >Name of Task <span class="text-red-600">*</span></label
            >
            <input
              v-model="formData.task_name"
              type="text"
              placeholder="Task name..."
              class="w-full px-4 py-3 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm bg-white"
            />
          </div>

          <!-- Project Association & Assignee To -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <!-- Project Association with Search -->
            <div v-if="!hideProjectField" class="relative" ref="projectDropdownRef">
              <label class="block text-sm font-medium text-dark-base mb-2">Project Association</label>
              <div
                @click="toggleProjectDropdown"
                class="w-full px-4 py-3 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm bg-white cursor-pointer flex items-center justify-between text-dark-base"
              >
                <span>{{ selectedProjectLabel }}</span>
                <ChevronDown :size="18" class="text-sub-text" />
              </div>

              <!-- Dropdown Menu -->
              <div
                v-if="isProjectDropdownOpen"
                class="absolute z-50 w-full mt-1 bg-white border border-outline rounded-lg shadow-xl"
              >
                <div class="p-2 border-b border-outline">
                  <div class="relative">
                    <Search
                      :size="14"
                      class="absolute left-2.5 top-1/2 -translate-y-1/2 text-sub-text"
                    />
                    <input
                      v-model="projectSearch"
                      type="text"
                      placeholder="Search project..."
                      class="w-full pl-8 pr-3 py-1.5 text-xs border border-outline rounded focus:outline-none focus:border-sub-text"
                      @click.stop
                    />
                  </div>
                </div>
                <div class="max-h-48 overflow-y-auto">
                  <div
                    v-for="opt in filteredProjectOptions"
                    :key="opt.value"
                    @click="selectProject(opt)"
                    class="px-3 py-2 text-sm hover:bg-light-base cursor-pointer"
                    :class="{ 'bg-light-base font-medium': formData.project_id === opt.value }"
                  >
                    {{ opt.label }}
                  </div>
                  <div
                    v-if="filteredProjectOptions.length === 0"
                    class="px-3 py-4 text-xs text-center text-sub-text"
                  >
                    No projects found
                  </div>
                </div>
              </div>
            </div>

            <!-- Assignee To -->
            <div :class="{ 'sm:col-span-2': hideProjectField }">
              <label class="block text-sm font-medium text-dark-base mb-2">Assignee To</label>
              <div class="relative">
                <select
                  v-model="formData.assignee"
                  class="w-full px-4 py-3 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm bg-white appearance-none cursor-pointer text-dark-base"
                >
                  <option
                    v-for="opt in assigneeOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
                <ChevronDown
                  :size="18"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text pointer-events-none"
                />
              </div>
            </div>
          </div>

          <!-- Task Description -->
          <div
            class="border border-outline rounded-lg overflow-hidden shadow-sm"
          >
            <div
              class="flex items-center gap-1.5 px-4 py-2 border-b border-outline bg-light-base/50 flex-wrap"
            >
              <button
                type="button"
                class="p-1.5 hover:bg-white rounded transition-colors text-sub-text"
              >
                <RotateCcw :size="16" />
              </button>
              <button
                type="button"
                class="p-1.5 hover:bg-white rounded transition-colors text-sub-text"
              >
                <RotateCw :size="16" />
              </button>
              <div class="w-px h-4 bg-outline mx-1"></div>
              <div class="relative flex items-center">
                <select
                  class="text-xs font-medium border-none bg-transparent text-sub-text focus:outline-none py-1 pl-1 pr-6 rounded cursor-pointer appearance-none"
                >
                  <option>Format</option>
                </select>
                <ChevronDown
                  :size="12"
                  class="absolute right-1 text-sub-text pointer-events-none"
                />
              </div>
              <div class="w-px h-4 bg-outline mx-1"></div>
              <button
                type="button"
                class="p-1.5 hover:bg-white rounded transition-colors text-dark-base font-bold"
              >
                <Bold :size="16" />
              </button>
              <button
                type="button"
                class="p-1.5 hover:bg-white rounded transition-colors text-sub-text"
              >
                <Italic :size="16" />
              </button>
              <button
                type="button"
                class="p-1.5 hover:bg-white rounded transition-colors text-sub-text"
              >
                <Underline :size="16" />
              </button>
              <div class="w-px h-4 bg-outline mx-1"></div>
              <button
                type="button"
                class="p-1.5 hover:bg-white rounded transition-colors text-sub-text"
              >
                <Link2 :size="16" />
              </button>
              <button
                type="button"
                class="p-1.5 hover:bg-white rounded transition-colors text-sub-text"
              >
                <Anchor :size="16" />
              </button>
              <div class="w-px h-4 bg-outline mx-1"></div>
              <button
                type="button"
                class="p-1.5 hover:bg-white rounded transition-colors text-sub-text"
              >
                <AlignLeft :size="16" />
              </button>
              <button
                type="button"
                class="p-1.5 hover:bg-white rounded transition-colors text-sub-text"
              >
                <AlignCenter :size="16" />
              </button>
              <button
                type="button"
                class="p-1.5 hover:bg-white rounded transition-colors text-sub-text"
              >
                <AlignRight :size="16" />
              </button>
              <button
                type="button"
                class="p-1.5 hover:bg-white rounded transition-colors text-sub-text"
              >
                <AlignJustify :size="16" />
              </button>
              <button
                type="button"
                class="p-1.5 hover:bg-white rounded transition-colors text-sub-text"
              >
                <List :size="16" />
              </button>
              <button
                type="button"
                class="p-1.5 hover:bg-white rounded transition-colors text-sub-text"
              >
                <ListOrdered :size="16" />
              </button>
            </div>
            <textarea
              v-model="formData.description"
              rows="6"
              class="w-full px-4 py-4 text-sm text-sub-text focus:outline-none resize-none bg-white"
              placeholder="Task description..."
            ></textarea>
          </div>

          <!-- Status & Due Date -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-dark-base mb-2"
                >Status <span class="text-red-600">*</span></label
              >
              <div class="relative">
                <select
                  v-model="formData.status_id"
                  class="w-full rounded-lg border border-outline bg-white py-2.5 pl-4 pr-10 text-sm text-dark-base outline-none transition focus:border-sub-text appearance-none cursor-pointer"
                >
                  <option
                    v-for="opt in statusOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
                <ChevronDown
                  :size="18"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-dark-base mb-2"
                >Due Date <span class="text-red-600">*</span></label
              >
              <div class="relative">
                <input
                  v-model="formData.due_date"
                  type="date"
                  class="w-full px-4 py-2.5 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-dark-base bg-white"
                />
                <Calendar
                  :size="18"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text pointer-events-none"
                />
              </div>
            </div>
          </div>

          <!-- Priority & Progress -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-dark-base mb-2">Priority <span class="text-red-600">*</span></label>
              <div class="relative">
                <select
                  v-model="formData.priority"
                  class="w-full px-4 py-3 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm bg-white appearance-none cursor-pointer text-dark-base"
                >
                  <option
                    v-for="opt in priorityOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
                <ChevronDown
                  :size="18"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text pointer-events-none"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-dark-base mb-2">Progress (%) <span class="text-red-600">*</span></label>
              <input
                v-model="formData.progress"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                class="w-full px-4 py-3 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm bg-white"
              />
            </div>
          </div>
        </form>

        <!-- Tab Notes -->
        <div
          v-if="hasTaskId && activeTab === 'notes'"
          class="p-6 h-full flex flex-col"
        >
          <HistoryDetail
            :items="historyitems"
            @add-note="openNoteDrawer"
            @edit="handleHistoryEdit"
            @delete="handleHistoryDelete"
          />
        </div>
      </div>

      <!-- Footer Actions -->
      <div
        class="bg-white flex items-center justify-between p-4 sm:px-6 sm:py-4 border-t border-outline shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] footer-mobile"
      >
        <button
          @click="handleReset"
          class="text-sm text-red font-medium hover:underline px-2"
        >
          Reset
        </button>
        <div class="flex gap-3">
          <button
            @click="handleClose"
            class="px-6 py-2 border border-outline rounded-lg text-sub-text hover:bg-light-base transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            v-if="activeTab === 'master'"
            @click="handleSubmit"
            class="px-6 py-2 bg-dark-base text-white rounded-lg hover:bg-dark-hover transition-colors text-sm font-medium"
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- ======================= NOTES DRAWER DENGAN OVERLAY KHUSUS ======================= -->
  <transition name="overlay">
    <div
      v-if="isNoteDrawerOpen"
      class="fixed inset-0 bg-black/50 z-55"
      @click="isNoteDrawerOpen = false"
    ></div>
  </transition>

  <transition name="slide">
    <div
      v-if="isNoteDrawerOpen"
      class="fixed top-0 right-0 h-screen w-full max-w-2xl bg-white shadow-2xl z-60 flex flex-col"
      @click.stop
    >
      <div
        class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10"
      >
        <h2 class="text-xl font-bold text-dark-base">
          {{ editingItemIndex !== null ? "Edit Catatan" : "Tambah Catatan" }}
        </h2>
        <button
          @click="isNoteDrawerOpen = false"
          class="p-2 hover:bg-light-base rounded-lg transition-colors"
        >
          <X :size="20" class="text-sub-text" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <NotesSection v-model:note-data="tempNoteData" />
      </div>

      <div
        class="bg-white px-6 py-4 border-t border-outline flex justify-end gap-3"
      >
        <button
          @click="isNoteDrawerOpen = false"
          class="px-6 py-2 border border-outline rounded-lg text-sm font-medium hover:bg-light-base"
        >
          Cancel
        </button>
        <button
          @click="saveNoteFromDrawer"
          class="px-6 py-2 bg-dark-base text-white rounded-lg text-sm font-medium hover:bg-dark-hover"
        >
          Simpan
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";
import {
  X,
  ChevronDown,
  Calendar,
  Clock,
  ClipboardList,
  Bold,
  Italic,
  Underline,
  Link2,
  Anchor,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  RotateCcw,
  RotateCw,
  Plus,
  Search,
  Check,
} from "lucide-vue-next";
import NotesSection from "@/components/widgets/NotesEditor.vue";
import HistoryDetail from "@/components/widgets/historydetail.vue";
import { alertService } from "@/services/alertService";

export default {
  name: "CreateTaskForm",
  components: {
    X,
    ChevronDown,
    Calendar,
    Clock,
    ClipboardList,
    Bold,
    Italic,
    Underline,
    Link2,
    Anchor,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    RotateCcw,
    RotateCw,
    Plus,
    Search,
    Check,
    NotesSection,
    HistoryDetail,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    hideProjectField: {
      type: Boolean,
      default: false,
    },
    initialData: {
      type: Object,
      default: null,
    },
    task: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      activeTab: "master",
      isNoteDrawerOpen: false,
      isProjectDropdownOpen: false,
      projectSearch: "",
      editingItemIndex: null,
      historyitems: [],
      formData: {
        task_name: "",
        description: "",
        status_id: "",
        assignee: "",
        due_date: "",
        task_time: "",
        priority: "",
        progress: 0,
        project_id: null,
      },
      tempNoteData: {
        body: "",
        gps_address: null,
        latitude: null,
        longitude: null,
        photos: [],
        audioBlob: null,
      },
    };
  },
  computed: {
    ...mapGetters("users", ["usersignin"]),
    ...mapGetters("tasks", ["allProjects", "allStatuses", "allPriorities", "allAssignees", "currentTask"]),
    sourceData() {
      return this.initialData || this.task || null;
    },
    isEditMode() {
      return !!(this.sourceData && Object.keys(this.sourceData).length);
    },
    hasTaskId() {
      return !!(
        this.sourceData?.id ||
        this.sourceData?.task_id ||
        this.sourceData?.taskId ||
        this.sourceData?.task?.id
      );
    },
    statusOptions() {
      const statuses = this.allStatuses || [];
      return [
        { value: "", label: "Select Status" },
        ...statuses.map((s) => ({
          value: s.value || s.id || "",
          label: s.label || s.name || s.status_name || "Unknown",
        })),
      ];
    },
    priorityOptions() {
      const priorities = this.allPriorities || [];
      return [
        { value: "", label: "Select Priority" },
        ...priorities.map((p) => ({
          value: p.value || p.id || "",
          label: p.label || p.name || p.priority_name || "Unknown",
        })),
      ];
    },
    filteredProjectOptions() {
      const search = this.projectSearch.toLowerCase().trim();
      if (!search) return this.projectOptions;
      return this.projectOptions.filter(opt => 
        opt.label.toLowerCase().includes(search)
      );
    },
    selectedProjectLabel() {
      const selected = this.projectOptions.find(opt => opt.value === this.formData.project_id);
      return selected ? selected.label : "Select Project";
    },
    selectedStatusLabel() {
      const selected = this.statusOptions.find(opt => opt.value === this.formData.status_id);
      return selected ? selected.label : "Select Status";
    },
    assigneeOptions() {
      const users = this.allAssignees || [];
      return [
        { value: "", label: "Select User" },
        ...users.map((user) => ({
          value: user.value || user.id || user.user_id || "",
          label: user.label || user.name || user.username || "Unknown",
        })),
      ];
    },
    projectOptions() {
      const projects = this.allProjects || [];
      return [
        { value: "", label: "Select Project" },
        ...projects.map((p) => ({
          value: p.value || p.id || p.project_id || "",
          label: p.label || p.project_name || p.name || "Untitled Project",
        })),
      ];
    },
    currentUserName() {
      const signin = this.usersignin;
      return (
        signin?.name ||
        signin?.username ||
        signin?.user?.name ||
        signin?.user?.username ||
        ""
      );
    },
  },
  watch: {
    isOpen: {
      immediate: true,
      async handler(val) {
        if (val) {
          this.$store.dispatch("tasks/fetchProjects");
          this.$store.dispatch("tasks/fetchStatuses");
          this.$store.dispatch("tasks/fetchPriorities");
          this.$store.dispatch("tasks/fetchAssignedTo");
          this.$store.dispatch("users/getusersignin");

          if (this.sourceData) {
            const taskId = this.sourceData.id || this.sourceData.task_id || this.sourceData.taskId;
            if (taskId) {
              const fullTask = await this.$store.dispatch("tasks/fetchTaskById", taskId);
              if (fullTask) {
                this.setFormData(fullTask);
              } else {
                this.setFormData(this.sourceData);
              }
            } else {
              this.setFormData(this.sourceData);
            }
          } else {
            this.handleReset();
          }
          this.activeTab = "master";
        }
      },
    },
    initialData: {
      deep: true,
      handler(newData) {
        if (this.isOpen && newData) {
          this.setFormData(newData);
          this.activeTab = "master";
        }
      },
    },
    task: {
      deep: true,
      handler(newData) {
        if (this.isOpen && newData) {
          this.setFormData(newData);
          this.activeTab = "master";
        }
      },
    },
  },
  mounted() {
    this.$store.dispatch("tasks/fetchStatuses");
    this.$store.dispatch("tasks/fetchPriorities");
    this.$store.dispatch("tasks/fetchAssignedTo");
    this.$store.dispatch("tasks/fetchProjects");
    this.$store.dispatch("users/getusersignin");
    
    if (!this.formData.assignee && this.usersignin?.id) {
      this.formData.assignee = this.usersignin.id;
    }
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    pickFirst(...values) {
      for (const value of values) {
        if (value !== undefined && value !== null && value !== "") return value;
      }
      return "";
    },
    normalizeDateForInput(rawValue) {
      if (!rawValue) return "";

      if (typeof rawValue === "string") {
        const trimmed = rawValue.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

        const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
        if (match) return match[1];
      }

      const parsed = new Date(rawValue);
      if (Number.isNaN(parsed.getTime())) return "";
      return parsed.toISOString().slice(0, 10);
    },
    normalizeTimeForInput(rawValue) {
      if (!rawValue) return "";

      if (typeof rawValue === "string") {
        const trimmed = rawValue.trim();
        const hhmm = trimmed.match(/^(\d{2}:\d{2})/);
        if (hhmm) return hhmm[1];

        const fromDateTime = trimmed.match(/T(\d{2}:\d{2})/);
        if (fromDateTime) return fromDateTime[1];
      }

      const parsed = new Date(rawValue);
      if (Number.isNaN(parsed.getTime())) return "";
      return `${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`;
    },
    normalizeStatus(rawValue) {
      const normalized = String(rawValue || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");

      if (!normalized) return "";
      if (normalized === "process" || normalized === "progress") {
        return "in_progress";
      }
      return normalized;
    },
    getCurrentUserName() {
      return this.currentUserName;
    },
    setFormData(data) {
      if (!data) return;

      const taskData = data.task || {};
      const dueDateRaw = this.pickFirst(
        data.due_date,
        data.dueDate,
        data.date,
        data.deadline,
        taskData.due_date,
        taskData.dueDate,
        taskData.date,
        taskData.deadline,
      );
      const timeRaw = this.pickFirst(
        data.task_time,
        data.time,
        taskData.task_time,
        taskData.time,
        dueDateRaw,
      );

      this.formData = {
        task_name: this.pickFirst(
          data.task_name,
          data.title,
          data.name,
          taskData.task_name,
          taskData.title,
          taskData.name,
        ),
        description: this.pickFirst(
          data.description,
          data.content,
          taskData.description,
          taskData.content,
        ),
        status_id: this.pickFirst(
          data.status_id,
          data.id_status,
          data.status,
          taskData.status_id,
          taskData.id_status,
          taskData.status,
        ),
        assignee: this.pickFirst(
          data.assignee,
          data.assigned_id,
          data.owner,
          taskData.assignee,
          taskData.assigned_id,
          taskData.owner,
          this.usersignin?.id,
        ),
        due_date: this.normalizeDateForInput(dueDateRaw),
        task_time: this.normalizeTimeForInput(timeRaw),
        priority: this.pickFirst(
          data.priority,
          data.prioritytask,
          taskData.priority,
          taskData.prioritytask,
        ),
        progress: this.pickFirst(data.progress, taskData.progress, 0),
        project_id: this.pickFirst(data.project_id, taskData.project_id, null),
      };
      // Map history notes
      let rawNotes = data.notes || data.note;
      if (typeof rawNotes === "string" && rawNotes.startsWith("[")) {
        try {
          rawNotes = JSON.parse(rawNotes);
        } catch (e) {}
      }
      const items = [];
      if (Array.isArray(rawNotes)) {
        rawNotes.forEach((n) => {
          let location = { address: null, latitude: null, longitude: null };
          try {
            if (n.location) {
              location =
                typeof n.location === "string"
                  ? JSON.parse(n.location)
                  : n.location;
            }
          } catch (e) {}
          items.push({
            type: "note",
            id: n.id,
            timestamp: n.created_at || n.update_at,
            body: n.body || n.notes || n.description || "",
            gps_address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
            photos: n.photos || [],
          });
        });
      }
      this.historyitems = items.sort(
        (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0),
      );
    },
    handleReset() {
      this.formData = {
        task_name: "",
        description: "",
        status: "",
        assignee: this.usersignin?.id || "",
        due_date: "",
        task_time: "",
        priority: "",
        progress: 0,
        project_id: null,
      };
      this.historyitems = [];
      this.tempNoteData = {
        body: "",
        gps_address: null,
        latitude: null,
        longitude: null,
        photos: [],
        audioBlob: null,
      };
      this.editingItemIndex = null;
      this.activeTab = "master";
    },
    handleClose() {
      if (this.isNoteDrawerOpen) return;
      this.handleReset();
      this.$emit("close");
    },
    handleSubmit() {
      // Required fields validation
      if (!this.formData.task_name?.trim()) {
        alertService.toastError("Nama task wajib diisi");
        return;
      }
      if (!this.formData.due_date) {
        alertService.toastError("Due date wajib diisi");
        return;
      }
      if (!this.formData.priority) {
        alertService.toastError("Priority wajib diisi");
        return;
      }
      if (this.formData.progress === undefined || this.formData.progress === null || this.formData.progress === "") {
        alertService.toastError("Progress wajib diisi");
        return;
      }
      if (!this.formData.status_id) {
        alertService.toastError("Status wajib diisi");
        return;
      }

      // Add created_by if not already present
      const currentUserId = this.usersignin?.id || this.$store.getters["users/useridsignin"];
      const payload = {
        ...this.formData,
        created_by: this.formData.created_by || currentUserId,
      };

      this.$emit("submit", payload);
      this.handleReset();
      this.handleClose();
    },
    openNoteDrawer(editData = null, index = null) {
      if (editData) {
        this.tempNoteData = { ...editData };
        this.editingItemIndex = index;
      } else {
        this.tempNoteData = {
          body: "",
          gps_address: null,
          latitude: null,
          longitude: null,
          photos: [],
          audioBlob: null,
        };
        this.editingItemIndex = null;
      }
      this.isNoteDrawerOpen = true;
    },
    saveNoteFromDrawer() {
      if (!this.tempNoteData.body && this.tempNoteData.photos.length === 0) {
        alertService.toastWarn("Catatan masih kosong");
        return;
      }
      const item = {
        type: "note",
        timestamp: new Date().toISOString(),
        ...this.tempNoteData,
      };
      if (this.editingItemIndex !== null) {
        this.historyitems[this.editingItemIndex] = item;
      } else {
        this.historyitems.unshift(item);
      }
      this.isNoteDrawerOpen = false;
      alertService.toastSuccess("Catatan ditambahkan ke histori");
    },
    handleHistoryEdit({ item, index }) {
      this.openNoteDrawer(item, index);
    },
    handleHistoryDelete(index) {
      this.historyitems.splice(index, 1);
      alertService.toastInfo("Item dihapus dari histori");
    },
    handleEscKey(e) {
      if (e.key === "Escape") {
        if (this.isNoteDrawerOpen) this.isNoteDrawerOpen = false;
        if (this.isProjectDropdownOpen) this.isProjectDropdownOpen = false;
      }
    },
    handleClickOutside(e) {
      if (this.$refs.projectDropdownRef && !this.$refs.projectDropdownRef.contains(e.target)) {
        this.isProjectDropdownOpen = false;
      }
    },
    selectProject(opt) {
      this.formData.project_id = opt.value;
      this.isProjectDropdownOpen = false;
      this.projectSearch = "";
    },
  },
};
</script>

<style scoped>
/* Transition Animations */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* Remove Browser Autofill Blue Background */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
  -webkit-text-fill-color: #1c2434 !important;
  transition: background-color 5000s ease-in-out 0s;
}

.rounded-lg {
  border-radius: 0.5rem;
}

select {
  background-image: none !important;
}

input[type="date"]::-webkit-calendar-picker-indicator,
input[type="time"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* Mobile Responsive - Footer Sticky/Fixed Behavior */
@media (max-width: 768px) {
  /* Make form content scrollable with padding for footer */
  .form-content-mobile {
    padding-bottom: 110px; /* Reserve space for fixed footer */
  }

  /* Make footer fixed at bottom on mobile */
  .footer-mobile {
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    width: 100%;
    max-width: 100vw;
    z-index: 50;
    border-top: 1px solid;
    border-radius: 0;
  }
}

/* Desktop - Keep original behavior */
@media (min-width: 769px) {
  .form-content-mobile {
    padding-bottom: 0;
  }

  .footer-mobile {
    position: static;
    width: 100%;
    z-index: auto;
  }
}
</style>
