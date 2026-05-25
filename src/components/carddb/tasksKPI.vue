<script>
export default {
  props: {
    tasks: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      statusOrder: [
        "not_started",
        "deferred",
        "waiting",
        "in_progress",
        "completed",
      ],
      colors: [
        "bg-dark-base",
        "bg-deffered-color",
        "bg-waiting-color",
        "bg-progress-color",
        "bg-sub-text",
      ],
    };
  },
  computed: {
    normalizedRows() {
      const groupedByAssignee = new Map();

      this.tasks.forEach((task) => {
        const name =
          task.assignee || task.owner || task.user_name || "Unassigned";
        const key = String(name).trim() || "Unassigned";
        const status = this.normalizeStatus(task.status || task.stage);

        if (!groupedByAssignee.has(key)) {
          groupedByAssignee.set(key, {
            name: key,
            counts: {
              not_started: 0,
              deferred: 0,
              waiting: 0,
              in_progress: 0,
              completed: 0,
            },
          });
        }

        groupedByAssignee.get(key).counts[status] += 1;
      });

      const mappedRows = [...groupedByAssignee.values()].map((row) => {
        const stats = this.statusOrder.map((status) => row.counts[status] || 0);
        const total = stats.reduce((sum, value) => sum + value, 0);
        return {
          name: row.name,
          stats,
          total,
        };
      });

      return mappedRows.sort((a, b) => b.total - a.total).slice(0, 5);
    },
    chartRows() {
      return this.normalizedRows;
    },
  },
  methods: {
    normalizeStatus(statusRaw) {
      const raw = String(statusRaw || "not_started")
        .toLowerCase()
        .replace(/\s+/g, "_");

      if (raw.includes("progress")) return "in_progress";
      if (raw.includes("wait")) return "waiting";
      if (raw.includes("complete") || raw.includes("done")) return "completed";
      if (raw.includes("defer")) return "deferred";
      return "not_started";
    },
    segmentWidth(value, total) {
      if (!total) return "0%";
      return `${(value / total) * 100}%`;
    },
  },
};
</script>

<template>
  <div
    class="w-full bg-white rounded-xl shadow-sm border border-outline p-4 sm:p-6 mb-5"
  >
    <!-- Header -->
    <div class="flex justify-between items-center mb-4 sm:mb-6">
      <h2 class="text-lg sm:text-xl font-bold text-main-text">
        Task KPI by Status
      </h2>
      <button class="text-slate-400 hover:text-gray-700 text-xl leading-none">
        •••
      </button>
    </div>

    <!-- Table Head (hidden on mobile, shown on sm+) -->
    <div class="hidden sm:flex justify-between text-sm text-sub-text mb-4">
      <span>Name</span>
      <span>Total</span>
    </div>

    <!-- Rows -->
    <div v-if="loading" class="py-6 text-center text-sm text-sub-text">
      Loading task KPI...
    </div>

    <div
      v-else-if="chartRows.length === 0"
      class="py-6 text-center text-sm text-sub-text"
    >
      No task data from database.
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="(task, i) in chartRows"
        :key="i"
        class="flex flex-col sm:grid sm:grid-cols-[180px_1fr_60px] sm:items-center gap-2 sm:gap-4"
      >
        <!-- Nama & Total (mobile: sejajar atas) -->
        <div class="flex justify-between items-baseline sm:contents">
          <p
            class="font-medium text-main-text text-sm sm:text-base wrap-break-word"
          >
            {{ task.name }}
          </p>
          <!-- Total tampil di kanan pada mobile, di grid desktop nanti sendiri -->
          <p class="text-right text-sm text-main-text font-medium sm:hidden">
            {{ task.total }}
          </p>
        </div>

        <!-- Progress Bar (selalu full width) -->
        <div class="w-full h-4 bg-gray-200 rounded overflow-hidden flex">
          <div
            v-for="(val, index) in task.stats"
            :key="index"
            :class="[
              colors[index],
              'flex items-center justify-end text-white text-xs font-bold pr-2 border-r border-white',
            ]"
            :style="{ width: segmentWidth(val, task.total) }"
          >
            <!-- Angka di dalam bar hanya tampil jika cukup lebar? di mobile mungkin tetap tampil -->
            <span class="hidden sm:inline">{{ val > 0 ? val : "" }}</span>
            <!-- mobile: selalu tampilkan angka jika >0 -->
            <span class="sm:hidden">{{ val > 0 ? val : "" }}</span>
          </div>
        </div>

        <!-- Total (hanya tampil di desktop, karena di mobile sudah di atas) -->
        <p class="hidden sm:block text-right text-sm text-main-text">
          {{ task.total }}
        </p>
      </div>
    </div>

    <!-- Legend (flex-wrap supaya rapi di mobile) -->
    <div
      class="flex flex-wrap justify-center gap-3 sm:gap-6 mt-6 sm:mt-8 text-xs"
    >
      <div class="flex items-center gap-1.5 whitespace-nowrap">
        <span class="w-3 h-3 bg-dark-base rounded-full"></span> Not Started
      </div>
      <div class="flex items-center gap-1.5 whitespace-nowrap">
        <span class="w-3 h-3 bg-deffered-color rounded-full"></span> Deferred
      </div>
      <div class="flex items-center gap-1.5 whitespace-nowrap">
        <span class="w-3 h-3 bg-waiting-color rounded-full"></span> Waiting
      </div>
      <div class="flex items-center gap-1.5 whitespace-nowrap">
        <span class="w-3 h-3 bg-progress-color rounded-full"></span> In Progress
      </div>
      <div class="flex items-center gap-1.5 whitespace-nowrap">
        <span class="w-3 h-3 bg-sub-text rounded-full"></span> Completed
      </div>
    </div>
  </div>
</template>
