<template>
  <div
    class="bg-white rounded-lg shadow-sm w-full h-147 border border-outline flex flex-col overflow-hidden"
  >
    <!-- Mobile UI -->
    <div class="px-4 pt-4 pb-3 md:hidden">
      <div class="space-y-3">
        <div class="flex items-center gap-2 w-full">
          <button
            class="p-2 border border-outline rounded-lg hover:bg-outline/30 transition shrink-0"
          >
            <Filter :size="20" class="text-dark-base" />
          </button>

          <input
            type="text"
            placeholder="Search by Name"
            v-model="searchQuery"
            class="min-w-0 flex-1 pl-3 pr-4 py-2 bg-white border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
          />

          <button
            class="p-2 bg-outline hover:bg-outline/30 rounded-lg transition shrink-0"
          >
            <Search :size="20" class="text-dark-base" />
          </button>
        </div>

        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-sm text-dark-base whitespace-nowrap">Show</span>
            <select
              v-model.number="itemsPerPage"
              class="px-2 py-1.5 border border-outline rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-sub-text"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>

          <div class="flex items-center gap-2 text-sm text-sub-text">
            <button
              @click="prevPage"
              class="p-1.5 rounded hover:bg-gray-100 transition disabled:opacity-40"
              :disabled="currentPage === 1"
            >
              <ChevronLeft :size="18" class="text-sub-text" />
            </button>

            <div class="flex items-center gap-1">
              <span class="whitespace-nowrap">Page</span>
              <input
                type="number"
                v-model="currentPage"
                min="1"
                class="w-11 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-sub-text"
              />
              <span class="whitespace-nowrap">of {{ totalPages }}</span>
            </div>

            <button
              @click="nextPage"
              class="p-1.5 rounded hover:bg-gray-100 transition disabled:opacity-40"
              :disabled="currentPage === totalPages"
            >
              <ChevronRight :size="18" class="text-sub-text" />
            </button>
          </div>
        </div>

        <div class="w-full">
          <div
            class="flex flex-col sm:flex-row bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden"
          >
            <input
              v-model="taskText"
              @keyup.enter="quickAdd"
              type="text"
              placeholder="Enter new task here..."
              class="w-full min-w-0 flex-1 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
            />

            <button
              @click="quickAdd"
              :disabled="isQuickAdding || !taskText.trim()"
              class="w-full sm:w-auto px-4 py-2 bg-sub-text text-white text-sm font-semibold hover:bg-gray-700 transition flex items-center justify-center shrink-0"
              :class="{
                'opacity-60 cursor-not-allowed':
                  isQuickAdding || !taskText.trim(),
              }"
            >
              {{ isQuickAdding ? "Saving..." : "Quick Add" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop UI unchanged -->
    <div class="hidden md:block">
      <!-- Action Bar -->
      <div class="pt-4 pr-4 pl-4">
        <div class="flex flex-col xl:flex-row xl:items-start gap-4 w-full">
          <!-- LEFT -->
          <div class="flex items-center flex-wrap gap-3 flex-1 min-w-0">
            <!-- Filter -->
            <button
              class="p-2 border border-outline rounded-lg hover:bg-outline/30 transition"
            >
              <Filter :size="20" class="text-dark-base" />
            </button>

            <!-- Delete Btn -->
            <button
              type="button"
              @click="handleDelete"
              :disabled="selectedTasks.length === 0"
              class="h-10 w-10 rounded-lg border border-red bg-white p-2 text-red transition hover:bg-red hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-red"
              title="Delete selected tasks"
            >
              <Trash :size="20" />
            </button>

            <!-- Search -->
            <input
              type="text"
              placeholder="Search by Name"
              v-model="searchQuery"
              class="pl-3 pr-4 py-2 bg-white border border-outline rounded-lg w-full sm:w-64 lg:w-72 focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
            />

            <!-- Search Btn -->
            <button
              class="p-2 bg-outline hover:bg-outline/30 rounded-lg transition"
            >
              <Search :size="20" class="text-dark-base" />
            </button>

            <!-- Show -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-dark-base">Show</span>
              <select
                v-model.number="itemsPerPage"
                class="px-3 py-2 border border-outline rounded-lg text-sm"
              >
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>

          <!-- quick add -->
          <div class="w-full xl:w-80 shrink-0">
            <div
              class="flex flex-col sm:flex-row bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden"
            >
              <!-- Input -->
              <input
                v-model="taskText"
                @keyup.enter="quickAdd"
                type="text"
                placeholder="Enter new task here..."
                class="w-full min-w-0 flex-1 pl-3 pr-4 py-2 bg-white border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm text-gray-700 placeholder-gray-400"
              />

              <!-- Button -->
              <button
                @click="quickAdd"
                :disabled="isQuickAdding || !taskText.trim()"
                class="w-full sm:w-auto px-4 py-2 bg-sub-text text-white text-sm font-semibold hover:bg-gray-700 transition flex items-center justify-center shrink-0"
                :class="{
                  'opacity-60 cursor-not-allowed':
                    isQuickAdding || !taskText.trim(),
                }"
              >
                {{ isQuickAdding ? "Saving..." : "Quick Add" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- select sama page total -->
      <div class="px-6 py-2 flex items-center">
        <!-- KIRI -->
        <label class="flex items-center gap-2 text-sm text-sub-text">
          <input
            type="checkbox"
            :checked="allSelected"
            @change="toggleSelectAll"
            class="h-4 w-4 rounded border-gray-300 text-sub-text focus:ring-sub-text"
          />
          Select all filtered result
        </label>

        <!-- PUSH KANAN -->
        <div class="ml-auto flex items-center gap-3 text-sm text-sub-text">
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
            class="p-2 rounded hover:bg-gray-100 transition disabled:opacity-40"
            :disabled="currentPage === totalPages"
          >
            <ChevronRight :size="18" class="text-sub-text" />
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="flex-1 min-h-0 overflow-auto relative">
      <!-- Loading Overlay -->
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white/60 z-20 flex items-center justify-center"
      >
        <div class="flex flex-col items-center gap-3">
          <RefreshCw class="animate-spin text-blue-950" :size="32" />
          <p class="text-sm text-sub-text font-medium">Loading tasks...</p>
        </div>
      </div>

      <!-- DataGrid List -->
      <DataGrid
        class="mt-0!"
        :dataSource="tableTasks"
        :keyExpr="'id'"
        :showSelection="true"
        :selectedRowKeys="selectedTasks"
        :showActionColumn="true"
        :columns="gridColumns"
        :customCellTemplates="gridTemplates"
        @focused-row-changed="handleFocusedRowChanged"
        @selection-changed="handleSelectionChanged"
        @edit-click="handleRowEdit"
        @delete-click="handleRowDelete"
      />
    </div>

    <!-- Error Message -->
    <p
      v-if="error"
      class="px-6 py-3 text-sm text-red-600 border-t border-gray-100"
    >
      {{ error }}
    </p>
  </div>
</template>

<script>
import {
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Trash,
} from "lucide-vue-next";
import { alertService } from "@/services/alertService";
import DataGrid from "@/components/widgets/DataGrid.vue";

export default {
  name: "TaskList",
  components: {
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Trash,
    DataGrid,
  },
  emits: ["viewDetail", "taskSelection"],
  data() {
    return {
      taskText: "",
      isQuickAdding: false,
      currentPage: 1,
      itemsPerPage: 10,
      selectedTasks: [],
      isSyncingStage: false,
      updatingTaskId: null,
      openStageDropdown: null,
      stageOptions: [
        { value: "not_started", label: "Not Started" },
        { value: "in_progress", label: "In Progress" },
        { value: "waiting", label: "Waiting" },
        { value: "completed", label: "Completed" },
        { value: "deferred", label: "Deferred" },
      ],
    };
  },
  computed: {
    allTasksData() {
      return this.$store.getters["tasks/filteredTasks"] || [];
    },
    isLoading() {
      return this.$store.getters["tasks/isLoading"];
    },
    error() {
      return this.$store.getters["tasks/error"];
    },
    signedInUser() {
      return this.$store.getters["users/usersignin"] || null;
    },
    authUser() {
      return this.$store.getters["auth/currentUser"] || null;
    },
    searchQuery: {
      get() {
        return this.$store.getters["tasks/searchQuery"] || "";
      },
      set(value) {
        this.$store.dispatch("tasks/setSearchQuery", value);
      },
    },
    tasks() {
      return this.allTasksData;
    },
    quickAddOwnerLabel() {
      return this.getLoggedInName();
    },
    totalTask() {
      return this.tasks.length;
    },
    paginatedTasks() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.tasks.slice(start, start + this.itemsPerPage);
    },
    gridTemplates() {
      return [
        {
          name: "statusTemplate",
          component: {
            props: ["data"],
            template: `
              <div class="flex items-center">
                <span class="status-badge">{{ data.data.value }}</span>
              </div>
            `,
          },
        },
      ];
    },
    gridColumns() {
      return [
        { dataField: "Task Name", caption: "Task Name" },
        {
          dataField: "Status",
          caption: "Status",
          cellTemplate: "statusTemplate",
        },
        { dataField: "Due Date / Time", caption: "Due Date / Time" },
        { dataField: "Created / Updated", caption: "Created / Updated" },
        { dataField: "Owner", caption: "Owner" },
      ];
    },
    allSelected() {
      return (
        this.paginatedTasks.length > 0 &&
        this.paginatedTasks.every((task) =>
          this.selectedTasks.includes(task.id),
        )
      );
    },
    tableTasks() {
      return this.paginatedTasks.map((task) => {
        // Gabungkan data status dari berbagai kemungkinan field BE
        const statusValue = task.status_id || task.status || task.stage;
        return {
          "Task Name": task.title || task.name || "-",
          Status: this.getStageLabel(statusValue),
          "Due Date / Time": task.dueDate || task.time || "-",
          "Created / Updated": task.created_at || task.createdAt || "-",
          Owner: task.owner || task.assignee || "-",
          id: task.id,
        };
      });
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.totalTask / this.itemsPerPage));
    },
  },
  methods: {
    resolveTaskFromTemplate(templateOptions) {
      if (!templateOptions) return null;
      return (
        templateOptions?.data?.data ||
        templateOptions?.row?.data ||
        templateOptions?.data ||
        templateOptions
      );
    },

    handleRowEdit(templateOptions) {
      const rowTask = this.resolveTaskFromTemplate(templateOptions);
      if (!rowTask) return;
      const originalTask = this.tasks.find((task) => task.id === rowTask.id);
      this.openTaskDetail(originalTask || rowTask);
    },

    async handleRowDelete(templateOptions) {
      const rowTask = this.resolveTaskFromTemplate(templateOptions);
      const taskId = rowTask?.id;

      if (!taskId) {
        alertService.error("ID task tidak ditemukan.");
        return;
      }

      const taskName = rowTask?.["Task Name"] || rowTask?.title || "task ini";
      const confirmDelete = await alertService.confirm(
        "Hapus Task?",
        `${taskName} akan dihapus secara permanen.`,
      );
      if (!confirmDelete) return;

      try {
        const taskItem = this.allTasksData.find(
          (task) => task.id === taskId,
        ) || {
          id: taskId,
        };
        await this.$store.dispatch("tasks/deleteTask", taskItem);
        this.selectedTasks = this.selectedTasks.filter((id) => id !== taskId);
        this.$emit("taskSelection", this.selectedTasks);
        alertService.success("Task berhasil dihapus");
      } catch (error) {
        const status = error?.response?.status;
        const backendMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message;
        alertService.error(
          `Gagal menghapus task. ${status ? `Status: ${status}. ` : ""}${backendMessage || "Silakan coba lagi."}`,
        );
      }
    },

    getLoggedInName() {
      const user = this.signedInUser || this.authUser || {};
      const fullName =
        user.name ||
        user.username ||
        user.user_name ||
        [user.firstname || user.first_name, user.lastname || user.last_name]
          .filter(Boolean)
          .join(" ") ||
        user.email ||
        "User";

      return String(fullName).trim() || "User";
    },

    getStageLabel(stage) {
      // 1. Cek di store (BE data statuses)
      const storeStatuses = this.$store.getters["tasks/allStatuses"] || [];
      if (storeStatuses.length > 0) {
        const match = storeStatuses.find(
          (s) =>
            String(s.id) === String(stage) ||
            String(s.value) === String(stage) ||
            s.status_name === stage ||
            s.name === stage,
        );
        if (match) return match.status_name || match.name || match.label;
      }

      // 2. Cek di hardcoded options
      const hardcoded = this.stageOptions.find((opt) => opt.value === stage);
      if (hardcoded) return hardcoded.label;

      // Fallback: format string jika bukan ID
      if (!stage || stage === "-") return "-";
      if (typeof stage === "string" && isNaN(stage)) {
        return stage
          .charAt(0)
          .toUpperCase()
          .concat(stage.slice(1).replace(/_/g, " "));
      }

      return stage; // Kembalikan ID jika tidak ketemu mappingnya
    },

    getStageColor(stage) {
      const colors = {
        not_started: "bg-slate-100 text-slate-700",
        in_progress: "bg-blue-100 text-blue-700",
        waiting: "bg-yellow-100 text-yellow-700",
        completed: "bg-emerald-100 text-emerald-700",
        deferred: "bg-red-100 text-red-700",
      };
      return colors[stage] || "bg-slate-100 text-slate-700";
    },

    async quickAdd() {
      const taskName = this.taskText.trim();
      if (!taskName || this.isQuickAdding) return;

      this.isQuickAdding = true;

      try {
        if (!this.signedInUser) {
          await this.$store.dispatch("users/getusersignin").catch(() => null);
        }

        await this.$store.dispatch("tasks/createTask", {
          taskName,
          owner: this.getLoggedInName(),
          dueDate: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });

        this.taskText = "";
      } catch (err) {
        console.error("Quick add task failed:", err);
      } finally {
        this.isQuickAdding = false;
      }
    },

    toggleSelectAll(e) {
      this.selectedTasks = e.target.checked
        ? this.paginatedTasks.map((t) => t.id)
        : [];
      this.$emit("taskSelection", this.selectedTasks);
    },

    handleSelectionChanged(event) {
      this.selectedTasks = event?.selectedRowKeys || [];
      this.$emit("taskSelection", this.selectedTasks);
    },

    toggleSelect(id) {
      if (this.selectedTasks.includes(id)) {
        this.selectedTasks = this.selectedTasks.filter((i) => i !== id);
      } else {
        this.selectedTasks.push(id);
      }
      this.$emit("taskSelection", this.selectedTasks);
    },

    toggleStageDropdown(taskId) {
      this.openStageDropdown =
        this.openStageDropdown === taskId ? null : taskId;
    },

    openTaskDetail(task) {
      this.$emit("viewDetail", task);
    },

    handleFocusedRowChanged(rowData) {
      if (!rowData || !rowData.data) return;
      const originalTask = this.tasks.find(
        (task) => task.id === rowData.data.id,
      );
      this.openTaskDetail(originalTask || rowData.data);
    },

    clearSelection() {
      this.selectedTasks = [];
      this.$emit("taskSelection", []);
    },

    async handleDelete() {
      if (this.selectedTasks.length === 0) {
        alertService.warning("Pilih minimal satu task untuk dihapus");
        return;
      }

      const confirmDelete = await alertService.confirm(
        "Hapus Task?",
        `${this.selectedTasks.length} task akan dihapus secara permanen. Lanjutkan?`,
      );

      if (!confirmDelete) return;

      try {
        for (const taskId of this.selectedTasks) {
          const taskItem = this.allTasksData.find(
            (task) => task.id === taskId,
          ) || {
            id: taskId,
          };
          await this.$store.dispatch("tasks/deleteTask", taskItem);
        }
        alertService.success("Task berhasil dihapus");
        this.clearSelection();
      } catch (error) {
        console.error("Error deleting tasks:", error);
        const status = error?.response?.status;
        const backendMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message;
        alertService.error(
          `Gagal menghapus task. ${status ? `Status: ${status}. ` : ""}${backendMessage || "Silakan coba lagi."}`,
        );
      }
    },

    async handleChangeStage(task, newStage) {
      if (task.status === newStage || task.stage === newStage) {
        this.openStageDropdown = null;
        return;
      }

      const previousStage = task.status || task.stage;
      task.status = newStage;
      task.stage = newStage;
      this.updatingTaskId = task.id;
      this.isSyncingStage = true;
      this.openStageDropdown = null;

      try {
        await this.$store.dispatch("tasks/updateTask", {
          id: task.id,
          formData: {
            status: newStage,
          },
        });

        alertService.success("Stage task berhasil diperbarui.");
      } catch (err) {
        task.status = previousStage;
        task.stage = previousStage;
        alertService.error("Gagal update stage task. Silakan coba lagi.");
      } finally {
        this.isSyncingStage = false;
        this.updatingTaskId = null;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },

    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
  },
  mounted() {
    // Pastikan data status ter-fetch agar mapping ID ke Label jalan
    this.$store.dispatch("tasks/fetchStatuses").catch(() => {});
  },
  watch: {
    tasks: {
      immediate: true,
      handler(newTasks) {
        const validIds = newTasks.map((task) => task.id);
        this.selectedTasks = this.selectedTasks.filter((id) =>
          validIds.includes(id),
        );
      },
    },
    itemsPerPage() {
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
    },
    totalTask() {
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
    },
  },
};
</script>

<style scoped>
.stage-dropdown-enter-active,
.stage-dropdown-leave-active {
  transition: all 0.18s ease;
}

.stage-dropdown-enter-from,
.stage-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
