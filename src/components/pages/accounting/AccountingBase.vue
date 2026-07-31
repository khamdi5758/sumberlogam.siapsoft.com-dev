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
    <div v-if="hasBeenFiltered" class="card-box">
      <!-- Kondisi Jurnal: Render Flat DataGrid -->
      <template v-if="type === 'jurnal'">
        <DxDataGrid
          id="jurnal-grid"
          :data-source="jurnalDataSource"
          key-expr="id"
          :show-row-lines="true"
          :show-borders="false"
          :column-auto-width="true"
        >
          <DxGridColumn
            data-field="tanggal"
            caption="Tanggal"
            data-type="date"
            format="dd-MM-yyyy"
            width="110"
          />
          <DxGridColumn
            data-field="Nobukti"
            caption="No. Bukti"
            width="150"
          />
          <DxGridColumn
            data-field="perkiraan"
            caption="Perkiraan"
            width="100"
          />
          <DxGridColumn
            data-field="NamaAkun"
            caption="Nama Akun"
            width="220"
          />
          <DxGridColumn
            data-field="keterangan"
            caption="Keterangan"
          />
          <DxGridColumn
            data-field="Debet"
            caption="Debet"
            alignment="right"
            width="130"
            cell-template="currencyTemplate"
          />
          <DxGridColumn
            data-field="kredit"
            caption="Kredit"
            alignment="right"
            width="130"
            cell-template="currencyTemplate"
          />

          <template #currencyTemplate="{ data }">
            <span>{{ formatCurrency(data.value) }}</span>
          </template>

          <DxSummary>
            <DxTotalItem
              column="Debet"
              summary-type="sum"
              :customize-text="customizeSummaryText"
            />
            <DxTotalItem
              column="kredit"
              summary-type="sum"
              :customize-text="customizeSummaryText"
            />
          </DxSummary>
        </DxDataGrid>
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
    const grp1Key = item.nmgroup1 || "Lain-lain";
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

    const grp2Key = `${grp1Key}_${item.NamaGrpAcc || item.KodeGrpAcc}`;
    let grp2Id;
    if (!registeredGroups.has(grp2Key)) {
      grp2Id = nextId++;
      registeredGroups.set(grp2Key, grp2Id);
      tree.push({
        id: grp2Id,
        parentId: grp1Id,
        accountName: item.NamaGrpAcc || String(item.KodeGrpAcc || ""),
        amount: 0,
        amountBulanLalu: 0,
        type: "header"
      });
    } else {
      grp2Id = registeredGroups.get(grp2Key);
    }

    const amountVal = Number(item.Jumlah || item.Perhitungan || 0);
    const amountBulanLaluVal = Number(item.JumlahBulanLalu || item.PerhitunganBulanLalu || 0);
    
    tree.push({
      id: nextId++,
      parentId: grp2Id,
      accountName: `${item.perkiraan ? item.perkiraan + ' - ' : ''}${item.Keterangan || ''}`,
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
</style>