<template>
  <div class="jurnal-preview-container">
    <div
      v-for="(pageTransactions, pageIdx) in jurnalPages"
      :key="pageIdx"
      class="jurnal-page-sheet"
    >
      <div class="jurnal-print-header">
        <h3 class="jurnal-report-title">{{ reportTitle }}</h3>
        <p class="jurnal-report-subtitle">Periode : {{ reportPeriod }}</p>
      </div>

      <div class="jurnal-table-wrapper">
        <table class="jurnal-table">
          <thead>
            <tr>
              <th style="width: 5%">No</th>
              <th style="width: 10%">Tanggal</th>
              <th style="width: 30%">No Bukti/Keterangan</th>
              <th style="width: 35%">Perkiraan</th>
              <th style="width: 10%" class="text-right">Debet</th>
              <th style="width: 10%" class="text-right">Kredit</th>
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

            <tr v-slot v-if="pageIdx === jurnalPages.length - 1" class="grand-total-row">
              <td colspan="4" class="text-right font-bold py-2">GRAND TOTAL :</td>
              <td class="text-right font-bold py-2">{{ formatCurrencyID(grandTotalDebet) }}</td>
              <td class="text-right font-bold py-2">{{ formatCurrencyID(grandTotalKredit) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="jurnal-print-footer">
        <div class="flex justify-between">
          <span>Dicetak: {{ currentPrintTime }}</span>
          <span>Halaman {{ pageIdx + 1 }} dari {{ jurnalPages.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { formatCurrencyID, formatShortDate } from "./printHelpers";

const props = defineProps({
  dataSource: Array,
  currentPrintTime: String,
});

const reportTitle = computed(() => {
  if (props.dataSource.length > 0) {
    return props.dataSource[0].JenisLaporan || "LAPORAN JURNAL";
  }
  return "LAPORAN JURNAL";
});

const reportPeriod = computed(() => {
  if (props.dataSource.length > 0) {
    const tgl1 = props.dataSource[0].tgl1;
    const tgl2 = props.dataSource[0].tgl2;
    if (tgl1 && tgl2) {
      return `${formatShortDate(tgl1)} - ${formatShortDate(tgl2)}`;
    }
  }
  return "-";
});

const groupedTransactions = computed(() => {
  const groups = {};
  props.dataSource.forEach((item) => {
    const key = item.Nobukti;
    if (!groups[key]) {
      groups[key] = {
        Nobukti: item.Nobukti,
        tanggal: item.tanggal,
        details: []
      };
    }
    groups[key].details.push(item);
  });

  Object.values(groups).forEach(g => {
    g.details.sort((a, b) => {
      if (a.Urut !== undefined && b.Urut !== undefined) {
        return a.Urut - b.Urut;
      }
      return String(a.Prioritas || "").localeCompare(String(b.Prioritas || ""));
    });
  });

  return Object.values(groups).sort((a, b) => {
    const dateCompare = new Date(a.tanggal) - new Date(b.tanggal);
    if (dateCompare !== 0) return dateCompare;
    return String(a.Nobukti).localeCompare(String(b.Nobukti));
  });
});

const maxLinesPerPage = 28;

const jurnalPages = computed(() => {
  const transactions = groupedTransactions.value;
  const pages = [];
  let currentPage = [];
  let currentLines = 0;

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
  if (pages.length === 0) {
    pages.push([]);
  }
  return pages;
});

const grandTotalDebet = computed(() => {
  return props.dataSource.reduce((sum, item) => sum + Number(item.Debet || 0), 0);
});

const grandTotalKredit = computed(() => {
  return props.dataSource.reduce((sum, item) => sum + Number(item.kredit || 0), 0);
});

const getGlobalIndex = (pageIdx, txIdx) => {
  let index = 0;
  for (let i = 0; i < pageIdx; i++) {
    index += jurnalPages.value[i].length;
  }
  return index + txIdx + 1;
};
</script>

<style scoped>
.jurnal-preview-container {
  background-color: #f1f5f9;
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
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
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
  text-align: center;
}
.jurnal-report-title {
  font-size: 18px;
  font-weight: bold;
  color: #0f172a;
}
.jurnal-report-subtitle {
  font-size: 14px;
  color: #475569;
}
.jurnal-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}
.jurnal-table th, .jurnal-table td {
  border: 1px solid #cbd5e1;
  padding: 6px 8px;
}
.jurnal-table th {
  background-color: #f8fafc;
  font-weight: 600;
}
.transaction-divider {
  border-bottom: 2px solid #94a3b8 !important;
}
.grand-total-row td {
  background-color: #f8fafc;
  border-top: 2px solid #475569;
}
.jurnal-print-footer {
  border-top: 1px solid #cbd5e1;
  padding-top: 0.5rem;
  font-size: 10px;
  color: #64748b;
}
@media print {
  .jurnal-preview-container {
    background-color: transparent !important;
    padding: 0 !important;
    gap: 0 !important;
    display: block !important;
  }
  .jurnal-page-sheet {
    width: 100% !important;
    height: 297mm !important;
    padding: 10mm !important;
    border: none !important;
    box-shadow: none !important;
    page-break-after: always !important;
  }
}
</style>
