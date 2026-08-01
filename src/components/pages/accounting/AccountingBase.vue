<template>
  <div class="pl-report-container">
    <!-- UI/UX: Header dengan filter yang jelas dan tidak memakan tempat -->
    <div class="header-section">
      <div>
        <h2 class="report-title">{{ title }}</h2>
        <p class="report-subtitle">
          Periode: {{ formatDateRange }} | Cabang: Pusat
        </p>
      </div>
      <div class="action-buttons">
        <DxButton
          icon="exportpdf"
          text="Export PDF"
          type="default"
          styling-mode="outlined"
          @click="exportToPDF"
        />
        <DxButton
          icon="print"
          text="Print"
          type="default"
          @click="printReport"
        />
        <DxButton
          icon="filter"
          text="Filter"
          type="default"
          @click="openFilter"
        />
      </div>
    </div>

    <!-- UI/UX: Card putih bersih untuk memberikan fokus pada angka -->
    <div v-if="hasBeenFiltered" :class="type === 'jurnal' ? 'jurnal-preview-outer' : 'card-box'">
      <!-- Kondisi Jurnal: Render PDF-style A4 Preview -->
      <template v-if="type === 'jurnal'">
        <div v-if="dataSource.length === 0" class="no-data-jurnal">
          Tidak ada data jurnal untuk periode ini.
        </div>
        <div v-else class="jurnal-preview-container">
          <div
            v-for="(pageTransactions, pageIdx) in jurnalPages"
            :key="pageIdx"
            class="jurnal-page-sheet"
          >
            <!-- Header -->
            <div class="jurnal-print-header">
              <h3 class="jurnal-report-title">{{ reportTitle }}</h3>
              <p class="jurnal-report-subtitle">Periode : {{ reportPeriod }}</p>
            </div>

            <!-- Table Container -->
            <div class="jurnal-table-wrapper">
              <table class="jurnal-table">
                <thead>
                  <tr>
                    <th style="width: 5%">No</th>
                    <th style="width: 10%">Tanggal</th>
                    <th style="width: 45%">No Bukti/Keterangan</th>
                    <th style="width: 25%">Perkiraan</th>
                    <th style="width: 7.5%" class="text-right">Debet</th>
                    <th style="width: 7.5%" class="text-right">Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(tx, txIdx) in pageTransactions" :key="tx.Nobukti">
                    <tr
                      v-for="(detail, detIdx) in tx.details"
                      :key="detail.id || detIdx"
                      :class="{ 'transaction-divider': detIdx === tx.details.length - 1 }"
                    >
                      <td>
                        <span v-if="detIdx === 0">{{ getGlobalIndex(pageIdx, txIdx) }}.</span>
                      </td>
                      <td>
                        <span v-if="detIdx === 0">{{ formatShortDate(tx.tanggal) }}</span>
                      </td>
                      <td class="text-left">
                        <span v-if="detIdx === 0" class="font-bold">{{ tx.Nobukti }}</span>
                        <span v-else class="pl-4 text-slate-600 block italic text-xs">{{ detail.keterangan }}</span>
                      </td>
                      <td class="text-left font-sans">
                        <span>{{ detail.perkiraan }} - {{ detail.NamaAkun }}</span>
                      </td>
                      <td class="text-right font-sans">
                        <span>{{ formatCurrencyID(detail.Debet) }}</span>
                      </td>
                      <td class="text-right font-sans">
                        <span>{{ formatCurrencyID(detail.kredit) }}</span>
                      </td>
                    </tr>
                  </template>

                  <!-- Grand Total (Only on the last page) -->
                  <tr v-if="pageIdx === jurnalPages.length - 1" class="grand-total-row">
                    <td colspan="4" class="text-right font-bold py-2">
                      GRAND TOTAL :
                    </td>
                    <td class="text-right font-bold py-2">
                      {{ formatCurrencyID(grandTotalDebet) }}
                    </td>
                    <td class="text-right font-bold py-2">
                      {{ formatCurrencyID(grandTotalKredit) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Footer -->
            <div class="jurnal-print-footer">
              <div class="flex justify-between">
                <span>Dicetak: {{ currentPrintTime }}</span>
                <span>Halaman {{ pageIdx + 1 }} dari {{ jurnalPages.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <DxTreeList
        v-else
        id="profit-loss-tree"
        :data-source="processedDataSource"
        key-expr="id"
        parent-id-expr="parentId"
        :show-row-lines="true"
        :show-borders="false"
        :column-auto-width="true"
        :expanded-row-keys="expandedKeys"
        @row-expanded="onRowExpanded"
        @row-collapsed="onRowCollapsed"
      >
        <DxTreeColumn
          data-field="accountName"
          caption="Keterangan"
          cell-template="nameTemplate"
        />

        <DxTreeColumn
          data-field="amount"
          caption="Bulan Ini"
          alignment="right"
          width="150"
          cell-template="amountBulanIniTemplate"
        />

        <DxTreeColumn
          data-field="amountBulanLalu"
          caption="Bulan Lalu"
          alignment="right"
          width="150"
          cell-template="amountBulanLaluTemplate"
        />

        <DxTreeColumn
          caption="S/d Bulan Ini"
          alignment="right"
          width="150"
          cell-template="amountTotalTemplate"
        />

        <template #nameTemplate="{ data }">
          <span :class="getRowClass(data.data)">
            {{ data.data.accountName }}
          </span>
        </template>

        <!-- Template amount Bulan Ini -->
        <template #amountBulanIniTemplate="{ data }">
          <span :class="getRowClass(data.data)">
            {{
              shouldShowAmount(data.data)
                ? formatCurrency(data.data.amount || 0)
                : ""
            }}
          </span>
        </template>

        <!-- Template amount Bulan Lalu -->
        <template #amountBulanLaluTemplate="{ data }">
          <span :class="getRowClass(data.data)">
            {{
              shouldShowAmount(data.data)
                ? formatCurrency(data.data.amountBulanLalu || 0)
                : ""
            }}
          </span>
        </template>

        <!-- Template amount Total (S/d Bulan Ini) -->
        <template #amountTotalTemplate="{ data }">
          <span :class="getRowClass(data.data)">
            {{
              shouldShowAmount(data.data)
                ? formatCurrency((data.data.amount || 0) + (data.data.amountBulanLalu || 0))
                : ""
            }}
          </span>
        </template>
      </DxTreeList>
    </div>

    <AccountingPopup
      ref="popupRef"
      :title="popupTitle || title"
      :type="type"
      :submit-button-text="submitButtonText"
      @on-filter-apply="handleFilterApply"
    />

    <div class="sp-footer-hidden">
      {{ spFooterText }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { DxTreeList, DxColumn as DxTreeColumn } from "devextreme-vue/tree-list";
import {
  DxDataGrid,
  DxColumn as DxGridColumn,
  DxSummary,
  DxTotalItem,
} from "devextreme-vue/data-grid";
import DxButton from "devextreme-vue/button";
import AccountingPopup from "./AccountingPopup.vue";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  popupTitle: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    required: true,
  },
  dataSource: {
    type: Array,
    required: true,
  },
  defaultExpandedKeys: {
    type: Array,
    default: () => [],
  },
  autoOpenFilter: {
    type: Boolean,
    default: false,
  },
  showContentInitially: {
    type: Boolean,
    default: true,
  },
  submitButtonText: {
    type: String,
    default: "Terapkan Filter",
  },
});

const emit = defineEmits(["filter-change"]);

const store = useStore();
const route = useRoute();
const myRoutePath = route.path;

window.__accountingVisited = window.__accountingVisited || {};
const isVisited = !!window.__accountingVisited[props.type];

const popupRef = ref(null);
const startDate = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
const endDate = ref(new Date());

const expandedKeys = ref([...props.defaultExpandedKeys]);
const hasBeenFiltered = ref(props.showContentInitially || isVisited);

const spFooterText = computed(() => {
  if (!props.type) return "";
  try {
    return store.getters[`${props.type}/ketsp`] || "";
  } catch (e) {
    return "";
  }
});

const formatDateRange = computed(() => {
  const options = { day: "numeric", month: "short", year: "numeric" };
  return `${startDate.value.toLocaleDateString("id-ID", options)} - ${endDate.value.toLocaleDateString("id-ID", options)}`;
});

const jurnalDataSource = computed(() => {
  if (props.type !== "jurnal") return [];
  return props.dataSource.map((item, index) => ({
    ...item,
    id: item.id !== undefined ? item.id : index,
  }));
});

const transformToTree = (flatData) => {
  if (!Array.isArray(flatData) || flatData.length === 0) return [];
  
  if (flatData[0] && flatData[0].id !== undefined && flatData[0].parentId !== undefined) {
    return flatData;
  }
  
  const tree = [];
  const registeredGroups = new Map();
  let nextId = 1;

  flatData.forEach((item) => {
    // Key-agnostic resolution
    const perkiraanVal = item.perkiraan !== undefined ? item.perkiraan : item.Perkiraan;
    const keteranganVal = item.Keterangan !== undefined ? item.Keterangan : (item.keterangan !== undefined ? item.keterangan : item.accountName);
    
    // Group 1 resolution (e.g. nmgroup1 or NamaHeader)
    let grp1Key = item.nmgroup1 || item.NamaHeader;
    if (!grp1Key && item.Header) {
      grp1Key = item.Header;
    }
    if (!grp1Key) {
      grp1Key = "Lain-lain";
    }

    let grp1Id;
    if (!registeredGroups.has(grp1Key)) {
      grp1Id = nextId++;
      registeredGroups.set(grp1Key, grp1Id);
      tree.push({
        id: grp1Id,
        parentId: 0,
        accountName: grp1Key,
        amount: 0,
        amountBulanLalu: 0,
        type: "header"
      });
    } else {
      grp1Id = registeredGroups.get(grp1Key);
    }

    // Group 2 resolution (e.g. NamaGrpAcc or Header)
    let grp2KeyName = item.NamaGrpAcc || item.Header || String(item.KodeGrpAcc || "");
    if (!grp2KeyName) {
      grp2KeyName = "Detail";
    }
    const grp2Key = `${grp1Key}_${grp2KeyName}`;
    
    let grp2Id;
    if (!registeredGroups.has(grp2Key)) {
      grp2Id = nextId++;
      registeredGroups.set(grp2Key, grp2Id);
      tree.push({
        id: grp2Id,
        parentId: grp1Id,
        accountName: grp2KeyName,
        amount: 0,
        amountBulanLalu: 0,
        type: "header"
      });
    } else {
      grp2Id = registeredGroups.get(grp2Key);
    }

    // Amount resolution:
    let amountVal = 0;
    if (item.Jumlah !== undefined) amountVal = Number(item.Jumlah);
    else if (item.Perhitungan !== undefined) amountVal = Number(item.Perhitungan);
    else if (item.SaldoAkhirD !== undefined) amountVal = Number(item.SaldoAkhirD);
    else if (item.NeracaSaldoAkD !== undefined) amountVal = Number(item.NeracaSaldoAkD);

    let amountBulanLaluVal = 0;
    if (item.JumlahBulanLalu !== undefined) amountBulanLaluVal = Number(item.JumlahBulanLalu);
    else if (item.PerhitunganBulanLalu !== undefined) amountBulanLaluVal = Number(item.PerhitunganBulanLalu);
    else if (item.SaldoAkhirK !== undefined) amountBulanLaluVal = Number(item.SaldoAkhirK);
    else if (item.NeracaSaldoAkK !== undefined) amountBulanLaluVal = Number(item.NeracaSaldoAkK);

    tree.push({
      id: nextId++,
      parentId: grp2Id,
      accountName: `${perkiraanVal ? perkiraanVal + ' - ' : ''}${keteranganVal || ''}`,
      amount: amountVal,
      amountBulanLalu: amountBulanLaluVal,
      type: "detail"
    });

    const parent1 = tree.find(node => node.id === grp1Id);
    if (parent1) {
      parent1.amount += amountVal;
      parent1.amountBulanLalu += amountBulanLaluVal;
    }
    const parent2 = tree.find(node => node.id === grp2Id);
    if (parent2) {
      parent2.amount += amountVal;
      parent2.amountBulanLalu += amountBulanLaluVal;
    }
  });

  return tree;
};

const processedDataSource = computed(() => {
  if (props.type === "jurnal") return [];
  return transformToTree(props.dataSource);
});

// Jurnal Specific Computations & Helpers
const formatCurrencyID = (value) => {
  const num = Number(value || 0);
  return num.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

const groupedTransactions = computed(() => {
  if (props.type !== "jurnal") return [];
  
  const groups = {};
  props.dataSource.forEach((item) => {
    const key = item.Nobukti;
    if (!groups[key]) {
      groups[key] = {
        Nobukti: item.Nobukti,
        tanggal: item.tanggal,
        JenisLaporan: item.JenisLaporan || "LAPORAN JURNAL",
        tgl1: item.tgl1,
        tgl2: item.tgl2,
        details: []
      };
    }
    groups[key].details.push(item);
  });

  // Sort details within each group by Urut/Prioritas
  Object.values(groups).forEach(g => {
    g.details.sort((a, b) => {
      if (a.Urut !== undefined && b.Urut !== undefined) {
        return a.Urut - b.Urut;
      }
      return String(a.Prioritas || "").localeCompare(String(b.Prioritas || ""));
    });
  });

  // Return as sorted list by date and Nobukti
  return Object.values(groups).sort((a, b) => {
    const dateCompare = new Date(a.tanggal) - new Date(b.tanggal);
    if (dateCompare !== 0) return dateCompare;
    return String(a.Nobukti).localeCompare(String(b.Nobukti));
  });
});

const jurnalPages = computed(() => {
  if (props.type !== "jurnal") return [];
  
  const transactions = groupedTransactions.value;
  const pages = [];
  let currentPage = [];
  let currentLines = 0;
  const maxLinesPerPage = 18; // A safe count of detail lines per A4 print page

  transactions.forEach((tx) => {
    const linesNeeded = tx.details.length;
    
    if (currentPage.length > 0 && currentLines + linesNeeded > maxLinesPerPage) {
      pages.push(currentPage);
      currentPage = [];
      currentLines = 0;
    }
    
    currentPage.push(tx);
    currentLines += linesNeeded;
  });
  
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  
  return pages;
});

const getGlobalIndex = (pageIdx, txIdx) => {
  let index = 1;
  for (let i = 0; i < pageIdx; i++) {
    index += jurnalPages.value[i].length;
  }
  return index + txIdx;
};

const reportTitle = computed(() => {
  if (props.dataSource.length > 0 && props.dataSource[0].JenisLaporan) {
    return `LAPORAN ${props.dataSource[0].JenisLaporan.toUpperCase()}`;
  }
  return "LAPORAN JURNAL";
});

const reportPeriod = computed(() => {
  if (props.dataSource.length > 0 && props.dataSource[0].tgl1 && props.dataSource[0].tgl2) {
    const formatDateFull = (dateStr) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };
    return `${formatDateFull(props.dataSource[0].tgl1)} - ${formatDateFull(props.dataSource[0].tgl2)}`;
  }
  
  const formatDateFull = (d) => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  return `${formatDateFull(startDate.value)} - ${formatDateFull(endDate.value)}`;
});

const currentPrintTime = computed(() => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
});

const grandTotalDebet = computed(() => {
  return props.dataSource.reduce((sum, item) => sum + Number(item.Debet || 0), 0);
});

const grandTotalKredit = computed(() => {
  return props.dataSource.reduce((sum, item) => sum + Number(item.kredit || 0), 0);
});

const customizeSummaryText = (e) => {
  return formatCurrency(e.value);
};

// Update state saat row di-expand
const onRowExpanded = (e) => {
  if (!expandedKeys.value.includes(e.key)) {
    expandedKeys.value.push(e.key);
  }
};

// Update state saat row di-collapse
const onRowCollapsed = (e) => {
  expandedKeys.value = expandedKeys.value.filter((key) => key !== e.key);
};

// Cek apakah amount perlu ditampilkan
// Aturan: jika row punya parentId = 0 (row utama/header) DAN sedang expanded -> sembunyikan amount
// Jika minimized (collapsed) -> tampilkan amount (total)
const shouldShowAmount = (rowData) => {
  if (rowData.parentId === 0) {
    const isExpanded = expandedKeys.value.includes(rowData.id);
    return !isExpanded; // tampilkan hanya jika TIDAK expanded (minimized)
  }
  return true;
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "";
  if (value === 0) return "-";

  const formatted = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
  }).format(Math.abs(value));

  return value < 0 ? `(${formatted})` : formatted;
};

