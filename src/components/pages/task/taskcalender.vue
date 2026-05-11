<template>
  <div
    class="bg-white rounded-lg shadow-sm border border-outline flex flex-col overflow-hidden"
  >
    <div class="md:hidden p-4 space-y-4 relative">
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white/70 z-20 flex items-center justify-center rounded-lg"
      >
        <div class="flex flex-col items-center gap-3">
          <RefreshCw class="animate-spin text-blue-950" :size="28" />
          <p class="text-sm text-sub-text font-medium">Loading tasks...</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="p-2 border border-outline rounded-lg hover:bg-outline/30 transition"
        >
          <Filter :size="18" class="text-dark-base" />
        </button>

        <input
          v-model="searchText"
          type="text"
          placeholder="Search by Name"
          class="flex-1 min-w-0 pl-3 pr-4 py-2 bg-white border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-sub-text text-sm"
        />

        <button
          class="p-2 bg-outline hover:bg-outline/30 rounded-lg transition"
        >
          <Search :size="18" class="text-dark-base" />
        </button>
      </div>

      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="text-sm text-dark-base">Show</span>
          <select
            v-model="pageSize"
            class="px-3 py-2 border border-outline rounded-lg text-sm bg-white"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <div class="flex gap-2">
          <button
            @click="prevMonth"
            class="px-3 py-2 border rounded-lg text-sm"
          >
            ◀
          </button>
          <button @click="goToday" class="px-3 py-2 border rounded-lg text-sm">
            Today
          </button>
          <button
            @click="nextMonth"
            class="px-3 py-2 border rounded-lg text-sm"
          >
            ▶
          </button>
        </div>
      </div>

      <div
        class="rounded-xl border border-outline bg-gradient-to-br from-white to-slate-50 p-3 shadow-sm"
      >
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-base font-semibold">
            {{ currentMonthName }} {{ currentYear }}
          </h2>
          <span class="text-xs text-sub-text">Tap a date</span>
        </div>

        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="day in calendarDays"
            :key="day.date"
            @click="selectDate(day)"
            class="h-16 p-1.5 rounded-md cursor-pointer border relative transition flex flex-col"
            :class="{
              'bg-blue-100 border-blue-400': day.isToday,
              'bg-blue-500 text-white': isSelected(day),
            }"
          >
            <div class="text-[11px] font-semibold">{{ day.day }}</div>

            <div
              v-if="events[day.date]"
              class="mt-1 text-[10px] text-left leading-tight overflow-hidden"
            >
              <div
                class="bg-blue-100 text-blue-700 px-1 py-0.5 rounded truncate"
              >
                {{ events[day.date][0].title }}
              </div>
              <div
                v-if="events[day.date].length > 1"
                class="text-[9px] text-gray-500 mt-0.5"
              >
                +{{ events[day.date].length - 1 }} more
              </div>
            </div>

            <span
              v-if="day.hasEvent"
              class="absolute bottom-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"
            ></span>
          </div>
        </div>
      </div>

      <div class="border rounded-xl p-4 bg-white shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold">{{ selectedDateLabel }}</h3>
          <span class="text-xs text-sub-text"
            >{{ selectedEvents.length }} task(s)</span
          >
        </div>

        <div v-if="selectedEvents.length === 0" class="text-gray-400 text-sm">
          No schedule
        </div>

        <ul v-else class="space-y-2">
          <li
            v-for="(event, index) in selectedEvents"
            :key="event.id || index"
            class="p-3 border rounded-lg cursor-pointer transition flex items-start justify-between bg-gray-50"
            @click="openTaskDetail(event)"
          >
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm">{{ event.title }}</div>
              <div class="text-xs text-gray-500">{{ event.time }}</div>
            </div>
            <button
              @click.stop="handleDeleteTask(event)"
              class="ml-2 p-1 rounded cursor-pointer hover:bg-red-100 text-gray-400 hover:text-red-600 transition"
              title="Delete task"
            >
              <Trash :size="16" />
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div class="hidden md:block">
      <!-- Action Bar -->
      <div class="pt-4 px-4">
        <div class="flex items-center gap-4 w-full flex-wrap">
          <div class="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <!-- Filter Button -->
            <button
              class="p-2 border border-outline rounded-lg hover:bg-outline/30 transition"
            >
              <Filter :size="20" class="text-dark-base" />
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
              <Search :size="20" class="text-dark-base" />
            </button>

            <!-- Show Pagination -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-dark-base">Show</span>
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
            <p class="text-sm text-sub-text font-medium">Loading tasks...</p>
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
              @click="openTaskDetail(event)"
            >
              <div class="flex-1 min-w-0">
                <div class="font-medium">{{ event.title }}</div>
                <div class="text-sm text-gray-500">{{ event.time }}</div>
              </div>
              <button
                @click.stop="handleDeleteTask(event)"
                class="ml-2 p-1 rounded cursor-pointer hover:bg-red-100 text-gray-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                title="Delete task"
              >
                <Trash :size="16" />
              </button>
            </li>
          </ul>
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
import { Filter, Search, RefreshCw, Trash } from "lucide-vue-next";
import { alertService } from "@/services/alertService";

export default {
  name: "TaskCalendar",
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
      return this.$store.getters["tasks/isLoading"];
    },
    error() {
      return this.$store.getters["tasks/error"];
    },
    allTasks() {
      return this.$store.getters["tasks/allTasks"] || [];
    },
    events() {
      return this.allTasks.reduce((acc, task) => {
        if (!task?.dueDate) return acc;

        const parsedDate = new Date(task.dueDate);
        if (Number.isNaN(parsedDate.getTime())) return acc;

        const key = this.formatDate(parsedDate);
        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push({
          id: task.id,
          title: task.title || task.name || "Untitled Task",
          time: task.time || "",
          rawTask: task,
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
    openTaskDetail(event) {
      this.$emit("viewDetail", event.rawTask || { id: event.id });
    },
    async handleDeleteTask(taskItem) {
      const confirmDelete = await alertService.confirm(
        "Hapus Task?",
        "Task ini akan dihapus secara permanen. Lanjutkan?",
      );

      if (!confirmDelete) return;

      try {
        await this.$store.dispatch(
          "tasks/deleteTask",
          taskItem?.rawTask || taskItem,
        );
        alertService.success("Task berhasil dihapus");
      } catch (error) {
        console.error("Error deleting task:", error);
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
  },
};
</script>
