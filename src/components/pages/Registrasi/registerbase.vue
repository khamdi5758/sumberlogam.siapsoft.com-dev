<!-- components/RegisterBase.vue -->
<template>
  <div :class="layoutMode === 'paper' ? 'pl-report-container flex flex-col h-screen overflow-hidden' : 'flex h-screen flex-col py-6 bg-gray-50'">
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

    <!-- Header Section (Outside of Paper) -->
    <div v-show="currentLayoutMode === 'paper'" class="header-section">
      <div>
        <h2 class="report-title">{{ title }}</h2>
        <p class="report-subtitle">
          Periode: {{ formatDateRange }} | Cabang: Pusat
        </p>
      </div>
      <div class="action-buttons flex items-center gap-1.5">
        <DxButton
          icon="print"
          type="default"
          styling-mode="contained"
          class="print-btn"
          hint="Print Data"
          @click="printReport"
        />
        <DxButton
          icon="export"
          type="default"
          styling-mode="contained"
          class="export-btn"
          hint="Ekspor ke Excel"
          @click="exportToExcel"
        />
        <DxButton
          icon="fields"
          type="default"
          styling-mode="contained"
          class="fields-btn"
          hint="Toggle Grid/Paper Mode"
          @click="toggleLayoutMode"
        />
        <DxButton
          icon="refresh"
          type="default"
          styling-mode="contained"
          class="custom-refresh-button"
          hint="Muat ulang data"
          @click="handleRefresh"
        />
        <DxButton
          icon="filter"
          type="default"
          styling-mode="contained"
          class="filter-button"
          hint="Filter Data"
          @click="openFilter"
        />
        <!-- Zoom control -->
        <select
          v-model.number="userZoom"
          class="zoom-select"
          title="Zoom tampilan kertas"
        >
          <option :value="0.5">50%</option>
          <option :value="0.75">75%</option>
          <option :value="1">100%</option>
          <option :value="1.25">125%</option>
          <option :value="1.5">150%</option>
        </select>
      </div>
    </div>

    <!-- Paper Style Layout -->
    <div v-show="currentLayoutMode === 'paper'" class="jurnal-preview-container flex-1 overflow-y-auto pb-12">
      <div 
        v-for="(pageData, pageIdx) in pages" 
        :key="'page-' + pageIdx"
        :class="['jurnal-page-sheet mx-auto my-4', paperOrientation === 'landscape' ? 'landscape-page' : '']"
        :style="{ zoom: appliedZoom }"
      >
        <!-- Header inside paper sheet -->
        <div class="jurnal-print-header">
          <h3 class="jurnal-report-title">{{ title }}</h3>
          <p class="jurnal-report-subtitle">Periode : {{ formatDateRange }}</p>
        </div>

        <!-- Custom HTML Table -->
        <div class="flex-grow">
          <table class="jurnal-table">
            <thead>
              <tr>
                <th style="width: 45px; text-align: center; flex-shrink: 0;">No</th>
                <th 
                  v-for="col in paperColumns" 
                  :key="'th-' + col.dataField"
                  :class="col.alignment === 'right' ? 'text-right' : 'text-left'"
                  :style="{ width: manualWidths[col.dataField] || col.width }"
                  class="resizable-th"
                >
                  {{ col.caption }}
                  <div
                    class="resize-handle"
                    @mousedown.stop.prevent="startResize($event, col.dataField)"
                  ></div>
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-if="pageData.length > 0">
                <tr 
                  v-for="(row, rowIdx) in pageData" 
                  :key="'row-' + rowIdx"
                >
                  <td style="text-align: center; vertical-align: top;">
                    {{ getGlobalRowNumber(pageIdx, rowIdx) }}
                  </td>
                  <td 
                    v-for="col in paperColumns" 
                    :key="'cell-' + col.dataField"
                    :class="col.alignment === 'right' ? 'text-right' : 'text-left'"
                    style="vertical-align: top;"
                  >
                    {{ formatCellValue(row[col.dataField], col) }}
                  </td>
                </tr>
                
                <!-- Fill blank rows to align table height and footer -->
                <tr 
                  v-for="blankIdx in getBlankRowsCount(pageData, pageIdx)" 
                  :key="'blank-' + blankIdx"
                  class="jurnal-data-row-blank"
                >
                  <td style="text-align: center; vertical-align: top;">&nbsp;</td>
                  <td 
                    v-for="col in paperColumns" 
                    :key="'blank-cell-' + col.dataField"
                  >&nbsp;</td>
                </tr>
              </template>
              <template v-else>
                <tr>
                  <td :colspan="paperColumns.length + 1" class="text-center py-8 text-slate-400">
                    Tidak ada data ditemukan
                  </td>
                </tr>
              </template>
              
              <!-- Total Row (Only on the last page of the report) -->
              <tr v-if="pageIdx === pages.length - 1 && filteredData.length > 0 && (sumcolom.length > 0 || avgcolom.length > 0)" class="grand-total-row">
                <td style="text-align: center;"></td>
                <td 
                  v-for="(col, colIdx) in paperColumns" 
                  :key="'total-' + col.dataField"
                  :class="col.alignment === 'right' ? 'text-right' : 'text-left'"
                >
                  <span v-if="colIdx === 0" class="font-bold">TOTAL</span>
                  <span v-else-if="sumcolom.includes(col.dataField)" class="font-bold">
                    {{ formatTotalValue(col.dataField, col.decimals) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer inside paper sheet -->
        <div class="jurnal-print-footer">
          <span>Dicetak : {{ currentPrintTime }}</span>
          <span class="float-right">Halaman {{ pageIdx + 1 }} dari {{ pages.length }}</span>
        </div>
      </div>
    </div>

    <!-- Original Grid Mode -->
    <ReusableDataGrid
      v-show="currentLayoutMode !== 'paper'"
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
      :masterDetailEnabled="masterDetailEnabled"
      @group-changed="onGroupChanged"
      @print-click="handlePrint"
    >
      <template v-if="masterDetailEnabled" #master-detail="{ data }">
        <slot
          name="master-detail"
          :data="data"
          :filterData="filterData"
          :fullResponse="apiResponse"
          :isLoading="isLoading"
        ></slot>
      </template>
    </ReusableDataGrid>

    <!-- Filter Popup -->
    <slot
      name="filterPopup"
      :visible="showFilter"
      :apply="handleApplyFilter"
      :close="handleClosePopup"
      :isMobile="isMobile"
      :filterData="filterData"
    >
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
    </slot>
    
    <!-- Hidden container for measuring row heights in DOM -->
    <div 
      ref="hiddenMeasureContainer" 
      :style="{
        position: 'absolute', 
        left: '-9999px', 
        top: '-9999px', 
        width: paperOrientation === 'landscape' ? '267mm' : '180mm', 
        zoom: paperOrientation === 'landscape' ? 0.75 : 1,
        visibility: 'hidden'
      }"
    >
      <table class="jurnal-table">
        <thead>
          <tr>
            <th style="width: 45px; text-align: center; flex-shrink: 0;">No</th>
            <th 
              v-for="col in paperColumns" 
              :key="'measure-th-' + col.dataField"
              :class="col.alignment === 'right' ? 'text-right' : 'text-left'"
              :style="{ width: manualWidths[col.dataField] || col.width }"
            >
              {{ col.caption }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in filteredData" :key="'measure-' + idx" class="measure-row">
            <td style="text-align: center; vertical-align: top;">{{ idx + 1 }}</td>
            <td 
              v-for="col in paperColumns" 
              :key="'measure-cell-' + col.dataField"
              :class="col.alignment === 'right' ? 'text-right' : 'text-left'"
              style="vertical-align: top;"
            >
              {{ formatCellValue(row[col.dataField], col) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import ReusableDataGrid from "@/components/widgets/DataGrid.vue";
import RegisterFilterPopup from "@/components/pages/Registrasi/RegisterPopup.vue";
import DxButton from "devextreme-vue/button";
import { mapGetters } from "vuex";
import api from "@/api";

export default {
  name: "RegisterBase",
  components: { ReusableDataGrid, RegisterFilterPopup, DxButton },
  props: {
    title: { type: String, required: true },
    type: { type: String, required: true },
    storeModule: { type: String, required: true },
    apiEndpoint: { type: String, default: "report" },
    layoutMode: { type: String, default: "grid" },
    paperOrientation: { type: String, default: "portrait" },

    // Nama Vuex action untuk load data. Default "getRegister" (perilaku lama).
    loadAction: { type: String, default: "getRegister" },

    // (formData) => payload buat dispatch ke store.
    // Kalau tidak diisi, base pakai defaultBuildPayload (perilaku lama:
    // mulaitgl/sampaitgl/kodegdg/status).
    buildPayload: { type: Function, default: null },

    // (formData) => object payload buat request print/export via api.getbydata.
    // Kalau tidak diisi, base pakai defaultBuildPrintPayload (perilaku lama:
    // from/startDate/endDate/kodegdg).
    buildPrintPayload: { type: Function, default: null },

    // Aktifkan baris expandable (master-detail). Isi detail diberikan lewat
    // slot "master-detail" oleh komponen register yang memakai base ini.
    masterDetailEnabled: { type: Boolean, default: false },
  },
  data() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const lastDay = new Date(y, today.getMonth() + 1, 0).getDate();

    return {
      currentLayoutMode: this.layoutMode,
      gridColumns: null,
      showFilter: false,

      // Menyimpan formData APA ADANYA dari filter form (form apapun bentuknya).
      // Base tidak assume struktur field di dalamnya, kecuali default awal
      // startDate/endDate/status di bawah ini, yang dipakai popup default
      // (RegisterFilterPopup) supaya perilaku lama tetap jalan tanpa breaking change.
      filterData: {
        startDate: `${y}-${m}-01`,
        endDate: `${y}-${m}-${String(lastDay).padStart(2, "0")}`,
        gudang: "",
        status: "gabungan",
      },

      searchText: "",
      currentPage: 1,
      pageSize: 0,
      focusedRowKey: null,
      hasGroupedColumns: false,
      isMobile: false,
      computedPages: [],
      computedRowHeights: [],
      lastApiResponse: {},
      // Resizable columns
      manualWidths: {},
      _resizeField: null,
      _resizeStartX: 0,
      _resizeStartW: 0,
      // Zoom control
      userZoom: 1,
    };
  },
  created() {
    this._myRoutePath = this.$route.path;
    window.__registerVisited = window.__registerVisited || {};
    if (!window.__registerVisited[this.storeModule]) {
      this.showFilter = true;
      window.__registerVisited[this.storeModule] = true;
    }
  },

  unmounted() {
    const style = document.getElementById('landscape-print-style');
    if (style) {
      style.remove();
    }
    const activeTabs = this.$store.getters["tabs/getTabs"] || [];
    const isTabStillOpen = activeTabs.some(
      (path) => path.toLowerCase() === this._myRoutePath.toLowerCase(),
    );

    // Hanya hapus memori kunjungan jika tab-nya BENAR-BENAR ditutup (di-silang),
    // bukan sekadar di-unmount oleh keep-alive Vue Router.
    if (
      !isTabStillOpen &&
      window.__registerVisited &&
      window.__registerVisited[this.storeModule]
    ) {
      delete window.__registerVisited[this.storeModule];
    }
  },
  computed: {
    ...mapGetters({}),
    formatDateRange() {
      const options = { day: "numeric", month: "short", year: "numeric" };
      const start = this.filterData.startDate ? new Date(this.filterData.startDate) : new Date();
      const end = this.filterData.endDate ? new Date(this.filterData.endDate) : new Date();
      return `${start.toLocaleDateString("id-ID", options)} - ${end.toLocaleDateString("id-ID", options)}`;
    },
    // Zoom = user selection * landscape base (0.75) if applicable
    appliedZoom() {
      return this.paperOrientation === 'landscape'
        ? 0.75 * this.userZoom
        : this.userZoom;
    },
    currentPrintTime() {
      const d = new Date();
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    },
    apiResponse() {
      return this.lastApiResponse || {};

      console.log("apiResponse computed:", this.lastApiResponse);
    },
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
    ketsp() {
      return this.$store.getters[`${this.storeModule}/ketsp`] || "";
    },
    filteredData() {
      const list = Array.isArray(this.registerList) ? this.registerList : [];

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
      const items = [
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

      if (this.layoutMode === 'paper') {
        items.unshift({
          location: "after",
          widget: "dxButton",
          locateInMenu: "never",
          options: {
            icon: "doc",
            hint: "Switch to Paper Layout",
            elementAttr: { class: "fields-btn" },
            onClick: () => this.toggleLayoutMode(),
          },
        });
      }

      return items;
    },
    gridHeight() {
      return this.isMobile ? "calc(100vh - 180px)" : "calc(100vh - 131px)";
    },
    totalPages() {
      const size = this.pageSize || 20;
      const total = this.filteredData.length;
      return total > 0 ? Math.ceil(total / size) : 1;
    },
    maxLinesPerPage() {
      return this.paperOrientation === 'landscape' ? 19 : 30;
    },
    pages() {
      if (this.layoutMode !== 'paper') return [];
      if (this.computedPages && this.computedPages.length > 0) {
        return this.computedPages;
      }
      
      const list = this.filteredData;
      const pages = [];
      const maxWeight = this.paperOrientation === 'landscape' ? 19 : 30;
      
      let currentPage = [];
      let currentWeight = 0;

      list.forEach((item) => {
        const weight = this.getRowWeight(item);
        
        if (currentPage.length > 0 && currentWeight + weight > maxWeight) {
          pages.push(currentPage);
          currentPage = [];
          currentWeight = 0;
        }
        
        currentPage.push(item);
        currentWeight += weight;
      });
      
      if (currentPage.length > 0) {
        pages.push(currentPage);
      }
      
      if (pages.length === 0) {
        pages.push([]);
      }
      
      return pages;
    },
    paperColumns() {
      if (this.gridColumns && this.gridColumns.length > 0) {
        return this.gridColumns;
      }
      if (!this.filteredData || this.filteredData.length === 0) return [];
      
      const allKeysSet = new Set();
      this.filteredData.forEach((item) => {
        if (item && typeof item === "object") {
          Object.keys(item).forEach((key) => {
            const normalizedKey = key.toLowerCase().replace(/[\s_]/g, "");
            if (!["id", "keyindex", "pagetotal", "uuid", "rowversion"].includes(normalizedKey)) {
              allKeysSet.add(key);
            }
          });
        }
      });
      
      const allKeys = Array.from(allKeysSet);

      // Step 1: find raw max char length per column (caption vs data, whichever bigger)
      const rawLenMap = {};
      allKeys.forEach((key) => {
        const meta = this.parseFieldMeta(key);
        let max = (meta.caption || '').length;
        this.filteredData.forEach((row) => {
          if (row && row[key] !== null && row[key] !== undefined) {
            const len = String(row[key]).length;
            if (len > max) max = len;
          }
        });
        rawLenMap[key] = max;
      });

      // Step 2: apply min/max cap to get stable weight
      // min=8  → narrow cols (No, Qty, Sat) don't get crushed
      // max=35 → super-long text cols don't monopolise the table
      const MIN_W = 8;
      const MAX_W = 35;
      const weightMap = {};
      allKeys.forEach((key) => {
        weightMap[key] = Math.min(MAX_W, Math.max(MIN_W, rawLenMap[key]));
      });

      // Step 3: proportional % from capped weights
      const totalWeight = allKeys.reduce((s, k) => s + weightMap[k], 0);

      return allKeys.map((key) => {
        const meta = this.parseFieldMeta(key);
        const colAlignment = this.getColumnAlignment(key);
        const pct = totalWeight > 0
          ? `${((weightMap[key] / totalWeight) * 100).toFixed(2)}%`
          : `${(100 / allKeys.length).toFixed(2)}%`;

        return {
          dataField: key,
          caption: meta.caption,
          decimals: meta.decimals,
          alignment: colAlignment,
          width: pct,
        };
      });
    },
  },
  methods: {
    getRowWeight(item) {
      if (!item || typeof item !== 'object') return 1;
      
      let maxLines = 1;
      this.paperColumns.forEach((col) => {
        const val = item[col.dataField];
        if (val !== null && val !== undefined) {
          const str = val.toString();
          const len = str.length;
          
          let charLimit = 25; // default limit
          const field = (col.dataField || "").toLowerCase();
          
          if (field.includes("nobukti") || field.includes("no_po") || field.includes("po")) {
            charLimit = 11;
          } else if (field.includes("supplier") || field.includes("nama_supplier")) {
            charLimit = 16;
          } else if (field.includes("barang") || field.includes("nama_barang")) {
            charLimit = 22;
          } else if (field.includes("keterangan") || field.includes("ket")) {
            charLimit = 25;
          } else {
            charLimit = 30; // codes, numbers, dates
          }
          
          const lines = Math.ceil(len / charLimit) || 1;
          if (lines > maxLines) {
            maxLines = lines;
          }
        }
      });

      if (maxLines >= 3) return 2.2;
      if (maxLines === 2) return 1.6;
      return 1.0;
    },
    getBlankRowsCount(pageData, pageIdx) {
      if (!pageData) return 0;
      // Only fill blank rows on the last page
      if (pageIdx !== this.pages.length - 1) return 0;
      
      const allPages = this.computedPages;
      if (!allPages || allPages.length === 0) return 0;
      
      // Calculate the target number of rows (= max rows on any non-last page)
      // This represents the fullest page, so we match it for the last page
      let targetRows;
      if (allPages.length > 1) {
        // Use the maximum row count from all pages except the last
        targetRows = allPages
          .slice(0, allPages.length - 1)
          .reduce((max, pg) => Math.max(max, pg.length), 0);
      } else {
        // Only one page: use the data itself as target (no blanks needed)
        return 0;
      }
      
      const hasTotalRow = this.filteredData.length > 0 &&
                          (this.sumcolom.length > 0 || this.avgcolom.length > 0);
      // Reserve 1 slot for the total row if present
      const usableTarget = hasTotalRow ? targetRows - 1 : targetRows;
      
      const remaining = usableTarget - pageData.length;
      return remaining > 0 ? remaining : 0;
    },
    parseFieldMeta(key) {
      let caption = (key || "").toString();
      let hasDec = false;
      let stripped = true;

      while (stripped) {
        stripped = false;
        if (caption.startsWith("dec")) {
          hasDec = true;
          caption = caption.substring(3);
          stripped = true;
        } else if (caption.startsWith("sum") || caption.startsWith("avg")) {
          caption = caption.substring(3);
          stripped = true;
        }
      }

      // Add spaces before capital letters to make it human readable
      let formattedCaption = caption.replace(/([A-Z])/g, " $1").trim();
      // Capitalize first letter of each word
      formattedCaption = formattedCaption.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

      return { caption: formattedCaption, decimals: hasDec ? 2 : 0 };
    },
    getColumnAlignment(key) {
      const lower = key.toLowerCase();
      if (
        lower.includes("qty") ||
        lower.includes("jumlah") ||
        lower.includes("harga") ||
        lower.includes("total") ||
        lower.includes("ppn") ||
        lower.includes("potongan") ||
        lower.includes("diskon") ||
        lower.includes("nilai") ||
        lower.includes("debet") ||
        lower.includes("kredit") ||
        lower.includes("saldo") ||
        lower.startsWith("sum") ||
        lower.startsWith("avg") ||
        lower.startsWith("dec")
      ) {
        return "right";
      }
      return "left";
    },
    getGlobalRowNumber(pageIdx, rowIdx) {
      // Sum the actual row counts from all previous pages using computedPages
      const previousCount = this.computedPages
        .slice(0, pageIdx)
        .reduce((sum, pg) => sum + pg.length, 0);
      return previousCount + rowIdx + 1;
    },
    formatCellValue(val, col) {
      if (val === null || val === undefined) return "";
      
      const isDate = col.dataField.toLowerCase().includes("tgl") || col.dataField.toLowerCase().includes("tanggal") || col.dataField.toLowerCase().includes("date");
      if (isDate && val) {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          return this.formatShortDate(d);
        }
      }
      
      if (col.alignment === "right" || typeof val === "number" || col.decimals > 0) {
        const num = Number(val);
        if (!isNaN(num)) {
          return num.toLocaleString("id-ID", {
            minimumFractionDigits: col.decimals,
            maximumFractionDigits: col.decimals
          });
        }
      }
      
      return val;
    },
    formatShortDate(date) {
      if (!date) return "";
      const d = new Date(date);
      if (isNaN(d.getTime())) return "";
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = String(d.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    },
    formatTotalValue(dataField, decimals) {
      if (!this.filteredData || this.filteredData.length === 0) return "0";
      
      const total = this.filteredData.reduce((sum, item) => {
        const val = Number(item[dataField] || 0);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
      
      return total.toLocaleString("id-ID", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    },
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

    // Payload default (perilaku lama) - dipakai kalau prop buildPayload tidak diisi.
    defaultBuildPayload(data) {
      return {
        mulaitgl: this.formatDateForSp(data.startDate, false),
        sampaitgl: this.formatDateForSp(data.endDate, true),
        kodegdg: data.gudang || "",
        status: data.status,
      };
    },

    // Payload print default (perilaku lama) - dipakai kalau prop buildPrintPayload kosong.
    defaultBuildPrintPayload(data) {
      return {
        from: this.type,
        startDate: data.startDate,
        endDate: data.endDate,
        kodegdg: data.gudang,
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
      return this.$store.dispatch(actionName, payload).then((res) => {
        // Simpan response.data (payload sebenarnya) kalau tersedia,
        // fallback ke res jika tidak ada data.
        if (res) {
          this.lastApiResponse = res.data || res;
        }
        return res;
      })
        .catch((err) => {
          console.error("Error loading data:", err);
        });
    },

    // Dipertahankan untuk backward compatibility, kalau ada pemanggil lama
    // yang masih mengirim { startDate, endDate, gudang, status } langsung.
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
    exportToPDF() {
      window.print();
    },
    printReport() {
      window.print();
    },
    openFilter() {
      this.showFilter = true;
    },
    toggleLayoutMode() {
      if (this.currentLayoutMode === 'paper') {
        this.currentLayoutMode = 'grid';
        this.$nextTick(() => {
          try {
            const grid = this.$refs.dgchildref?.getInstance();
            if (grid) {
              grid.updateDimensions();
              grid.repaint();
            }
          } catch (e) {}
        });
      } else {
        this.updatePaperColumns();
        this.currentLayoutMode = 'paper';
      }
    },
    exportToExcel() {
      try {
        const gridRef = this.$refs.dgchildref;
        if (gridRef) {
          gridRef.exportToExcel();
        }
      } catch (err) {
        console.error("Export Excel error:", err);
      }
    },
    updatePaperColumns() {
      try {
        const grid = this.$refs.dgchildref?.getInstance();
        if (grid) {
          const cols = grid.getVisibleColumns();
          const validCols = cols.filter(col => col.dataField && !col.command && col.visible !== false);
          if (validCols.length > 0) {
            this.gridColumns = validCols.map(col => {
              const meta = this.parseFieldMeta(col.dataField);
              return {
                dataField: col.dataField,
                caption: col.caption || meta.caption,
                decimals: col.decimals ?? meta.decimals,
                alignment: col.alignment || this.getColumnAlignment(col.dataField)
              };
            });
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to get visible columns from grid:", e);
      }
      this.gridColumns = null;
    },

    onGroupChanged(groupInfo) {
      this.hasGroupedColumns = groupInfo.hasGroups;
    },
    onDataGridOptionChanged(e) {
      if (e.name === "pageIndex") this.currentPage = e.value + 1;
      else if (e.name === "pageSize") this.pageSize = e.value;
      else if (e.name === "searchPanel" && e.fullName === "searchPanel.text")
        this.searchText = e.value || "";

      if (e.name === "columns" || e.fullName?.startsWith("columns")) {
        this.updatePaperColumns();
      }
    },
    onFocusedRowChanged(e) {
      this.focusedRowKey = e.row ? e.row.key : null;
    },
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
    },
    triggerPagination() {
      if (this.currentLayoutMode !== 'paper') return;
      this.$nextTick(() => {
        setTimeout(() => {
          const container = this.$refs.hiddenMeasureContainer;
          if (!container) return;
          
          const rows = container.querySelectorAll('.measure-row');
          const heights = Array.from(rows).map(el => el.offsetHeight);
          this.paginateDataByHeights(heights);
        }, 100);
      });
    },
    // ── Resizable columns ──────────────────────────────────────────────────
    startResize(event, dataField) {
      // Find the th element from the event target's parent
      const th = event.target.closest('th');
      if (!th) return;
      this._resizeField  = dataField;
      this._resizeStartX = event.pageX;
      this._resizeStartW = th.offsetWidth;
      this._resizeMoveHandler = this.doResize.bind(this);
      this._resizeUpHandler   = this.stopResize.bind(this);
      window.addEventListener('mousemove', this._resizeMoveHandler);
      window.addEventListener('mouseup',   this._resizeUpHandler);
    },
    doResize(event) {
      if (!this._resizeField) return;
      const delta    = event.pageX - this._resizeStartX;
      const newWidth = Math.max(30, this._resizeStartW + delta);
      // Vue reactive update: spread to trigger reactivity
      this.manualWidths = { ...this.manualWidths, [this._resizeField]: `${newWidth}px` };
    },
    stopResize() {
      window.removeEventListener('mousemove', this._resizeMoveHandler);
      window.removeEventListener('mouseup',   this._resizeUpHandler);
      this._resizeField = null;
      // Re-paginate: manual width change may cause text to wrap/unwrap
      this.$nextTick(() => {
        setTimeout(() => this.triggerPagination(), 50);
      });
    },
    paginateDataByHeights(heights) {
      const pages = [];
      let currentPage = [];
      let currentHeight = 0;
      const maxHeight = this.paperOrientation === 'landscape' ? 560 : 810;
      const hasTotalRow = this.filteredData.length > 0 && (this.sumcolom.length > 0 || this.avgcolom.length > 0);
      
      this.filteredData.forEach((item, idx) => {
        const rowHeight = heights[idx] || 27;
        const isLastItem = idx === this.filteredData.length - 1;
        
        let extraHeight = 0;
        if (isLastItem && hasTotalRow) {
          extraHeight = 32;
        }
        
        if (currentPage.length > 0 && currentHeight + rowHeight + extraHeight > maxHeight) {
          pages.push(currentPage);
          currentPage = [];
          currentHeight = 0;
        }
        
        currentPage.push(item);
        currentHeight += rowHeight;
      });
      
      if (currentPage.length > 0) {
        pages.push(currentPage);
      }
      
      if (pages.length === 0) {
        pages.push([]);
      }
      
      this.computedPages = pages;
      this.computedRowHeights = heights;
    },
  },
  mounted() {
    this.checkMobile();
    window.addEventListener("resize", this.checkMobile);

    if (this.currentLayoutMode === 'paper' && this.paperOrientation === 'landscape') {
      const style = document.createElement('style');
      style.id = 'landscape-print-style';
      style.innerHTML = `@media print { @page { size: A4 landscape; } }`;
      document.head.appendChild(style);
    }

    this.$nextTick(() => {
      if (!this.registerList || this.registerList.length === 0) {
        // this.loadData();
      }
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.checkMobile);
  },
  watch: {
    ketsp(a) {
      console.log("ketsp changed:", a);
    },
    filteredData: {
      handler() {
        this.triggerPagination();
      },
      immediate: true
    },
    paperColumns() {
      this.triggerPagination();
    },
    paperOrientation() {
      this.triggerPagination();
    },
    currentLayoutMode(newMode) {
      this.triggerPagination();
      const existingStyle = document.getElementById('landscape-print-style');
      if (newMode === 'paper' && this.paperOrientation === 'landscape') {
        if (!existingStyle) {
          const style = document.createElement('style');
          style.id = 'landscape-print-style';
          style.innerHTML = `@media print { @page { size: A4 landscape; } }`;
          document.head.appendChild(style);
        }
      } else {
        if (existingStyle) {
          existingStyle.remove();
        }
      }
    }
  }
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

:deep(.print-btn),
:deep(.export-btn),
:deep(.fields-btn) {
  background-color: #337ab7 !important;
  border-color: #337ab7 !important;
  color: white !important;
  transition: all 0.2s ease !important;
  width: 33px !important;
  height: 33px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
:deep(.print-btn:hover),
:deep(.export-btn:hover),
:deep(.fields-btn:hover) {
  background-color: #286090 !important;
  border-color: #204d74 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(51, 122, 183, 0.3) !important;
}
:deep(.print-btn:active),
:deep(.export-btn:active),
:deep(.fields-btn:active) {
  transform: scale(0.95) !important;
  background-color: #204d74 !important;
}
:deep(.print-btn .dx-icon),
:deep(.export-btn .dx-icon),
:deep(.fields-btn .dx-icon) {
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
  :deep(.print-btn),
  :deep(.export-btn),
  :deep(.fields-btn) {
    width: 28px !important;
    height: 28px !important;
  }
  :deep(.print-btn .dx-icon),
  :deep(.export-btn .dx-icon),
  :deep(.fields-btn .dx-icon) {
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
  :deep(.print-btn),
  :deep(.export-btn),
  :deep(.fields-btn) {
    width: 24px !important;
    height: 24px !important;
  }
  :deep(.print-btn .dx-icon),
  :deep(.export-btn .dx-icon),
  :deep(.fields-btn .dx-icon) {
    font-size: 11px !important;
  }
}

/* Jurnal/Paper Preview CSS */
.pl-report-container {
  padding: 24px;
  background-color: #f1f5f9;
  min-height: 100vh;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 4px;
}

.report-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a1d20;
}

.report-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #6c757d;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.zoom-select {
  height: 33px;
  padding: 0 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: #ffffff;
  color: #1a1d20;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}

.zoom-select:hover {
  border-color: #6366f1;
}

.zoom-select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.jurnal-preview-container {
  background-color: #f1f5f9; /* Slate-100 */
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  overflow-y: auto;
  min-height: 600px;
}

.jurnal-page-sheet {
  background-color: #ffffff;
  width: 210mm;
  min-height: 297mm;
  padding: 20mm 15mm;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}

.jurnal-page-sheet.landscape-page {
  width: 297mm;
  min-height: 210mm;
  padding: 10mm 15mm;
  zoom: 0.75;
}

.jurnal-print-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.jurnal-report-title {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #000000 !important;
  margin: 0 0 4px 0;
  text-transform: uppercase;
}

.jurnal-report-subtitle {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  color: #000000 !important;
  margin: 0;
}

.jurnal-print-footer {
  margin-top: 1.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
  font-size: 11px;
  color: #64748b;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* Style adjustment for dx-datagrid in paper style */
.jurnal-page-sheet :deep(.dx-datagrid) {
  background-color: transparent !important;
}

.jurnal-page-sheet :deep(.dx-datagrid-headers) {
  background-color: #f8fafc !important;
  color: #0f172a !important;
  font-weight: bold;
  border-bottom: 2px solid #cbd5e1 !important;
}

.jurnal-page-sheet :deep(.dx-datagrid-rowsview .dx-row) {
  border-bottom: 1px solid #e2e8f0 !important;
}

/* Jurnal/Paper-style table styles */
.jurnal-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 11px;
  color: #000000 !important;
  margin-top: 10px;
}

.jurnal-table th,
.jurnal-table td {
  word-break: normal;
  overflow-wrap: normal;
  overflow: hidden;
}

/* Resizable column header */
.jurnal-table th.resizable-th {
  position: relative;
  user-select: none;
}

.jurnal-table th .resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  cursor: col-resize;
  background: transparent;
  z-index: 1;
}

.jurnal-table th .resize-handle:hover,
.jurnal-table th .resize-handle:active {
  background: rgba(99, 102, 241, 0.5);
}

.jurnal-table th {
  border-top: 1px solid #000000;
  border-bottom: 1px solid #000000;
  padding: 4px 2px;
  font-weight: bold;
  color: #000000 !important;
}

.jurnal-table td {
  padding: 4px 2px;
  vertical-align: top;
  border-bottom: 1px dashed #e2e8f0;
  color: #000000 !important;
}

.jurnal-table tr.grand-total-row td {
  border-top: 1px solid #000000;
  border-bottom: 4px double #000000;
  font-weight: bold;
  font-size: 12px;
}

@media print {
  .header-section {
    display: none !important;
  }
  
  .jurnal-preview-container {
    background-color: transparent !important;
    padding: 0 !important;
    gap: 0 !important;
    display: block !important;
    overflow: visible !important;
  }

  .jurnal-page-sheet {
    width: 100% !important;
    min-height: auto !important;
    height: 297mm !important;
    padding: 10mm !important;
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
    page-break-after: always !important;
    break-after: page !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    box-sizing: border-box !important;
  }

  .jurnal-page-sheet.landscape-page {
    width: 297mm !important;
    height: 210mm !important;
    min-height: auto !important;
    padding: 10mm !important;
    zoom: 1 !important;
  }

  .jurnal-print-footer {
    border-top: 1px solid #000000 !important;
    color: #000000 !important;
  }
}
</style>
