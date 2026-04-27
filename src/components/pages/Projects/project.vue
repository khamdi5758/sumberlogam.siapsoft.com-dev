<template>
  <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
    <div class="flex min-w-0 items-baseline gap-3">
      <h1 class="text-2xl font-bold text-dark-base">Projects</h1>
      <span class="text-sm" :class="projectsStatusClass">{{
        projectsStatusText
      }}</span>
    </div>

    <!-- Action Button -->
    <div
      class="ml-auto flex w-full flex-wrap items-center justify-end gap-1 sm:w-auto sm:gap-2"
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
            @click="openCreateProjectForm"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <FilePlus :size="18" />
            <span class="font-medium">Single Project</span>
          </button>
          <button
            @click="handleBulkAdd"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <FolderPlus :size="18" />
            <span class="font-medium">Bulk Project</span>
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
    <ProjectList v-if="activeMode === 'list'" @viewDetail="openProjectDetail" />
    <ProjectCalender
      v-else-if="activeMode === 'calendar'"
      @viewDetail="openProjectDetail"
    />
    <ProjectCard
      v-else-if="activeMode === 'grid'"
      @viewDetail="openProjectDetail"
    />
  </div>

  <!-- Create Project Form -->
  <CreateProjectForm
    :isOpen="showCreateProjectForm"
    @close="showCreateProjectForm = false"
    @submit="handleCreateProject"
  />

  <!-- Project Detail Form -->
  <CreateProjectForm
    :isOpen="showProjectDetailForm"
    :initialData="selectedProjectDetail"
    @close="closeProjectDetail"
    @submit="handleProjectDetailSubmit"
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
import CreateProjectForm from "@/components/forms/CreateProjectForm.vue";
import ProjectList from "./projectlist.vue";
import ProjectCard from "./projectcard.vue";
import ProjectCalender from "./projectcalender.vue";
import { alertService } from "@/services/alertService";

export default {
  name: "Project",
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
    CreateProjectForm,
    ProjectList,
    ProjectCard,
    ProjectCalender,
  },
  data() {
    return {
      showDropdown: false,
      showDownloadDropdown: false,
      showCreateProjectForm: false,
      showProjectDetailForm: false,
      selectedProjectDetail: null,
    };
  },
  computed: {
    ...mapGetters("project", [
      "filteredProjects",
      "isLoading",
      "error",
      "currentView",
    ]),
    allProjects() {
      return this.filteredProjects || [];
    },
    totalProject() {
      return this.allProjects.length;
    },
    projectsStatusText() {
      if (this.isLoading) return "Searching projects...";
      if (this.error) return `Error: ${this.error}`;
      return `${this.totalProject.toLocaleString()} Total Projects`;
    },
    projectsStatusClass() {
      if (this.isLoading) return "text-blue-600";
      if (this.error) return "text-red-600";
      return "text-sub-text";
    },
    activeMode: {
      get() {
        return this.currentView || "list";
      },
      set(mode) {
        this.$store.dispatch("project/setViewMode", mode);
      },
    },
  },
  methods: {
    setMode(mode) {
      if (this.activeMode === mode) return;

      const routeNames = {
        list: "ProjectList",
        calendar: "ProjectCalender",
        grid: "ProjectCard",
      };

      const targetRoute = routeNames[mode];
      if (targetRoute) {
        this.$router.push({ name: targetRoute });
      }
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
      return this.$store.dispatch("project/fetchAllProjects");
    },
    openCreateProjectForm() {
      this.showDropdown = false;
      this.showCreateProjectForm = true;
    },
    handleBulkAdd() {
      this.showDropdown = false;
      console.log("Bulk Add Project");
    },
    downloadAll() {
      this.showDownloadDropdown = false;
      console.log("Download All Projects");
    },
    handleDownload() {
      this.showDownloadDropdown = false;
      console.log("Download Selected Projects");
    },
    async handleCreateProject(formData) {
      try {
        await this.$store.dispatch("project/createProject", formData);
        this.showCreateProjectForm = false;
      } catch (err) {
        console.error("Failed to create project:", err);
      }
    },
    openProjectDetail(project) {
      this.selectedProjectDetail = { ...project };
      this.showProjectDetailForm = true;
    },
    closeProjectDetail() {
      this.selectedProjectDetail = null;
      this.showProjectDetailForm = false;
    },
    async handleProjectDetailSubmit(payload) {
      const projectId =
        payload?.id ||
        this.selectedProjectDetail?.id ||
        this.selectedProjectDetail?.project_id;

      if (!projectId) {
        alertService.error(
          "ID project tidak ditemukan. Coba buka ulang detail project.",
        );
        return;
      }

      if (!payload?.project_name?.trim() && !payload?.task_name?.trim()) {
        alertService.error("Project name wajib diisi.");
        return;
      }

      try {
        await this.$store.dispatch("project/updateProject", {
          id: projectId,
          formData: {
            ...payload,
            project_name: (payload.project_name || payload.task_name).trim(),
            description: payload.description?.trim() || "",
            assignee: payload.assignee?.trim() || payload.owner?.trim() || "",
          },
        });

        await this.$store.dispatch("project/fetchAllProjects");
        alertService.success("Project berhasil diperbarui.");
        this.closeProjectDetail();
      } catch (err) {
        const backendMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Gagal update project. Silakan coba lagi.";
        alertService.error(backendMessage);
      }
    },
    handleRouteChange() {
      const path = this.$route.path;
      if (path.endsWith("/projectcard")) {
        this.$store.dispatch("project/setViewMode", "grid");
      } else if (path.endsWith("/projectcalender")) {
        this.$store.dispatch("project/setViewMode", "calendar");
      } else if (path.includes("/crmAdmin/project")) {
        this.$store.dispatch("project/setViewMode", "list");
      }
    },
  },
  mounted() {
    this.fetchData();
    // Inisialisasi mode berdasarkan URL saat pertama kali load
    this.handleRouteChange();
  },
  watch: {
    $route: "handleRouteChange",
  },
};
</script>
