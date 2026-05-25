<template>
  <div
    class="w-full bg-white rounded-lg shadow-sm h-147 border border-outline flex flex-col overflow-hidden"
  >
    <!-- Action Bar -->
    <div class="pt-4 pr-4 pl-4">
      <div class="flex items-center gap-4 w-full mb-4">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <!-- Filter Button -->
          <button
            class="p-2 border border-outline rounded-lg hover:bg-outline/30 transition"
          >
            <Filter :size="20" class="text-main-text" />
          </button>

          <!-- Search Input -->
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by Name"
            class="pl-3 pr-4 py-2 bg-white border border-outline rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
          />

          <!-- Search Button -->
          <button
            class="p-2 bg-outline hover:bg-outline/30 rounded-lg transition"
          >
            <Search :size="20" class="text-main-text" />
          </button>

          <!-- Show Pagination -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-main-text">Show</span>
            <select class="px-3 py-2 border border-outline rounded-lg text-sm">
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Task Count -->
      <p class="text-xs text-sub-text mb-2">
        {{ totalVisibleProjects }} total projects shown
      </p>

      <!-- Kanban Board -->
      <div class="flex gap-4 overflow-x-auto pb-4">
        <div
          v-for="board in boards"
          :key="board.name"
          class="w-72 shrink-0 bg-slate-100/60 rounded border border-gray-300 flex flex-col"
        >
          <!-- Board Header -->
          <div class="bg-white p-4 font-bold border-b flex justify-between">
            {{ board.name }}
            <span class="bg-gray-800 text-white text-xs px-2 py-0.5 rounded">
              {{ board.items.length }}
            </span>
          </div>

          <!-- Draggable Tasks -->
          <draggable
            v-model="board.items"
            group="tasks"
            item-key="id"
            class="p-3 h-108 flex flex-col gap-3 min-h-50 overflow-y-auto"
            @change="(event) => handleBoardChange(event, board)"
          >
            <template #item="{ element }">
              <div
                @click="openProjectDetail(element)"
                class="bg-white p-4 rounded shadow-sm border border-gray-200 cursor-pointer hover:border-blue-500 transition relative group"
              >
                <!-- Delete Button -->
                <button
                  @click="deleteProject(element, $event)"
                  class="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Hapus project"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19 7L5 7M10 11V17M14 11V17M9 7V4H15V7M6 7H18L17 20H7L6 7Z"
                    />
                  </svg>
                </button>

                <!-- Task Title -->
                <p class="text-sm font-medium text-gray-800 truncate pr-8">
                  {{ element.title }}
                </p>

                <!-- Stage Badge -->
                <div class="mt-2">
                  <span
                    class="px-2 py-0.5 rounded-full text-[11px] font-medium capitalize"
                    :class="getStageClass(element.stage)"
                  >
                    {{ element.stage }}
                  </span>
                </div>

                <!-- Due Date & Time -->
                <p class="text-xs text-gray-500 mt-2">
                  {{ element.dueDate }} / {{ element.time }}
                </p>

                <!-- Associated With -->
                <p class="text-xs text-gray-500 mt-1 truncate">
                  {{ element.associatedWith }}
                </p>

                <!-- Updated At -->
                <p class="text-xs text-gray-400 mt-1">
                  Updated: {{ element.updatedAt }}
                </p>

                <!-- Owner -->
                <p class="text-xs text-gray-400 mt-1">
                  Owner: {{ element.owner }}
                </p>
              </div>
            </template>
          </draggable>

          <!-- Empty State -->
          <div
            v-if="board.items.length === 0"
            class="mx-3 mb-3 bg-white/70 p-3 rounded border border-dashed text-sm text-gray-400"
          >
            No projects in this stage
          </div>
        </div>
      </div>
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
import draggable from "vuedraggable";
import { Filter, Search } from "lucide-vue-next";
import { alertService } from "@/services/alertService";

