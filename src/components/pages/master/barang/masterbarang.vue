<!-- components/barangBase.vue -->
<template>
  <div class="flex h-screen flex-col py-6 bg-gray-50">
    <!-- Loading -->
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

    <ReusableDataGrid
      ref="dgchildref"
      :dataSource="filteredData"
      :showBorders="false"
      :rowAlternationEnabled="true"
      :columnAutoWidth="true"
      :allowColumnResizing="true"
      :allowColumnReordering="true"
      :showToolbar="true"
      :showAddButton="false"
      :showPrintButton="true"
      :showRefreshButton="false"
      :showSearchPanel="true"
      :searchPlaceholder="'Search ' + title + '...'"
      :showActionColumn="false"
      :showPager="true"
      :pageSize="pageSize"
      :showPageSizeSelector="true"
      :showNavigationButtons="true"
      :showFilterRow="true"
      :customToolbarItems="customToolbarItems"
      :keyExpr="keyfield"
      :summaries="sumcolom"
      :avg="avgcolom"
      :focusedRowKey="focusedRowKey"
      :wordwrap="false"
      :useBuiltInPager="true"
      :showGroupPanel="true"
      :allowGrouping="true"
      :height="gridHeight"
      @optionChanged="onDataGridOptionChanged"
      @focusedRowChanged="onFocusedRowChanged"
      @group-changed="onGroupChanged"
      @print-click="handlePrint"
    />

   
  </div>
</template>

<script>
import ReusableDataGrid from "@/components/widgets/DataGrid.vue";
import { mapGetters } from "vuex";
import api from "@/api";

