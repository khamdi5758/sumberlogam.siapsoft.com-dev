<template>
  <div
    class="mb-4 flex items-center justify-between gap-3 sm:flex-wrap sm:items-start"
  >
    <div class="flex min-w-0 items-baseline gap-3">
      <h1 class="text-2xl font-bold text-main-text">Tasks</h1>
      <span class="hidden text-sm sm:inline" :class="tasksStatusClass">{{
        tasksStatusText
      }}</span>
    </div>

    <!-- Mobile Action Button -->
    <div class="ml-auto flex items-center justify-end gap-2 sm:hidden">
      <div class="flex items-center gap-2">
        <button
          @click="setMode('list')"
          :class="getModeButtonClass('list')"
          title="List View"
        >
          <List :size="18" :stroke-width="3" />
        </button>

        <button
          @click="setMode('calendar')"
          :class="getModeButtonClass('calendar')"
          title="Calendar View"
        >
          <CalendarDays :size="18" :stroke-width="2" />
        </button>

        <button
          @click="setMode('grid')"
          :class="getModeButtonClass('grid')"
          title="Kanban View"
        >
          <LayoutGrid :size="18" :stroke-width="2" />
        </button>
      </div>

      <div class="relative inline-block" ref="mobileActionsRef">
        <button
          type="button"
          @click="toggleMobileActions"
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-outline bg-white text-sub-text transition hover:bg-sub-text hover:text-white"
          aria-label="Open task actions"
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
            @click="runMobileAction('toggle-add')"
            class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-main-text hover:bg-gray-100"
          >
            <FilePlus :size="16" />
            <span>Single Task</span>
          </button>

          <button
            @click="runMobileAction('bulk-add')"
            class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-main-text hover:bg-gray-100"
          >
            <FolderPlus :size="16" />
            <span>Bulk Task</span>
          </button>

          <button
            @click="runMobileAction('download-all')"
            class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-main-text hover:bg-gray-100"
          >
            <FolderDown :size="16" />
            <span>Download All</span>
          </button>

          <button
            @click="runMobileAction('download')"
            class="flex w-full items-center gap-2 border-t border-gray-50 px-4 py-3 text-left text-sm text-main-text hover:bg-gray-100"
          >
            <FileDown :size="16" />
            <span>Download</span>
          </button>

          <button
            @click="runMobileAction('bulk-edit')"
            class="flex w-full items-center gap-2 border-t border-gray-50 px-4 py-3 text-left text-sm text-main-text hover:bg-gray-100"
          >
            <Edit :size="16" />
            <span>Bulk Edit</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Action Button -->
    <div
      class="ml-auto hidden w-full flex-wrap items-center justify-end gap-1 sm:flex sm:w-auto sm:gap-2"
    >
      <!-- Refresh Button -->
      <button
        @click="fetchData"
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

      <!-- Add New Dropdown -->
      <div class="relative inline-block add-dropdown">
        <button
          type="button"
          @click="showDropdown = !showDropdown"
          class="flex h-9 w-9 items-center justify-center gap-2 rounded-lg border border-outline bg-white px-2 py-2 text-sub-text transition hover:bg-sub-text hover:text-white sm:h-10 sm:w-auto sm:px-4"
        >
          <span class="text-lg font-semibold">+</span>
          <span class="hidden text-sm font-medium md:inline">Add New</span>
          <ChevronDown
            :size="16"
            class="hidden transition-transform duration-200 md:inline"
            :class="{ 'rotate-180': showDropdown }"
          />
        </button>
        <div
          v-show="showDropdown"
          class="absolute right-0 mt-2 w-44 bg-white border border-outline rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 text-sub-text"
        >
          <button
            @click="openCreateTaskForm"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <FilePlus :size="18" />
            <span class="font-medium">Single Task</span>
          </button>
          <button
            @click="handleBulkAdd"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <FolderPlus :size="18" />
            <span class="font-medium">Bulk Task</span>
          </button>
        </div>
      </div>

      <!-- Download Dropdown -->
      <div class="relative inline-block">
        <button
          type="button"
          @click="showDownloadDropdown = !showDownloadDropdown"
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
          class="absolute right-0 mt-2 w-48 bg-white border border-outline rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 text-sub-text"
        >
          <button
            @click="downloadAll"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <FolderDown :size="16" />
            <span class="font-medium">Download All</span>
          </button>
          <button
            @click="handleDownload"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <FileDown :size="16" />
            <span class="font-medium">Download</span>
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

      <!-- View Mode Buttons -->
      <button
        @click="setMode('list')"
        :class="getModeButtonClass('list')"
        title="List View"
      >
        <List :size="18" :stroke-width="3" />
      </button>
      <button
        @click="setMode('calendar')"
        :class="getModeButtonClass('calendar')"
        title="Calendar View"
      >
        <CalendarDays :size="18" :stroke-width="2" />
      </button>
      <button
        @click="setMode('grid')"
        :class="getModeButtonClass('grid')"
        title="Kanban View"
      >
        <LayoutGrid :size="18" :stroke-width="2" />
      </button>
    </div>
  </div>

  <!-- Content by Mode -->
  <div class="mt-4">
    <TaskList v-if="activeMode === 'list'" @viewDetail="openTaskDetail" />
    <TaskCalender
      v-else-if="activeMode === 'calendar'"
      @viewDetail="openTaskDetail"
    />
    <TaskCard v-else-if="activeMode === 'grid'" @viewDetail="openTaskDetail" />
  </div>

  <!-- Create / Edit Task Form -->
  <CreateTaskForm
    :isOpen="showCreateTaskForm"
    :initialData="selectedTaskDetail"
    fromPage="tasks"
    @close="closeCreateTaskForm"
    @submit="handleTaskSubmit"
  />
