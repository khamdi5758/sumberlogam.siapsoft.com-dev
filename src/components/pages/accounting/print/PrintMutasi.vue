<template>
  <div class="jurnal-preview-container">
    <div
      v-for="(pageRows, pageIdx) in mutasiPages"
      :key="pageIdx"
      class="jurnal-page-sheet"
    >
      <div class="jurnal-print-header">
        <h3 class="jurnal-report-title">LAPORAN MUTASI DAN SALDO</h3>
        <p class="jurnal-report-subtitle">Periode : {{ reportPeriod }}</p>
      </div>

      <div class="jurnal-table-wrapper">
        <table class="mutasi-table">
          <thead>
            <tr>
              <th rowspan="2" style="width: 12%">No Perkiraan</th>
              <th rowspan="2" style="width: 28%">Nama Perkiraan</th>
              <th colspan="2" style="width: 30%">Mutasi Bulan Ini</th>
              <th colspan="2" style="width: 30%">S/d Bulan Ini</th>
            </tr>
            <tr>
              <th style="width: 15%">Debet</th>
              <th style="width: 15%">Kredit</th>
              <th style="width: 15%">Debet</th>
              <th style="width: 15%">Kredit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rIdx) in pageRows" :key="rIdx" class="mutasi-data-row">
              <td>{{ row.perkiraan }}</td>
              <td class="text-left">{{ row.keterangan }}</td>
              <td class="text-right">{{ formatCurrency(row.debet) }}</td>
              <td class="text-right">{{ formatCurrency(row.kredit) }}</td>
              <td class="text-right">{{ formatCurrency(row.sdDebet) }}</td>
              <td class="text-right">{{ formatCurrency(row.sdKredit) }}</td>
            </tr>

            <template v-if="pageIdx < mutasiPages.length - 1">
              <tr v-for="blankIdx in (28 - pageRows.length)" :key="'blank-' + blankIdx" class="mutasi-data-row-blank">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </template>

            <tr v-if="pageIdx === mutasiPages.length - 1" class="mutasi-total-row">
              <td colspan="2" class="text-right font-bold">TOTAL :</td>
              <td class="text-right font-bold">{{ formatCurrency(mutasiTotals.debet) }}</td>
              <td class="text-right font-bold">{{ formatCurrency(mutasiTotals.kredit) }}</td>
              <td class="text-right font-bold">{{ formatCurrency(mutasiTotals.sdDebet) }}</td>
              <td class="text-right font-bold">{{ formatCurrency(mutasiTotals.sdKredit) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="jurnal-print-footer">
        <div class="flex justify-between">
          <span>Dicetak: {{ currentPrintTime }}</span>
          <span>Halaman {{ pageIdx + 1 }} dari {{ mutasiPages.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { formatCurrency } from "./printHelpers";

const props = defineProps({
  dataSource: Array,
  startDate: Date,
  endDate: Date,
  currentPrintTime: String,
});

const reportPeriod = computed(() => {
  const options = { day: "numeric", month: "short", year: "numeric" };
  const s = props.startDate ? new Date(props.startDate) : new Date();
  const e = props.endDate ? new Date(props.endDate) : new Date();
  return `${s.toLocaleDateString("id-ID", options)} - ${e.toLocaleDateString("id-ID", options)}`;
});

const mutasiList = computed(() => {
  return props.dataSource.map((item) => {
    const perkiraan = item.Perkiraan !== undefined ? item.Perkiraan : (item.perkiraan !== undefined ? item.perkiraan : "");
    const keterangan = item.Keterangan !== undefined ? item.Keterangan : (item.keterangan !== undefined ? item.keterangan : "");
    
    const debet = Number(item.MutasiDebet !== undefined ? item.MutasiDebet : (item.mutasidebet !== undefined ? item.mutasidebet : (item.MD !== undefined ? item.MD : (item.Debet !== undefined ? item.Debet : (item.debet !== undefined ? item.debet : 0)))));
    
    const kredit = Number(item.MutasiKredit !== undefined ? item.MutasiKredit : (item.mutasikredit !== undefined ? item.mutasikredit : (item.MK !== undefined ? item.MK : (item.Kredit !== undefined ? item.Kredit : (item.kredit !== undefined ? item.kredit : 0)))));
    
    const sdDebet = Number(item.SdMutasiDebet !== undefined ? item.SdMutasiDebet : (item.sdmutasidebet !== undefined ? item.sdmutasidebet : (item.SdDebet !== undefined ? item.SdDebet : (item.sddebet !== undefined ? item.sddebet : (item.NeracaSaldoAkD !== undefined ? item.NeracaSaldoAkD : (item.SaldoAkhirD !== undefined ? item.SaldoAkhirD : 0))))));
    
    const sdKredit = Number(item.SdMutasiKredit !== undefined ? item.SdMutasiKredit : (item.sdmutasikredit !== undefined ? item.sdmutasikredit : (item.SdKredit !== undefined ? item.SdKredit : (item.sdkredit !== undefined ? item.sdkredit : (item.NeracaSaldoAkK !== undefined ? item.NeracaSaldoAkK : (item.SaldoAkhirK !== undefined ? item.SaldoAkhirK : 0))))));

    return {
      perkiraan,
      keterangan,
      debet,
      kredit,
      sdDebet,
      sdKredit
    };
  });
});

const mutasiTotals = computed(() => {
  let totalDebet = 0;
  let totalKredit = 0;
  let totalSdDebet = 0;
  let totalSdKredit = 0;

  mutasiList.value.forEach((row) => {
    totalDebet += row.debet;
    totalKredit += row.kredit;
    totalSdDebet += row.sdDebet;
    totalSdKredit += row.sdKredit;
  });

  return {
    debet: totalDebet,
    kredit: totalKredit,
    sdDebet: totalSdDebet,
    sdKredit: totalSdKredit
  };
});

const mutasiPages = computed(() => {
  const list = mutasiList.value;
  const pages = [];
  const maxLinesPerPage = 28;
  
  for (let i = 0; i < list.length; i += maxLinesPerPage) {
    pages.push(list.slice(i, i + maxLinesPerPage));
  }
  
  if (pages.length === 0) {
    pages.push([]);
  }
  return pages;
});
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
.mutasi-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}
.mutasi-table th, .mutasi-table td {
  border: 1px solid #cbd5e1;
  padding: 5px 8px;
}
.mutasi-table th {
  background-color: #f8fafc;
  font-weight: 600;
}
.mutasi-data-row-blank td {
  height: 25px;
}
.mutasi-total-row td {
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
