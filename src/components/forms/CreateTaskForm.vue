<template>
  <!-- Overlay form utama -->
  <transition name="overlay">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-sub-text/80 z-55 transition-all duration-300"
      @click="handleClose"
    ></div>
  </transition>

  <!-- Slide Panel Utama -->
  <transition name="slide">
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-screen w-full sm:max-w-2xl bg-white shadow-2xl z-60 flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-white border-b border-outline px-6 py-4 flex items-center justify-between z-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
      >
        <div class="flex items-center gap-2">
          <ClipboardList :size="20" class="text-main-text" />
          <h2 class="text-xl font-bold text-main-text">
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
              ? 'border-dark-base text-main-text'
              : 'border-transparent text-sub-text hover:text-main-text',
          ]"
        >
          Master
        </button>
        <button
          v-if="hasTaskId && !hideNotesTab"
          type="button"
          @click="activeTab = 'notes'"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 transition',
            activeTab === 'notes'
              ? 'border-dark-base text-main-text'
              : 'border-transparent text-sub-text hover:text-main-text',
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
            <label class="block text-sm font-medium text-main-text mb-2"
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
            <div
              v-if="!hideProjectField"
              class="relative"
              ref="projectDropdownRef"
            >
              <ProjectsAssociationForm
                ref="projectsAssociationForm"
                v-model="formData.project_id"
                :projects="allProjects"
                :initial-data="tempProjectObjects"
                limit="1"
                custom-message="Hanya diperbolehkan 1 project untuk task"
              />
            </div>

            <!-- Assignee To -->
            <div :class="{ 'sm:col-span-2': hideProjectField }">
              <label class="block text-sm font-medium text-main-text mb-2"
                >Assignee To</label
              >
              <div class="relative">
                <select
                  v-model="formData.assignee"
                  class="w-full px-4 py-3 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm bg-white appearance-none cursor-pointer text-main-text"
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
                class="p-1.5 hover:bg-white rounded transition-colors text-main-text font-bold"
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
              <label class="block text-sm font-medium text-main-text mb-2"
                >Status <span class="text-red-600">*</span></label
              >
              <div class="relative">
                <select
                  v-model="formData.status_id"
                  class="w-full rounded-lg border border-outline bg-white py-2.5 pl-4 pr-10 text-sm text-main-text outline-none transition focus:border-sub-text appearance-none cursor-pointer"
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
              <label class="block text-sm font-medium text-main-text mb-2"
                >Due Date <span class="text-red-600">*</span></label
              >
              <div class="relative">
                <input
                  v-model="formData.due_date"
                  type="date"
                  class="w-full px-4 py-2.5 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-main-text bg-white"
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
              <label class="block text-sm font-medium text-main-text mb-2"
                >Priority <span class="text-red-600">*</span></label
              >
              <div class="relative">
                <select
                  v-model="formData.priority"
                  class="w-full px-4 py-3 pr-10 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm bg-white appearance-none cursor-pointer text-main-text"
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
              <label class="block text-sm font-medium text-main-text mb-2"
                >Progress (%) <span class="text-red-600">*</span></label
              >
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
          v-if="hasTaskId && activeTab === 'notes' && !hideNotesTab"
          class="flex-1 overflow-y-auto p-6"
        >
          <HistoryDetail
            ref="historyDetail"
            :items="historyitems"
            @add-note="openNoteDrawer"
            @edit="handleHistoryEdit"
            @delete="handleHistoryDelete"
          />
        </div>
      </div>

      <!-- Footer Actions -->
      <div
        class="bg-white flex items-center justify-between p-4 sm:px-6 sm:py-4 border-t border-outline shadow-[0_-4px_6_rgba(0,0,0,0.05)] footer-mobile"
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
            class="px-6 py-2.5 border border-outline rounded-lg text-sub-text hover:bg-light-base transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            v-if="activeTab === 'master'"
            type="button"
            @click="handleSave"
            :disabled="isSubmitting"
            class="px-6 py-2.5 rounded-lg bg-dark-base text-sm font-semibold text-white shadow-sm transition hover:bg-dark-hover active:scale-95 disabled:opacity-50"
          >
            {{ isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save" }}
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
        <h2 class="text-xl font-bold text-main-text">
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
import { mapActions, mapGetters } from "vuex";
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
import ProjectsAssociationForm from "@/components/forms/assoc/projects.vue";
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
    ProjectsAssociationForm,
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
    fromPage: {
      type: String,
      default: "",
    },
    hideNotesTab: {
      type: Boolean,
      default: false,
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
      isSubmitting: false,
      savedTask: null,
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
        idnote: null,
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
    ...mapGetters("tasks", [
      "allProjects",
      "allStatuses",
      "allPriorities",
      "allAssignees",
      "currentTask",
    ]),
    ...mapGetters("history", ["history"]),
    sourceData() {
      return this.initialData || this.task || null;
    },
    isEditMode() {
      return !!this.taskId;
    },
    taskId() {
      const data = this.initialData || this.savedTask;
      if (!data) return null;
      if (typeof data === "number" || typeof data === "string") return data;

      return (
        data.id ||
        data.task_id ||
        data.taskId ||
        data.id_task ||
        data.id_tasks ||
        data.task?.id ||
        data.data?.id ||
        data.param?.id ||
        data.input?.id ||
        data.result?.[0]?.id ||
        data.result?.id ||
        data.task?.task_id ||
        data.data?.task_id ||
        data.input?.task_id ||
        data.param?.task_id ||
        null
      );
    },
    hasTaskId() {
      return !!this.taskId;
    },
    tempProjectObjects() {
      const deal = this.initialData?.deals?.[0] || this.initialData || {};
      const rawAssoc =
        this.initialData?.companyassoc ||
        this.initialData?.companiesassoc ||
        deal.companyassoc ||
        deal.companiesassoc;

      if (rawAssoc) {
        return this.normalizeAssocObjects(rawAssoc, "company");
      }

      // Fallback untuk single company (backward compatibility)
      const id =
        deal.company_id || deal.id_company || deal.companies_id || deal.company;
      const name =
        deal.companynm ||
        deal.company_name ||
        deal.associated_company ||
        deal.companies_name;
      if (id && name && !Array.isArray(id))
        return [{ id: String(id), company_name: name }];

      return [];
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
            const taskId =
              this.sourceData.id ||
              this.sourceData.task_id ||
              this.sourceData.taskId;
            if (taskId) {
              const fullTask = await this.$store.dispatch(
                "tasks/fetchTaskById",
                taskId,
              );
              if (fullTask) {
                this.setFormData(fullTask);
              } else {
                this.setFormData(this.sourceData);
              }
              // Fetch history for existing task
              this.acthistory({
                noteable_type: "TS",
                noteable_id: taskId,
              });
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
    activeTab(newTab) {
      if (newTab === "notes" && this.taskId) {
        this.acthistory({
          noteable_type: "TS",
          noteable_id: this.taskId,
        });
      }
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
    history: {
      deep: true,
      handler(newHistory) {
        if (Array.isArray(newHistory)) {
          const mapped = newHistory.map((item) => {
            let photos = [];
            try {
              if (item.attachment) {
                const attachments =
                  typeof item.attachment === "string"
                    ? JSON.parse(item.attachment)
                    : item.attachment;
                if (Array.isArray(attachments)) {
                  photos = attachments
                    .filter((a) => a.type === "photo" || a.typefile === "photo")
                    .map((a) => a.path || a.fileurl);
                }
              }
            } catch (e) {}

            return {
              type: "note",
              id: item.id,
              timestamp: item.created_at || item.update_at,
              body: item.notes || item.body || item.description || "",
              latitude: item.lat,
              longitude: item.lang,
              gps_address:
                item.lat && item.lang ? `${item.lat}, ${item.lang}` : null,
              photos: photos,
              visibility: item.visibility,
            };
          });

          this.historyitems = mapped.sort((a, b) => {
            const dateA = new Date(a.timestamp || 0);
            const dateB = new Date(b.timestamp || 0);
            return dateB - dateA;
          });
        }
      },
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    ...mapActions("tasks", ["createTask", "fetchTaskById"]),
    ...mapActions("history", ["saveNote", "acthistory"]),
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
        project_id: (function (val) {
          if (!val) return [];
          return Array.isArray(val) ? val.map(String) : [String(val)];
        })(this.pickFirst(data.project_id, taskData.project_id, null)),
      };

      // Sync history items from data if provided
      let rawNotes = data.notes || data.note;
      if (typeof rawNotes === "string" && rawNotes.startsWith("[")) {
        try {
          rawNotes = JSON.parse(rawNotes);
        } catch (e) {}
      }

      if (Array.isArray(rawNotes)) {
        const items = rawNotes.map((n) => ({
          type: "note",
          id: n.id,
          timestamp: n.created_at || n.update_at,
          body: n.body || n.notes || n.description || "",
          photos: n.photos || [],
        }));
        this.historyitems = items.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
        );
      }
    },
    resetForm() {
      this.formData = {
        task_name: "",
        description: "",
        status_id: "",
        assignee: this.usersignin?.id || "",
        due_date: "",
        task_time: "",
        priority: "",
        progress: 0,
        project_id: null,
      };
      this.historyitems = [];
      this.tempNoteData = {
        idnote: null,
        body: "",
        gps_address: null,
        latitude: null,
        longitude: null,
        photos: [],
        audioBlob: null,
      };
      this.editingItemIndex = null;
      this.activeTab = "master";
      this.savedTask = null;
    },
    handleClose() {
      if (this.isNoteDrawerOpen) return;
      this.resetForm();
      this.$emit("close");
    },
    async handleSave() {
      if (!this.formData.task_name?.trim()) {
        alertService.toastError("Nama task wajib diisi");
        return;
      }
      if (!this.formData.status_id) {
        alertService.toastError("Status wajib diisi");
        return;
      }
      if (!this.formData.due_date) {
        alertService.toastError("Due date wajib diisi");
        return;
      }

      if (this.isSubmitting) return;
      this.isSubmitting = true;

      const currentUserId =
        this.usersignin?.id || this.$store.getters["users/useridsignin"];
      // Unwrap project_id array to single value for backend compatibility
      const submissionData = { ...this.formData };
      if (Array.isArray(submissionData.project_id)) {
        submissionData.project_id =
          submissionData.project_id.length > 0
            ? submissionData.project_id[0]
            : null;
      }

      const payload = {
        ...submissionData,
        id: this.taskId,
        created_by: currentUserId,
      };

      try {
        const result = await this.createTask(payload);
        const isUpdate = !!payload.id;

        alertService.toastSuccess(
          `Task berhasil ${isUpdate ? "diperbarui" : "ditambahkan"}`,
        );

        if (this.fromPage === "tasks") {
          // Stay open and switch to notes tab
          this.savedTask = result;
          this.activeTab = "notes";
          this.$emit("submit", result);
        } else {
          this.$emit("submit", result);
          this.handleClose();
        }
      } catch (error) {
        alertService.toastError(
          error.response?.data?.message || "Gagal menyimpan task",
        );
      } finally {
        this.isSubmitting = false;
      }
    },
    openNoteDrawer(editData = null, index = null) {
      if (editData) {
        this.tempNoteData = { ...editData, idnote: editData.id };
        this.editingItemIndex = index;
      } else {
        this.tempNoteData = {
          idnote: null,
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
    buildFormDatanote(data) {
      const fd = new FormData();
      const existing = [];

      fd.append("noteable_type", data.noteable_type);
      fd.append("noteable_id", data.noteable_id);
      fd.append("body", data.body || "");
      fd.append("gps_address", data.gps_address || "");
      fd.append("latitude", data.latitude || "");
      fd.append("longitude", data.longitude || "");
      fd.append("visibility", data.visibility ?? 0);
      fd.append("choice", data.choice || "I");
      fd.append("idnote", data.idnote ?? null);

      (data.photos || []).forEach((p) => {
        if (p.file) {
          fd.append("photos[]", p.file);
        } else if (typeof p === "string") {
          existing.push({
            name: p.split("/").pop(),
            path: p,
            type: "photo",
          });
        }
      });

      if (existing.length > 0) {
        fd.append("existing_attachments", JSON.stringify(existing));
      }

      return fd;
    },
    saveNoteFromDrawer() {
      if (
        !this.tempNoteData.body &&
        (this.tempNoteData.photos || []).length === 0
      ) {
        alertService.toastWarn("Catatan masih kosong");
        return;
      }

      const isUpdate = !!this.tempNoteData.idnote;
      const payload = {
        noteable_type: "TS",
        noteable_id: this.taskId,
        ...this.tempNoteData,
        choice: isUpdate ? "U" : "I",
      };

      const formData = this.buildFormDatanote(payload);

      this.saveNote(formData)
        .then(() => {
          alertService.toastSuccess("Catatan berhasil disimpan");
          this.isNoteDrawerOpen = false;
          this.acthistory({
            noteable_type: "TS",
            noteable_id: this.taskId,
          });
        })
        .catch((err) => {
          alertService.toastError(
            err.response?.data?.message || "Gagal menyimpan catatan",
          );
        });
    },
    handleHistoryEdit({ item, index }) {
      this.openNoteDrawer(item, index);
    },
    async handleHistoryDelete(index) {
      const item = this.$refs.historyDetail?.displayItems[index];
      if (!item) return;

      const result = await alertService.confirm(
        "Apakah Anda yakin ingin menghapus catatan ini?",
        "Hapus Histori",
      );

      if (result) {
        const formData = new FormData();
        formData.append("choice", "D");
        formData.append("idnote", item.id);
        formData.append("noteable_type", "TS");
        formData.append("noteable_id", this.taskId);

        try {
          await this.saveNote(formData);
          alertService.toastSuccess("Catatan berhasil dihapus");
          this.acthistory({
            noteable_type: "TS",
            noteable_id: this.taskId,
          });
        } catch (err) {
          alertService.toastError(
            err.response?.data?.message || "Gagal menghapus catatan",
          );
        }
      }
    },
    handleClickOutside(e) {
      if (
        this.$refs.projectDropdownRef &&
        !this.$refs.projectDropdownRef.contains(e.target)
      ) {
        this.isProjectDropdownOpen = false;
      }
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

/* Mobile Responsive */
@media (max-width: 768px) {
  .form-content-mobile {
    padding-bottom: 110px;
  }
  .footer-mobile {
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    width: 100%;
    z-index: 50;
    border-top: 1px solid;
    border-radius: 0;
  }
}
@media (min-width: 769px) {
  .form-content-mobile {
    padding-bottom: 0;
  }
  .footer-mobile {
    position: static;
    width: 100%;
  }
}
</style>