export default {
  name: "ProjectCard",
  components: {
    draggable,
    Filter,
    Search,
  },
  emits: ["viewDetail"],
  data() {
    return {
      boards: [],
      isSyncingStage: false,
      boardMeta: [
        { id: 1, key: "not_started", name: "Not Started" },
        { id: 2, key: "in_progress", name: "In Progress" },
        { id: 3, key: "waiting", name: "Waiting" },
        { id: 4, key: "completed", name: "Completed" },
        { id: 5, key: "deferred", name: "Deferred" },
      ],
    };
  },
  computed: {
    allProjects() {
      return this.$store.getters["project/allProjects"] || [];
    },
    searchQuery: {
      get() {
        return this.$store.getters["project/searchQuery"] || "";
      },
      set(value) {
        this.$store.dispatch("project/setSearchQuery", value);
      },
    },
    error() {
      return this.$store.getters["project/error"];
    },
    totalVisibleProjects() {
      return this.boards.reduce(
        (total, board) => total + board.items.length,
        0,
      );
    },
  },
  methods: {
    normalizeStatus(statusRaw) {
      const status = String(statusRaw || "not_started")
        .toLowerCase()
        .replace(/\s+/g, "_");

      if (status.includes("progress")) return "in_progress";
      if (status.includes("wait")) return "waiting";
      if (status.includes("complete") || status.includes("done"))
        return "completed";
      if (status.includes("defer")) return "deferred";
      return "not_started";
    },

    normalizeProject(project) {
      return {
        id: project.id,
        title:
          project.project_name ||
          project.title ||
          project.name ||
          "Untitled Project",
        description: project.description || project.task_content || "-",
        stage: this.normalizeStatus(project.status || project.stage),
        dueDate:
          project.dueDate ||
          project.due_date ||
          project.date ||
          project.deadline ||
          "-",
        time: project.time || project.project_time || project.due_time || "-",
        associatedWith:
          project.associatedWith ||
          project.associated_with ||
          project.contact_name ||
          project.company_name ||
          "-",
        updatedAt: project.updated_at || project.updatedAt || "-",
        owner: project.owner || project.assignee || project.user_name || "-",
        priority: project.priority || "",
        raw: project,
      };
    },

    rebuildBoards(rawProjects) {
      const buckets = {
        not_started: [],
        in_progress: [],
        waiting: [],
        completed: [],
        deferred: [],
      };

      rawProjects
        .map((project) => this.normalizeProject(project))
        .forEach((project) => {
          buckets[project.stage].push(project);
        });

      this.boards = this.boardMeta.map((board) => ({
        ...board,
        items: buckets[board.key],
      }));
    },

    getStageClass(stage) {
      const stageClasses = {
        not_started: "bg-slate-100 text-slate-700",
        in_progress: "bg-blue-100 text-blue-700",
        waiting: "bg-yellow-100 text-yellow-700",
        completed: "bg-emerald-100 text-emerald-700",
        deferred: "bg-red-100 text-red-700",
      };
      return stageClasses[stage] || "bg-slate-100 text-slate-700";
    },

    openProjectDetail(project) {
      this.$emit("viewDetail", project.raw || project);
    },

    async handleBoardChange(event, targetBoard) {
      if (!event?.added?.element) return;

      const movedProject = event.added.element;
      const previousStage = movedProject.stage;
      const nextStage = targetBoard.key;

      if (previousStage === nextStage) return;

      movedProject.stage = nextStage;
      this.isSyncingStage = true;

      try {
        await this.$store.dispatch("project/updateProject", {
          id: movedProject.id,
          formData: {
            project_name: movedProject.title,
            description:
              movedProject.description === "-" ? "" : movedProject.description,
            status: nextStage,
            priority: movedProject.priority || "",
            assignee: movedProject.owner === "-" ? "" : movedProject.owner,
            due_date: movedProject.dueDate === "-" ? "" : movedProject.dueDate,
            project_time: movedProject.time === "-" ? "" : movedProject.time,
          },
        });
      } catch (err) {
        movedProject.stage = previousStage;
        await this.$store.dispatch("project/fetchAllProjects").catch(() => {});
        alertService.error("Gagal pindah stage project. Coba lagi.");
      } finally {
        this.isSyncingStage = false;
      }
    },

    async deleteProject(project, event) {
      event.stopPropagation();

      const confirmed = await alertService.confirm(
        "Hapus Project?",
        "Project ini akan dihapus secara permanen. Lanjutkan?",
      );

      if (!confirmed) return;

      try {
        await this.$store.dispatch(
          "project/deleteProject",
          project.raw || project,
        );
        alertService.success("Project berhasil dihapus.");
        await this.$store.dispatch("project/fetchAllProjects").catch(() => {});
      } catch (err) {
        console.error("Delete project error:", err);
        alertService.error("Gagal menghapus project. Coba lagi.");
      }
    },
  },
  watch: {
    allProjects(projects) {
      this.rebuildBoards(projects);
    },
  },
  mounted() {
    this.rebuildBoards(this.allProjects);
    this.$store.dispatch("project/fetchAllProjects").catch(() => {});
  },
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 999px;
}
</style>
