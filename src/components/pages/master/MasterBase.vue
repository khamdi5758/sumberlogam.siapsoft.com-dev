<!-- components/pages/master/MasterBase.vue -->
<template>
  <div
    ref="masterBaseRoot"
    class="flex h-screen flex-col py-6 bg-gray-50"
    @wheel="handleGridWheel"
  >
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

    <!-- Header Section 
    <div class="header-section px-4 pb-3">
      <div>
        <h2 class="report-title">{{ title }}</h2>
        <p class="report-subtitle" v-if="subtitle">{{ subtitle }}</p>
      </div>
      <div class="action-buttons flex items-center gap-1.5">
        <DxButton
          icon="refresh"
          type="default"
          styling-mode="contained"
          class="custom-refresh-button"
          hint="Muat ulang data"
          @click="handleRefresh"
        />
        <DxButton
          v-if="showFilterButton"
          icon="filter"
          type="default"
          styling-mode="contained"
          class="filter-button"
          hint="Filter Data"
          @click="openFilter"
        />
      </div>
    </div> -->

    <!-- Data Grid -->
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
      :spFooterText="ketsp"
      :showFilterPanel="true"
      @optionChanged="onDataGridOptionChanged"
      @focusedRowChanged="onFocusedRowChanged"
      @group-changed="onGroupChanged"
      @print-click="handlePrint"
    />

    <!-- Filter Popup Slot -->
    <slot
      name="filterPopup"
      :visible="showFilter"
      :apply="handleApplyFilter"
      :close="handleClosePopup"
      :isMobile="isMobile"
      :filterData="filterData"
    />
  </div>
</template>

<script>
import ReusableDataGrid from "@/components/widgets/DataGrid.vue";
import DxButton from "devextreme-vue/button";
import { mapGetters } from "vuex";
import api from "@/api";

export default {
  name: "MasterBase",
  components: { ReusableDataGrid, DxButton },
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    type: { type: String, required: true },
    storeModule: { type: String, required: true },
    apiEndpoint: { type: String, default: "report" },
    loadAction: { type: String, default: "getbarang" },
    buildPayload: { type: Function, default: null },
    buildPrintPayload: { type: Function, default: null },
    showFilterButton: { type: Boolean, default: false },
  },
  data() {
    return {
      showFilter: false,
      filterData: {},
      searchText: "",
      currentPage: 1,
      pageSize: 0,
      focusedRowKey: null,
      hasGroupedColumns: false,
      isMobile: false,
      lastApiResponse: {},
    };
  },
  created() {
    this._myRoutePath = this.$route.path;
    window.__masterVisited = window.__masterVisited || {};
    if (!window.__masterVisited[this.storeModule]) {
      if (this.showFilterButton) {
        this.showFilter = true;
      }
      window.__masterVisited[this.storeModule] = true;
    }
  },
  unmounted() {
    const activeTabs = this.$store.getters["tabs/getTabs"] || [];
    const isTabStillOpen = activeTabs.some(
      (path) => path.toLowerCase() === this._myRoutePath.toLowerCase(),
    );
    if (
      !isTabStillOpen &&
      window.__masterVisited &&
      window.__masterVisited[this.storeModule]
    ) {
      delete window.__masterVisited[this.storeModule];
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
    ketsp() {
      return this.$store.getters[`${this.storeModule}/ketsp`] || "";
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
      ];
    },
    gridHeight() {
      return this.isMobile ? "calc(100vh - 180px)" : "calc(100vh - 131px)";
    },
  },
  methods: {
    defaultBuildPayload(data) {
      return data || {};
    },
    defaultBuildPrintPayload(data) {
      return {
        from: this.type,
        ...data,
      };
    },
    loadData() {
      const payload = this.buildPayload
        ? this.buildPayload(this.filterData)
        : this.defaultBuildPayload(this.filterData);

      const actionName = `${this.storeModule}/${this.loadAction}`;
      if (!this.$store._actions[actionName]) {
        console.warn(`Action ${actionName} not found, skipping loadData`);
        return Promise.resolve();
      }
      return this.$store
        .dispatch(actionName, payload)
        .then((res) => {
          if (res) {
            this.lastApiResponse = res.data || res;
          }
          return res;
        })
        .catch((err) => {
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
    handleRefresh() {
      this.loadData();
    },
    async handlePrint() {
      try {
        const printPayload = this.buildPrintPayload
          ? this.buildPrintPayload(this.filterData)
          : this.defaultBuildPrintPayload(this.filterData);
        const res = await api.getbydata(this.apiEndpoint, printPayload);
        const url = res.data.url;
        window.open(url, "_blank");
      } catch (err) {
        console.error("Print error:", err);
      }
    },
    openFilter() {
      this.showFilter = true;
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
    // Geser grid horizontal pakai mousepad/trackpad (deltaX) atau Shift+wheel (deltaY).
    // Handler ada di komponen Master ini saja — widget DataGrid tidak diubah,
    // jadi behavior Register/modul lain tetap sama.
    handleGridWheel(event) {
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.shiftKey
            ? event.deltaY
            : 0;

      if (!delta) return;

      const root = this.$refs.masterBaseRoot;
      if (!root) return;

      // Cari rowsview milik grid di dalam komponen ini
      const rowsView = event.target?.closest
        ? event.target.closest(".dx-datagrid-rowsview")
        : null;
      if (!rowsView || !root.contains(rowsView)) return;

      // DevExtreme non-native scrollable menyimpan container di dalam rowsview
      const container =
        rowsView.querySelector(".dx-scrollable-container") || rowsView;

      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) return;

      event.preventDefault();
      container.scrollLeft = Math.max(
        0,
        Math.min(maxScroll, container.scrollLeft + delta),
      );
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
  beforeUnmount() {
    window.removeEventListener("resize", this.checkMobile);
  },
};
</script>

<style scoped>
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

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.report-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1d20;
}

.report-subtitle {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #6c757d;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

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