export default {
  name: "barangBase",
  components: { ReusableDataGrid },
  props: {
    title: { type: String, required: true },
    type: { type: String, required: true },
    storeModule: { type: String, default:"masterbarang" },
    apiEndpoint: { type: String, default: "report" },
  },
  data() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const lastDay = new Date(y, today.getMonth() + 1, 0).getDate();

    return {
      startDate: `${y}-${m}-01`,
      endDate: `${y}-${m}-${String(lastDay).padStart(2, "0")}`,
      selectedGudang: "",
      selectedStatus: "gabungan",
      searchText: "",
      currentPage: 1,
      pageSize: 0,
      focusedRowKey: null,
      hasGroupedColumns: false,
      isMobile: false,
    };
  },
  created() {
    this._myRoutePath = this.$route.path;
    
  },
  unmounted() {
    const activeTabs = this.$store.getters["tabs/getTabs"] || [];
    const isTabStillOpen = activeTabs.some(path => path.toLowerCase() === this._myRoutePath.toLowerCase());
    
    // Hanya hapus memori kunjungan jika tab-nya BENAR-BENAR ditutup (di-silang),
    // bukan sekadar di-unmount oleh keep-alive Vue Router.
    if (!isTabStillOpen && window.__barangVisited && window.__barangVisited[this.storeModule]) {
      delete window.__barangVisited[this.storeModule];
    }
  },
  computed: {
    ...mapGetters({}),
    barangList() {
      return this.$store.getters[`${this.storeModule}/barangList`] || [];
    },
    sumcolom() {
      return this.$store.getters[`${this.storeModule}/sumcolom`] || [];
    },
    avgcolom() {
      return this.$store.getters[`${this.storeModule}/avgcolom`] || [];
    },
    keyfield() {
      return this.$store.getters[`${this.storeModule}/keyfield`] || "id";
    },
    isLoading() {
      return this.$store.getters[`${this.storeModule}/isLoading`] || false;
    },
    filteredData() {
      const list = Array.isArray(this.barangList) ? this.barangList : [];

      if (!this.searchText) {
        return list;
      }

      const lower = this.searchText.toLowerCase();
      return list.filter((item) =>
        Object.values(item).some(
          (val) => val && val.toString().toLowerCase().includes(lower),
        ),
      );
    },
    customToolbarItems() {
      return [
        {
          location: "after",
          widget: "dxButton",
          locateInMenu: "never",
          options: {
            icon: "refresh",
            hint: "Refresh Data",
            elementAttr: { class: "custom-refresh-button" },
            onClick: () => this.handleRefresh(),
          },
        },
        // {
        //   location: "after",
        //   widget: "dxButton",
        //   locateInMenu: "never",
        //   options: {
        //     icon: "filter",
        //     hint: "Filter Data",
        //     elementAttr: { class: "filter-button" },
        //     onClick: () => {
        //     },
        //   },
        // },
      ];
    },
    gridHeight() {
      return this.isMobile ? "calc(100vh - 180px)" : "calc(100vh - 131px)";
    },
  },
  methods: {
    formatDateLocal(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    },
    formatDateForSp(date, isEnd = false) {
      if (!date) return null;
      const d = new Date(date);
      const time = isEnd ? "23:59:59" : "00:00:00";
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${time}`;
    },
    loadData() {
      const payload = {
        mulaitgl: this.formatDateForSp(this.startDate, false),
        sampaitgl: this.formatDateForSp(this.endDate, true),
        kodegdg: this.selectedGudang || "",
        status: this.selectedStatus,
      };
      const actionName = `${this.storeModule}/getbarang`;
      if (!this.$store._actions[actionName]) {
        console.warn(`Action ${actionName} not found, skipping loadData`);
        return Promise.resolve();
      }
      return this.$store.dispatch(actionName, payload).catch((err) => {
        console.error("Error loading data:", err);
      });
    },
    handleApplyFilter({ startDate, endDate, gudang, status }) {
      this.showFilter = false;
      this.startDate = startDate;
      this.endDate = endDate;
      this.selectedGudang = gudang;
      if (status !== undefined) this.selectedStatus = status;
      this.loadData();
    },
    handleClosePopup() {
      this.showFilter = false;
    },
    handleRefresh() {
      this.loadData();
    },
    async handlePrint() {
      try {
        const res = await api.getbydata(this.apiEndpoint, {
          from: this.type,
          startDate: this.startDate,
          endDate: this.endDate,
          kodegdg: this.selectedGudang,
        });
        const url = res.data.url;
        window.open(url, "_blank");
      } catch (err) {
        console.error("Print error:", err);
      }
    },
    onGroupChanged(groupInfo) {
      this.hasGroupedColumns = groupInfo.hasGroups;
    },
    onDataGridOptionChanged(e) {
      if (e.name === "pageIndex") this.currentPage = e.value + 1;
      else if (e.name === "pageSize") this.pageSize = e.value;
      else if (e.name === "searchPanel" && e.fullName === "searchPanel.text")
        this.searchText = e.value || "";
    },
    onFocusedRowChanged(e) {
      this.focusedRowKey = e.row ? e.row.key : null;
    },
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
    },
  },
  mounted() {
    this.checkMobile();
    window.addEventListener("resize", this.checkMobile);

    this.$nextTick(() => {
      if (!this.barangList || this.barangList.length === 0) {
        this.loadData();
      }
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.checkMobile);
  },
};
</script>

<style scoped>
/* BASE STYLES – semua warna tetap seperti semula (light mode) */
:deep(.dx-checkbox .dx-checkbox-icon) {
  border: 1px solid #9ca3af !important;
  background-color: transparent !important;
}
:deep(.dx-checkbox-checked .dx-checkbox-icon) {
  background-color: #002e72 !important;
  border-color: #002e72 !important;
}
:deep(.dx-checkbox-checked .dx-checkbox-icon::before) {
  color: #ffffff !important;
}

:deep(.custom-refresh-button),
:deep(.filter-button) {
  background-color: #002f6c !important;
  border-color: #002f6c !important;
  color: white !important;
  transition: all 0.2s ease !important;
  width: 33px !important;
  height: 33px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
:deep(.custom-refresh-button:hover),
:deep(.filter-button:hover) {
  background-color: #003d8c !important;
  border-color: #003d8c !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(0, 47, 108, 0.3) !important;
}
:deep(.custom-refresh-button:active),
:deep(.filter-button:active) {
  transform: scale(0.95) !important;
  background-color: #002557 !important;
}
:deep(.custom-refresh-button .dx-icon),
:deep(.filter-button .dx-icon) {
  color: #ffffff !important;
  font-size: 14px !important;
  line-height: 1 !important;
}

/* MOBILE ADJUSTMENTS – hanya ubah ukuran, warna tetap */
@media (max-width: 768px) {
  :deep(.custom-refresh-button),
  :deep(.filter-button) {
    width: 28px !important;
    height: 28px !important;
  }
  :deep(.custom-refresh-button .dx-icon),
  :deep(.filter-button .dx-icon) {
    font-size: 12px !important;
  }
  :deep(.dx-toolbar .dx-searchbox) {
    width: 120px !important;
  }
  :deep(.dx-toolbar) {
    padding: 4px 8px !important;
  }
}
@media (max-width: 480px) {
  :deep(.dx-toolbar .dx-searchbox) {
    width: 90px !important;
  }
  :deep(.custom-refresh-button),
  :deep(.filter-button) {
    width: 24px !important;
    height: 24px !important;
  }
  :deep(.custom-refresh-button .dx-icon),
  :deep(.filter-button .dx-icon) {
    font-size: 11px !important;
  }
}
</style>