</template>

<script>
import { mapGetters } from "vuex";
import {
  ChevronDown,
  Download,
  FolderDown,
  FileDown,
  FilePlus,
  FolderPlus,
  Edit,
  LayoutGrid,
  List,
  CalendarDays,
  RefreshCw,
} from "lucide-vue-next";
import TaskList from "./tasklist.vue";
import TaskCalender from "./taskcalender.vue";
import TaskCard from "./taskcard.vue";
import CreateTaskForm from "@/components/forms/CreateTaskForm.vue";
import { alertService } from "@/services/alertService";

export default {
  name: "Task",
  components: {
    ChevronDown,
    Download,
    FolderDown,
    FileDown,
    FilePlus,
    FolderPlus,
    Edit,
    LayoutGrid,
    List,
    CalendarDays,
    RefreshCw,
    TaskList,
    TaskCalender,
    TaskCard,
    CreateTaskForm,
  },
  data() {
    return {
      showDropdown: false,
      showDownloadDropdown: false,
      showMobileActions: false,
      showCreateTaskForm: false,
      selectedTaskDetail: null,
    };
  },
  computed: {
    ...mapGetters("tasks", [
      "filteredTasks",
      "isLoading",
      "error",
      "currentView",
    ]),
    allTasks() {
      return this.filteredTasks || [];
    },
    totalTask() {
      return this.allTasks.length;
    },
    tasksStatusText() {
      if (this.isLoading) return "Searching tasks...";
      if (this.error) return `Error: ${this.error}`;
      return `${this.totalTask.toLocaleString()} Total Tasks`;
    },
    tasksStatusClass() {
      if (this.isLoading) return "text-blue-600";
      if (this.error) return "text-red-600";
      return "text-sub-text";
    },
    activeMode: {
      get() {
        return this.currentView || "list";
      },
      set(mode) {
        this.$store.dispatch("tasks/setViewMode", mode);
      },
    },
  },
  methods: {
    setMode(mode) {
      this.activeMode = mode;
    },
    getModeButtonClass(mode) {
      const baseClass =
        "flex items-center justify-center px-4 py-2 h-10 rounded-lg border transition";
      const activeClass =
        this.activeMode === mode
          ? "bg-sub-text text-white border-sub-text"
          : "bg-white text-sub-text border-outline hover:bg-sub-text hover:text-white";
      return `${baseClass} ${activeClass}`;
    },
    fetchData() {
      this.$store.dispatch("tasks/fetchAllTasks");
      this.$store.dispatch("tasks/fetchProjects");
    },
    toggleMobileActions() {
      this.showMobileActions = !this.showMobileActions;
    },
    runMobileAction(action) {
      this.showMobileActions = false;

      if (action === "refresh") {
        this.fetchData();
        return;
      }

      if (action === "toggle-add") {
        this.openCreateTaskForm();
        return;
      }

      if (action === "bulk-add") {
        this.handleBulkAdd();
        return;
      }

      if (action === "download-all") {
        this.downloadAll();
        return;
      }

      if (action === "download") {
        this.handleDownload();
        return;
      }

      if (action === "bulk-edit") {
        console.log("Bulk Edit Task");
      }
    },
    openCreateTaskForm() {
      this.showDropdown = false;
      this.selectedTaskDetail = null;
      this.showCreateTaskForm = true;
    },
    handleBulkAdd() {
      this.showDropdown = false;
      console.log("Bulk Add Task");
    },
    downloadAll() {
      this.showDownloadDropdown = false;
      console.log("Download All Tasks");
    },
    handleDownload() {
      this.showDownloadDropdown = false;
      console.log("Download Selected Tasks");
    },
    async openTaskDetail(task) {
      const taskId = task.id || task.task_id || task.id_task;

      if (taskId) {
        // Fetch data terbaru dari backend sebelum buka form
        const fullTask = await this.$store.dispatch(
          "tasks/fetchTaskById",
          taskId,
        );
        this.selectedTaskDetail = fullTask || { ...task };
      } else {
        this.selectedTaskDetail = { ...task };
      }

      this.showCreateTaskForm = true;
    },
    closeCreateTaskForm() {
      this.selectedTaskDetail = null;
      this.showCreateTaskForm = false;
    },
    async handleTaskSubmit() {
      // Logic moved to CreateTaskForm.vue
      // We only need to refresh the list here
      await this.$store.dispatch("tasks/fetchAllTasks");
    },
    handleRouteChange() {
      const path = this.$route.path;
      if (path.endsWith("/taskcard")) {
        this.$store.dispatch("tasks/setViewMode", "grid");
      } else if (path.endsWith("/taskcalender")) {
        this.$store.dispatch("tasks/setViewMode", "calendar");
      } else if (path.includes("/crmAdmin/task")) {
        this.$store.dispatch("tasks/setViewMode", "list");
      }
    },
  },
  mounted() {
    this.fetchData();
  },
  watch: {
    $route: "handleRouteChange",
  },
};
</script>