const getRowClass = (rowData) => {
  switch (rowData.type) {
    case "header":
      return "row-header";
    case "subtotal":
      return "row-subtotal";
    case "grandtotal":
      return "row-grandtotal";
    case "netprofit":
      return "row-netprofit";
    default:
      return "row-detail";
  }
};

const exportToPDF = () => {
  window.print();
};

const printReport = () => {
  window.print();
};

const openFilter = () => {
  popupRef.value?.open();
};

const handleFilterApply = (filterData) => {
  startDate.value = filterData.startDate;
  endDate.value = filterData.endDate;
  hasBeenFiltered.value = true;
  emit("filter-change", filterData);
};

onMounted(() => {
  if (props.autoOpenFilter && !window.__accountingVisited[props.type]) {
    openFilter();
    window.__accountingVisited[props.type] = true;
  }
});

onUnmounted(() => {
  const activeTabs = store.getters["tabs/getTabs"] || [];
  const isTabStillOpen = activeTabs.some(
    (path) => path.toLowerCase() === myRoutePath.toLowerCase()
  );

  if (!isTabStillOpen && window.__accountingVisited && window.__accountingVisited[props.type]) {
    delete window.__accountingVisited[props.type];
  }
});
</script>

<style scoped>
/* 
  UI/UX DESIGN EXPERT CSS 
  Fokus pada tipografi yang bersih, hierarki visual, dan readability.
*/

