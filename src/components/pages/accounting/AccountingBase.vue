<template>
  <div class="pl-report-container">
    <!-- Header with clear and compact filter/action buttons -->
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

    <!-- White card box or transparent print sheet container -->
    <div v-if="hasBeenFiltered" :class="['jurnal', 'bukubesar', 'mutasi', 'biaya', 'aktivatetap', 'labarugi', 'neracalajur', 'neraca'].includes(type) ? 'jurnal-preview-outer' : 'card-box'">
      <!-- Dynamic Print Preview Components -->
      <PrintJurnal
        v-if="type === 'jurnal'"
        :data-source="dataSource"
        :current-print-time="currentPrintTime"
      />
      <PrintBukuBesar
        v-else-if="type === 'bukubesar'"
        :data-source="dataSource"
        :start-date="startDate"
        :end-date="endDate"
        :filter-params="filterParams"
        :current-print-time="currentPrintTime"
      />
      <PrintMutasi
        v-else-if="type === 'mutasi'"
        :data-source="dataSource"
        :start-date="startDate"
        :end-date="endDate"
        :current-print-time="currentPrintTime"
      />
      <PrintBiaya
        v-else-if="type === 'biaya'"
        :data-source="dataSource"
        :start-date="startDate"
        :end-date="endDate"
        :current-print-time="currentPrintTime"
      />
      <PrintAktivaTetap
        v-else-if="type === 'aktivatetap'"
        :data-source="dataSource"
        :end-date="endDate"
        :current-print-date-only="currentPrintDateOnly"
        :current-print-time-only="currentPrintTimeOnly"
      />
      <PrintLabaRugi
        v-else-if="type === 'labarugi'"
        :data-source="dataSource"
        :end-date="endDate"
        :current-print-date-only="currentPrintDateOnly"
        :current-print-time-only="currentPrintTimeOnly"
      />
      <PrintNeraca
        v-else-if="type === 'neraca'"
        :data-source="dataSource"
        :start-date="startDate"
        :end-date="endDate"
        :current-print-date-only="currentPrintDateOnly"
        :current-print-time-only="currentPrintTimeOnly"
      />
      <PrintNeracaLajur
        v-else-if="type === 'neracalajur'"
        :data-source="dataSource"
        :end-date="endDate"
        :current-print-date-only="currentPrintDateOnly"
        :current-print-time-only="currentPrintTimeOnly"
      />

      <!-- Fallback TreeList View -->
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

        <template #amountBulanIniTemplate="{ data }">
          <span :class="getRowClass(data.data)">
            {{
              shouldShowAmount(data.data)
                ? formatCurrency(data.data.amount || 0)
                : ""
            }}
          </span>
        </template>

        <template #amountBulanLaluTemplate="{ data }">
          <span :class="getRowClass(data.data)">
            {{
              shouldShowAmount(data.data)
                ? formatCurrency(data.data.amountBulanLalu || 0)
                : ""
            }}
          </span>
        </template>

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
import DxButton from "devextreme-vue/button";
import AccountingPopup from "./AccountingPopup.vue";

// Import Refactored Print Subcomponents
import PrintJurnal from "./print/PrintJurnal.vue";
import PrintBukuBesar from "./print/PrintBukuBesar.vue";
import PrintMutasi from "./print/PrintMutasi.vue";
import PrintBiaya from "./print/PrintBiaya.vue";
import PrintAktivaTetap from "./print/PrintAktivaTetap.vue";
import PrintLabaRugi from "./print/PrintLabaRugi.vue";
import PrintNeraca from "./print/PrintNeraca.vue";
import PrintNeracaLajur from "./print/PrintNeracaLajur.vue";

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
const endDate = ref(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

const expandedKeys = ref([...props.defaultExpandedKeys]);
const hasBeenFiltered = ref(props.showContentInitially || isVisited);
const filterParams = ref({});

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

const currentPrintDateOnly = computed(() => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
});

const currentPrintTimeOnly = computed(() => {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
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

const transformToTree = (flatData) => {
  if (!Array.isArray(flatData) || flatData.length === 0) return [];
  if (flatData[0] && flatData[0].id !== undefined && flatData[0].parentId !== undefined) {
    return flatData;
  }
  const tree = [];
  const registeredGroups = new Map();
  let nextId = 1;

  flatData.forEach((item) => {
    const perkiraanVal = item.perkiraan !== undefined ? item.perkiraan : item.Perkiraan;
    const keteranganVal = item.Keterangan !== undefined ? item.Keterangan : (item.keterangan !== undefined ? item.keterangan : item.accountName);

    let grp1Key = item.nmgroup1 || item.NamaHeader || item.Header || "Lain-lain";

    let grp1Id;
    if (!registeredGroups.has(grp1Key)) {
      grp1Id = nextId++;
      registeredGroups.set(grp1Key, grp1Id);
      tree.push({ id: grp1Id, parentId: 0, accountName: grp1Key, amount: 0, amountBulanLalu: 0, type: "header" });
    } else {
      grp1Id = registeredGroups.get(grp1Key);
    }

    let grp2KeyName = item.NamaGrpAcc || item.Header || String(item.KodeGrpAcc || "") || "Detail";
    const grp2Key = `${grp1Key}_${grp2KeyName}`;
    
    let grp2Id;
    if (!registeredGroups.has(grp2Key)) {
      grp2Id = nextId++;
      registeredGroups.set(grp2Key, grp2Id);
      tree.push({ id: grp2Id, parentId: grp1Id, accountName: grp2KeyName, amount: 0, amountBulanLalu: 0, type: "header" });
    } else {
      grp2Id = registeredGroups.get(grp2Key);
    }

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

const onRowExpanded = (e) => {
  if (!expandedKeys.value.includes(e.key)) {
    expandedKeys.value.push(e.key);
  }
};

const onRowCollapsed = (e) => {
  expandedKeys.value = expandedKeys.value.filter((key) => key !== e.key);
};

const shouldShowAmount = (rowData) => {
  if (rowData.parentId === 0) {
    const isExpanded = expandedKeys.value.includes(rowData.id);
    return !isExpanded;
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
  filterParams.value = filterData;
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
.pl-report-container {
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
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

:deep(.dx-treelist-borders > .dx-treelist-headers) {
  border-bottom: 2px solid #dee2e6;
}

:deep(.dx-treelist-text-content) {
  font-size: 14px;
  color: #495057;
}

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
  border-top: 1px solid #ced4da;
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
  color: #0f5132;
  background-color: #d1e7dd;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 16px;
  display: inline-block;
  width: 100%;
  border-bottom: 4px double #0f5132;
}

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

.jurnal-preview-outer {
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
  background: transparent !important;
}
</style>