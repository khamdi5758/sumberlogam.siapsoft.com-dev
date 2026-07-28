<template>
  <div class="pl-report-container">
    <!-- UI/UX: Header dengan filter yang jelas dan tidak memakan tempat -->
    <div class="header-section">
      <div>
        <h2 class="report-title">Laporan Laba Rugi</h2>
        <p class="report-subtitle">
          Periode: 1 Jan 2026 - 31 Jan 2026 | Cabang: Pusat
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
      </div>
    </div>

    <!-- UI/UX: Card putih bersih untuk memberikan fokus pada angka -->
    <div class="card-box">
      <!-- Programmer: Menggunakan TreeList untuk hierarki akun Akuntansi -->
      <DxTreeList
        id="profit-loss-tree"
        :data-source="plData"
        key-expr="id"
        parent-id-expr="parentId"
        :show-row-lines="true"
        :show-borders="false"
        :column-auto-width="true"
        :expanded-row-keys="expandedKeys"
        @row-expanded="onRowExpanded"
        @row-collapsed="onRowCollapsed"
      >
        <!-- Buka otomatis node utama -->
        <DxColumn
          data-field="accountName"
          caption="Keterangan"
          cell-template="nameTemplate"
        />

        <DxColumn
          data-field="amount"
          caption="Nilai (Rp)"
          alignment="right"
          width="250"
          cell-template="amountTemplate"
        />

        <template #nameTemplate="{ data }">
          <span :class="getRowClass(data.data)">
            {{ data.data.accountName }}
          </span>
        </template>

        <!-- Template amount dengan kondisi expand/collapse -->
        <template #amountTemplate="{ data }">
          <span :class="getRowClass(data.data)">
            {{
              shouldShowAmount(data.data)
                ? formatCurrency(data.data.amount)
                : ""
            }}
          </span>
        </template>
      </DxTreeList>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: "coba",
});
import { ref } from "vue";
import { DxTreeList, DxColumn } from "devextreme-vue/tree-list";
import DxButton from "devextreme-vue/button";

const plData = ref([
  {
    id: 1,
    parentId: 0,
    accountName: "PENDAPATAN",
    amount: 155000000,
    type: "header",
  },
  {
    id: 11,
    parentId: 1,
    accountName: "Pendapatan Jasa Web",
    amount: 120000000,
    type: "detail",
  },
  {
    id: 12,
    parentId: 1,
    accountName: "Pendapatan Server/Hosting",
    amount: 35000000,
    type: "detail",
  },
  {
    id: 19,
    parentId: 1,
    accountName: "Total Pendapatan",
    amount: 155000000,
    type: "subtotal",
  },

  {
    id: 2,
    parentId: 0,
    accountName: "HARGA POKOK PENJUALAN (HPP)",
    amount: 25000000,
    type: "header",
  },
  {
    id: 21,
    parentId: 2,
    accountName: "Biaya Server AWS",
    amount: 20000000,
    type: "detail",
  },
  {
    id: 22,
    parentId: 2,
    accountName: "Lisensi Software",
    amount: 5000000,
    type: "detail",
  },
  {
    id: 29,
    parentId: 2,
    accountName: "Total HPP",
    amount: 25000000,
    type: "subtotal",
  },

  {
    id: 3,
    parentId: 0,
    accountName: "LABA KOTOR",
    amount: 130000000,
    type: "grandtotal",
  },

  {
    id: 4,
    parentId: 0,
    accountName: "BEBAN OPERASIONAL",
    amount: 70000000,
    type: "header",
  },
  {
    id: 41,
    parentId: 4,
    accountName: "Gaji Karyawan",
    amount: 45000000,
    type: "detail",
  },
  {
    id: 42,
    parentId: 4,
    accountName: "Sewa Kantor",
    amount: 10000000,
    type: "detail",
  },
  {
    id: 43,
    parentId: 4,
    accountName: "Biaya Marketing",
    amount: 15000000,
    type: "detail",
  },
  {
    id: 49,
    parentId: 4,
    accountName: "Total Beban Operasional",
    amount: 70000000,
    type: "subtotal",
  },

  {
    id: 5,
    parentId: 0,
    accountName: "LABA BERSIH",
    amount: 60000000,
    type: "netprofit",
  },
]);

// State expanded row keys - default sesuai kondisi awal (node utama terbuka)
const expandedKeys = ref([1, 2, 4]);

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
    // Cek apakah row ini sedang expanded
    const isExpanded = expandedKeys.value.includes(rowData.id);
    return !isExpanded; // tampilkan hanya jika TIDAK expanded (minimized)
  }
  // Row selain parentId = 0 (child/detail/subtotal/grandtotal/netprofit) selalu tampilkan
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
  console.log("Exporting to PDF...");
};
const printReport = () => {
  window.print();
};
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
</style>
