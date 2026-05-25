<template>
  <div
    class="w-full h-full bg-white rounded-xl shadow-sm border border-outline p-6 mb-5"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-main-text">Task List</h2>

      <button
        class="flex items-center gap-2 text-sm text-slate-400 hover:text-main-text transition"
      >
        <span>{{ monthLabel }}</span>
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <!-- Table Head (Desktop only) -->
    <div
      class="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 text-sm text-slate-500 pb-2 border-b"
    >
      <div>Due Date</div>
      <div>Task Name</div>
      <div>PIC</div>
      <div class="text-center">Status</div>
    </div>

    <!-- Rows -->
    <div class="max-h-90 overflow-y-auto mt-2 space-y-1">
      <div v-if="isLoading" class="py-6 text-center text-sm text-sub-text">
        Loading tasks...
      </div>

      <div
        v-else-if="formattedTasks.length === 0"
        class="py-6 text-center text-sm text-sub-text"
      >
        No task data from database.
      </div>

      <template v-else>
        <div
          v-for="(task, i) in formattedTasks"
          :key="task.id"
          :class="['py-4 px-2', i % 2 === 1 ? 'bg-slate-100/60 rounded' : '']"
        >
          <!-- Tampilan Mobile (Stack) -->
          <div class="md:hidden space-y-1 px-2 text-sm">
            <div>
              <span class="font-semibold text-slate-500">Due Date:</span>
              <span class="text-gray-800 ml-1">{{ task.date }}</span>
            </div>
            <div>
              <span class="font-semibold text-slate-500">Task Name:</span>
              <span class="text-gray-800 font-medium ml-1">{{
                task.name
              }}</span>
            </div>
            <div>
              <span class="font-semibold text-slate-500">PIC:</span>
              <span class="font-semibold text-gray-800 ml-1">{{
                task.pic
              }}</span>
            </div>
            <div>
              <span class="font-semibold text-slate-500">Status:</span>
              <span
                class="ml-2 px-2 py-0.5 rounded-full text-xs font-medium inline-block"
                :class="statusStyle(task.status)"
              >
                {{ task.status }}
              </span>
            </div>
          </div>

          <!-- Tampilan Desktop (Grid) -->
          <div
            class="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 items-center text-sm px-2"
          >
            <div class="text-gray-800">{{ task.date }}</div>
            <div class="text-gray-800 font-medium">{{ task.name }}</div>
            <div class="font-semibold text-gray-800">{{ task.pic }}</div>
            <div class="flex justify-center">
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="statusStyle(task.status)"
              >
                {{ task.status }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "TaskList",
  props: {
    tasks: {
      type: Array,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    monthLabel() {
      const now = new Date();
      return now.toLocaleDateString("en-US", { month: "long" });
    },
    formattedTasks() {
      return this.tasks.slice(0, 15).map((task, index) => {
        const statusLabel = this.getStatusLabel(task);
        return {
          id: task.id ?? task.task_id ?? task.id_task ?? index,
          date: this.formatDueDate(
            task.DueDate || task.due_date || task.dueDate || task.date,
            task.task_time || task.time,
          ),
          name:
            task.taskname ||
            task.task_name ||
            task.title ||
            task.name ||
            "Untitled Task",
          pic: task.pic || task.assignee || task.owner || task.user_name || "-",
          status: statusLabel,
        };
      });
    },
  },
  methods: {
    formatDueDate(rawDate, rawTime) {
      if (!rawDate && !rawTime) return "-";

      const dateObj = rawDate ? new Date(rawDate) : null;
      const isDateValid =
        dateObj instanceof Date && !Number.isNaN(dateObj.getTime());

      const datePart = isDateValid
        ? dateObj.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : String(rawDate || "").trim();

      const timePart = String(rawTime || "").trim();
      if (!timePart) return datePart || "-";

      return `${datePart} - ${timePart}`;
    },
    getStatusLabel(task) {
      const statusRaw = String(
        task.status || task.status_name || task.stage || "",
      ).toLowerCase();

      if (statusRaw === "completed") return "Done";
      if (statusRaw === "in_progress") return "Process";
      if (statusRaw === "waiting") return "Waiting";
      if (statusRaw === "deferred") return "Deferred";

      const dueDate =
        task.DueDate || task.due_date || task.dueDate || task.date;
      if (statusRaw === "not_started" && dueDate) {
        const due = new Date(dueDate);
        if (!Number.isNaN(due.getTime()) && due < new Date()) {
          return "Overdue";
        }
      }

      return "Not Started";
    },
    statusStyle(status) {
      if (status === "Done") return "bg-green-600/10 text-green-600";
      if (status === "Overdue") return "bg-red-500/10 text-red-500";
      if (status === "Process") return "bg-amber-500/10 text-amber-500";
      if (status === "Waiting") return "bg-yellow-500/10 text-yellow-600";
      if (status === "Deferred")
        return "bg-deffered-color/10 text-deffered-color";
      return "bg-gray-200 text-gray-700";
    },
  },
};
</script>
