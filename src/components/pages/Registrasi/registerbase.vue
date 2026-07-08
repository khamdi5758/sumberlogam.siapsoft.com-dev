<!-- components/RegisterBase.vue -->
<template>
  <div class="flex h-screen flex-col py-6 bg-gray-50">
    <!-- Loading -->
    <div
      v-if="isLoading"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"
      ></div>
    </div>

    <ReusableDataGrid
      ref="dgchildref"
      :dataSource="filteredData"
      :showBorders="false"
      :rowAlternationEnabled="false"
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
      :columnHidingEnabled="false"
      :summaries="sumcolom"
      :avg="avgcolom"
      :focusedRowKey="focusedRowKey"
      :wordwrap="false"
      :useBuiltInPager="true"
      :showGroupPanel="true"
      :allowGrouping="true"
      :height="'calc(100vh - 131px)'"
      @optionChanged="onDataGridOptionChanged"
      @focusedRowChanged="onFocusedRowChanged"
      @group-changed="onGroupChanged"
      @print-click="handlePrint"
    />

    <!-- Filter Popup -->
    <RegisterFilterPopup
      v-if="showFilter"
      :visible="showFilter"
      :title="title"
      :type="type"
      :initialStartDate="startDate"
      :initialEndDate="endDate"
      :initialGudang="selectedGudang"
      @apply="handleApplyFilter"
      @close="handleClosePopup"
    />
  </div>
</template>

<script>
import ReusableDataGrid from "@/components/widgets/DataGrid.vue";
import RegisterFilterPopup from "@/components/pages/Registrasi/RegisterPopup.vue";
import { mapGetters } from "vuex";
import api from "@/api";

export default {
  name: "RegisterBase",
  components: { ReusableDataGrid, RegisterFilterPopup },
  props: {
    title: { type: String, required: true },
    type: { type: String, required: true },
    storeModule: { type: String, required: true },
    apiEndpoint: { type: String, default: "report" },
  },
  data() {
    return {
      showFilter: true,
      startDate: "",
      endDate: "",
      selectedGudang: "",
      searchText: "",
      currentPage: 1,
      pageSize: 0,
      focusedRowKey: null,
      hasGroupedColumns: false,
    };
  },
  computed: {
    ...mapGetters({
      // kita akan akses getter dinamis via methods
    }),
    registerList() {
      return this.$store.getters[`${this.storeModule}/registerList`] || [];
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
      const list = Array.isArray(this.registerList) ? this.registerList : [];
      if (!this.searchText) return list;
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
        {
          location: "after",
          widget: "dxButton",
          locateInMenu: "never",
          options: {
            icon: "filter",
            hint: "Filter Data",
            elementAttr: { class: "filter-button" },
            onClick: () => {
              this.showFilter = true;
            },
          },
        },
      ];
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
      };
      // Cek apakah action ada
      const actionName = `${this.storeModule}/getRegister`;
      if (!this.$store._actions[actionName]) {
        console.warn(`Action ${actionName} not found, skipping loadData`);
        return Promise.resolve();
      }
      return this.$store.dispatch(actionName, payload).catch((err) => {
        console.error("Error loading data:", err);
      });
    },
    handleApplyFilter({ startDate, endDate, gudang }) {
      // Tutup popup segera
      this.showFilter = false;
      // Update data setelah popup tertutup
      this.startDate = startDate;
      this.endDate = endDate;
      this.selectedGudang = gudang;
      // Load data
      this.loadData();
    },
    handleClosePopup() {
      this.showFilter = false;
      console.log("Popup closed");
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
  },
  mounted() {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.startDate = this.formatDateLocal(first);
    this.endDate = this.formatDateLocal(last);
    // Tunggu sampai popup diproses baru load data
    this.$nextTick(() => {
      if (!this.registerList || this.registerList.length === 0) {
        this.loadData();
      }
    });
  },
};
</script>

<style scoped>
/* Copy style dari RegisterBeli.vue yang sudah ada */
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
</style>
