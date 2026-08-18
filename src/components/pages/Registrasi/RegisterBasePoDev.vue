<!-- src/components/pages/Registrasi/RegisterBasePoDev.vue -->
<template>
  <div class="po-dev-container">
    <!-- Loading overlay -->
    <div
      v-if="isLoading"
      class="fixed inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] z-50"
    >
      <div class="rounded-xl bg-white/80 p-4 shadow-lg backdrop-blur-sm">
        <div
          class="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"
        ></div>
      </div>
    </div>

    <!-- Report View using ReportGridBuilder -->
    <ReportGridBuilder
      ref="gridBuilderRef"
      :dataSource="gridDataSource"
      :keyExpr="keyfield"
      :reportTitle="title"
      :periodLabel="formatDateRange"
      :userName="userName"
      storageKey="report-register-po-dev"
      fileName="register-po-dev"
    >
      <!-- Forward custom columns slot if provided by parent -->
      <template v-if="$slots.columns" #columns>
        <slot name="columns"></slot>
      </template>

      <!-- Inject Filter button to the toolbar -->
      <template #extra-tools>
        <button class="rb-btn rb-btn--filter" title="Filter Data" @click="openFilter">
          <i class="filter-ico">&#9906;</i> Filter
        </button>
      </template>
    </ReportGridBuilder>

    <!-- Filter Popup -->
    <RegisterFilterPopup
      v-if="showFilter"
      :visible="showFilter"
      :title="title"
      :type="type"
      :initialStartDate="filterData.startDate"
      :initialEndDate="filterData.endDate"
      :initialGudang="filterData.gudang"
      :initialStatus="filterData.status"
      :storeModule="storeModule"
      :fullScreen="isMobile"
      :width="isMobile ? '100%' : '600px'"
      @apply="handleApplyFilter"
      @close="handleClosePopup"
    />
  </div>
</template>

<script>
import ReportGridBuilder from "./ReportGridBuilder.vue";
import RegisterFilterPopup from "./RegisterPopup.vue";

export default {
  name: "RegisterBasePoDev",
  components: {
    ReportGridBuilder,
    RegisterFilterPopup,
  },
  props: {
    title: { type: String, default: "Register PO Dev" },
    type: { type: String, default: "po" },
    storeModule: { type: String, default: "register" },
    apiEndpoint: { type: String, default: "report" },
    loadAction: { type: String, default: "getRegister" },
    userName: { type: String, default: "admin" },
    dataSource: { type: Array, default: () => [] },
  },
  data() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const lastDay = new Date(y, today.getMonth() + 1, 0).getDate();

    return {
      showFilter: false,
      filterData: {
        startDate: `${y}-${m}-01`,
        endDate: `${y}-${m}-${String(lastDay).padStart(2, "0")}`,
        gudang: "",
        status: "gabungan",
      },
      isMobile: false,
    };
  },
  created() {
    if (this.dataSource && this.dataSource.length > 0) {
      return;
    }
    // Open filter popup automatically on first mount
    window.__registerVisited = window.__registerVisited || {};
    if (!window.__registerVisited[this.storeModule]) {
      this.showFilter = true;
      window.__registerVisited[this.storeModule] = true;
    } else {
      // If already visited, load data automatically
      this.loadData();
    }
  },
  mounted() {
    this.checkMobile();
    window.addEventListener("resize", this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkMobile);
  },
  computed: {
    formatDateRange() {
      const options = { day: "numeric", month: "short", year: "numeric" };
      const start = this.filterData.startDate ? new Date(this.filterData.startDate) : new Date();
      const end = this.filterData.endDate ? new Date(this.filterData.endDate) : new Date();
      return `${start.toLocaleDateString("id-ID", options)} - ${end.toLocaleDateString("id-ID", options)}`;
    },
    gridDataSource() {
      const data = this.dataSource && this.dataSource.length > 0 ? this.dataSource : this.registerList;
      if (!Array.isArray(data)) return [];
      return data.map(item => {
        if (!item || typeof item !== 'object') return item;
        const newItem = { ...item };
        if ('Kodebrg' in newItem && !('KodeBrg' in newItem)) {
          newItem.KodeBrg = newItem.Kodebrg;
        } else if ('KodeBrg' in newItem && !('Kodebrg' in newItem)) {
          newItem.Kodebrg = newItem.KodeBrg;
        }
        return newItem;
      });
    },
    registerList() {
      return this.$store.getters[`${this.storeModule}/registerList`] || [];
    },
    keyfield() {
      return this.$store.getters[`${this.storeModule}/keyfield`] || "Id";
    },
    isLoading() {
      return this.$store.getters[`${this.storeModule}/isLoading`] || false;
    },
  },
  methods: {
    formatDateForSp(date, isEnd = false) {
      if (!date) return null;
      const d = new Date(date);
      const time = isEnd ? "23:59:59" : "00:00:00";
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${time}`;
    },
    defaultBuildPayload(data) {
      return {
        mulaitgl: this.formatDateForSp(data.startDate, false),
        sampaitgl: this.formatDateForSp(data.endDate, true),
        kodegdg: data.gudang || "",
        status: data.status,
      };
    },
    loadData() {
      const payload = this.defaultBuildPayload(this.filterData);
      const actionName = `${this.storeModule}/${this.loadAction}`;

      if (!this.$store._actions[actionName]) {
        console.warn(`Action ${actionName} not found, skipping loadData`);
        return Promise.resolve();
      }

      return this.$store.dispatch(actionName, payload).catch((err) => {
        console.error("Error loading data:", err);
      });
    },
    handleApplyFilter(formData) {
      this.showFilter = false;
      this.filterData = formData || {};
      this.loadData();
    },
    handleClosePopup() {
      this.showFilter = false;
    },
    openFilter() {
      this.showFilter = true;
    },
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
    },
  },
};
</script>

<style scoped>
.po-dev-container {
  min-height: 100vh;
  background-color: #f1f5f9;
  padding: 20px;
}

/* Custom button styles to match ReportGridBuilder theme */
.rb-btn--filter {
  background-color: #1e293b !important;
  color: #ffffff !important;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 4px;
  padding: 0 12px;
  height: 27px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.rb-btn--filter:hover {
  background-color: #334155 !important;
  transform: translateY(-1px);
}

.rb-btn--filter:active {
  transform: scale(0.97);
}

.filter-ico {
  font-style: normal;
  font-size: 14px;
}
</style>