.pl-report-container {
  padding: 24px;
  background-color: #f8f9fa; /* Abu-abu sangat terang agar mata tidak cepat lelah */
  min-height: 100vh;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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

.card-box {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid #eaedf1;
}

/* Kustomisasi DevExpress TreeList agar tidak kaku */
:deep(.dx-treelist-borders > .dx-treelist-headers) {
  border-bottom: 2px solid #dee2e6; /* Garis header lebih tegas */
}

:deep(.dx-treelist-text-content) {
  font-size: 14px;
  color: #495057;
}

/* Hierarki Visual Akuntansi */
.row-header {
  font-weight: 700;
  color: #343a40;
  text-transform: uppercase;
  font-size: 13px;
  letter-spacing: 0.5px;
}

.row-detail {
  font-weight: 400;
  color: #495057;
}

.row-subtotal {
  font-weight: 600;
  color: #212529;
  border-top: 1px solid #ced4da; /* Garis standar akuntansi sebelum subtotal */
  padding-top: 8px;
  display: inline-block;
  width: 100%;
}

.row-grandtotal {
  font-weight: 700;
  color: #1a1d20;
  background-color: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  display: inline-block;
  width: 100%;
}

.row-netprofit {
  font-weight: 800;
  color: #0f5132; /* Hijau gelap, psikologi warna untuk profit/keuntungan */
  background-color: #d1e7dd; /* Background hijau pastel */
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 16px;
  display: inline-block;
  width: 100%;
  border-bottom: 4px double #0f5132; /* Standar garis ganda (double underline) akuntansi akhir */
}

/* SP Debug Overlay - Hidden until selected */
.sp-footer-hidden {
  flex-shrink: 0;
  width: 100%;
  height: 10px;
  line-height: 10px;
  padding: 0 8px;
  font-size: 11px;
  color: transparent;
  background: transparent;
  user-select: text;
  -webkit-user-select: text;
  cursor: text;
  text-align: right;
  box-sizing: border-box;
  margin-top: 12px;
}

.sp-footer-hidden::selection {
  color: #111827;
  background: #ffe58f;
}

.sp-footer-hidden::-moz-selection {
  color: #111827;
  background: #ffe58f;
}

/* Jurnal Print Preview CSS */
.jurnal-preview-outer {
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
  background: transparent !important;
}

.no-data-jurnal {
  background-color: white;
  padding: 2.5rem;
  text-align: center;
  font-size: 14px;
  color: #64748b;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
}

.jurnal-preview-container {
  background-color: #f1f5f9; /* Slate-100 */
  padding: 2.5rem 1rem;
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

.jurnal-table-wrapper {
  flex-grow: 1;
}

.jurnal-print-header {
  margin-bottom: 1.5rem;
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

.jurnal-table {
  width: 100%;
  border-collapse: collapse;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 12px;
  color: #000000 !important;
}

.jurnal-table th {
  border-top: 1px solid #000000;
  border-bottom: 1px solid #000000;
  padding: 6px 4px;
  font-weight: bold;
  text-align: left;
}

.jurnal-table th.text-right {
  text-align: right;
}

.jurnal-table td {
  padding: 5px 4px;
  vertical-align: top;
}

.jurnal-table tr.transaction-divider td {
  border-bottom: 1px solid #000000;
}

.jurnal-table tr.grand-total-row td {
  border-top: 1px solid #000000;
  border-bottom: 4px double #000000;
  font-weight: bold;
  font-size: 13px;
}

.jurnal-print-footer {
  margin-top: 1.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
  font-size: 11px;
  color: #64748b;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

@media print {
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
}
</style>