<template>
  <div
    class="bg-white rounded-lg shadow-sm border border-outline flex flex-col overflow-hidden"
  >
    <!-- Action Bar -->
    <div class="pt-4 px-4">
      <div class="flex items-center gap-4 w-full flex-wrap">
        <div class="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
          <!-- Filter Button -->
          <button
            class="p-2 border border-outline rounded-lg hover:bg-outline/30 transition"
          >
            <Filter :size="20" class="text-main-text" />
          </button>

          <!-- Search Input -->
          <input
            v-model="searchText"
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
            <select
              v-model="pageSize"
              class="px-3 py-2 border border-outline rounded-lg text-sm"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar Area -->
    <div class="p-4 grid grid-cols-1 xl:grid-cols-4 gap-4 relative">
      <!-- Loading Overlay -->
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white/60 z-20 flex items-center justify-center rounded-lg"
      >
        <div class="flex flex-col items-center gap-3">
          <RefreshCw class="animate-spin text-blue-950" :size="32" />
          <p class="text-sm text-sub-text font-medium">Loading projects...</p>
        </div>
      </div>

      <!-- Calendar Section -->
      <div class="xl:col-span-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">
            {{ currentMonthName }} {{ currentYear }}
          </h2>
          <div class="flex gap-2">
            <button @click="prevMonth" class="px-3 py-1 border rounded">
              ◀
            </button>
            <button @click="goToday" class="px-3 py-1 border rounded">
              Today
            </button>
            <button @click="nextMonth" class="px-3 py-1 border rounded">
              ▶
            </button>
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-2">
          <div
            v-for="day in calendarDays"
            :key="day.date"
            @click="selectDate(day)"
            class="h-24 p-2 rounded-lg cursor-pointer border relative transition hover:shadow-md flex flex-col"
            :class="{
              'bg-blue-100 border-blue-400': day.isToday,
              'bg-blue-500 text-white': isSelected(day),
            }"
          >
            <!-- Day Number -->
            <div class="text-sm font-semibold">{{ day.day }}</div>

            <!-- Event Preview -->
            <div
              v-if="events[day.date]"
              class="mt-1 text-xs text-left space-y-1 overflow-hidden"
            >
              <div
                class="bg-blue-100 text-blue-700 px-1 py-0.5 rounded truncate"
              >
                {{ events[day.date][0].title }}
              </div>
              <div
                v-if="events[day.date].length > 1"
                class="text-[10px] text-gray-500"
              >
                +{{ events[day.date].length - 1 }} more
              </div>
            </div>

            <!-- Event Indicator Dot -->
            <span
              v-if="day.hasEvent"
              class="absolute bottom-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"
            ></span>
          </div>
        </div>
      </div>

      <!-- Right Panel - Selected Date Events -->
      <div class="border rounded-lg p-4">
        <h3 class="font-semibold mb-3">{{ selectedDateLabel }}</h3>

        <div v-if="selectedEvents.length === 0" class="text-gray-400">
          No schedule
        </div>

        <ul v-else class="space-y-2">
          <li
            v-for="(event, index) in selectedEvents"
            :key="event.id || index"
            class="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition flex items-start justify-between group"
            @click="openProjectDetail(event)"
          >
            <div class="flex-1 min-w-0">
              <div class="font-medium">{{ event.title }}</div>
              <div class="text-sm text-gray-500">{{ event.time }}</div>
            </div>
            <button
              @click.stop="handleDeleteProject(event)"
              class="ml-2 p-1 rounded cursor-pointer hover:bg-red-100 text-gray-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
              title="Delete project"
            >
              <Trash :size="16" />
            </button>
          </li>
        </ul>
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
import { Filter, Search, RefreshCw, Trash } from "lucide-vue-next";
import { alertService } from "@/services/alertService";

export default {
  name: "ProjectCalender",
  components: {
    Filter,
    Search,
    RefreshCw,
    Trash,
  },
  data() {
    const today = new Date();
    return {
      today,
      currentMonth: today.getMonth(),
      currentYear: today.getFullYear(),
      selectedDate: this.formatDate(today),
      searchText: "",
      pageSize: "10",
      monthNames: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
    };
  },
  computed: {
    isLoading() {
      return this.$store.getters["project/isLoading"];
    },
    error() {
      return this.$store.getters["project/error"];
    },
    allProjects() {
      return this.$store.getters["project/allProjects"] || [];
    },
    events() {
      return this.allProjects.reduce((acc, project) => {
        if (!project?.dueDate) return acc;

        const parsedDate = new Date(project.dueDate);
        if (Number.isNaN(parsedDate.getTime())) return acc;

        const key = this.formatDate(parsedDate);
        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push({
          id: project.id,
          title:
            project.project_name ||
            project.title ||
            project.name ||
            "Untitled Project",
          time: project.project_time || project.time || "",
          rawProject: project,
        });

        return acc;
      }, {});
    },
    currentMonthName() {
      return this.monthNames[this.currentMonth];
    },
    calendarDays() {
      const result = [];
      const totalDays = new Date(
        this.currentYear,
        this.currentMonth + 1,
        0,
      ).getDate();

      for (let i = 1; i <= totalDays; i++) {
        const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
        result.push({
          day: i,
          date: dateStr,
          isToday:
            i === this.today.getDate() &&
            this.currentMonth === this.today.getMonth() &&
            this.currentYear === this.today.getFullYear(),
          hasEvent: !!this.events[dateStr],
        });
      }
      return result;
    },
    selectedEvents() {
      return this.events[this.selectedDate] || [];
    },
    selectedDateLabel() {
      return new Date(this.selectedDate).toDateString();
    },
  },
  methods: {
    formatDate(date) {
      return date.toISOString().split("T")[0];
    },
    prevMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
    },
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
    },
    goToday() {
      this.currentMonth = this.today.getMonth();
      this.currentYear = this.today.getFullYear();
      this.selectedDate = this.formatDate(this.today);
    },
    selectDate(day) {
      this.selectedDate = day.date;
    },
    isSelected(day) {
      return day.date === this.selectedDate;
    },
    openProjectDetail(event) {
      this.$emit("viewDetail", event.rawProject || { id: event.id });
    },
    async handleDeleteProject(projectItem) {
      const confirmDelete = await alertService.confirm(
        "Hapus Project?",
        "Project ini akan dihapus secara permanen. Lanjutkan?",
      );

      if (!confirmDelete) return;

      try {
        await this.$store.dispatch(
          "project/deleteProject",
          projectItem?.rawProject || projectItem,
        );
        alertService.success("Project berhasil dihapus");
      } catch (error) {
        console.error("Error deleting project:", error);
        const status = error?.response?.status;
        const backendMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message;
        alertService.error(
          `Gagal menghapus project. ${status ? `Status: ${status}. ` : ""}${backendMessage || "Silakan coba lagi."}`,
        );
      }
    },
  },
};
</script>
