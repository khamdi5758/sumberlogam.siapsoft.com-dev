<template>
  <div class="jurnal-preview-container">
    <div
      v-for="(pageRows, pageIdx) in neracalajurPages"
      :key="pageIdx"
      class="jurnal-page-sheet landscape-page"
    >
      <div class="jurnal-print-header" style="text-align: left; margin-bottom: 20px;">
        <h3 class="jurnal-report-title" style="font-size: 14px; font-weight: bold; font-family: ui-sans-serif, system-ui, sans-serif; color: #000; margin: 0 0 2px 0;">
          NERACA LAJUR
        </h3>
        <p class="jurnal-report-subtitle" style="font-size: 11px; font-weight: bold; color: #000; margin: 0;">
          {{ reportPeriod }}
        </p>
      </div>

      <div class="jurnal-table-wrapper">
        <table class="neracalajur-table">
          <thead>
            <tr class="neracalajur-header-top">
              <th rowspan="2" style="width: 6%; text-align: left;">Perkiraan</th>
              <th rowspan="2" style="width: 14%; text-align: left;">Keterangan</th>
              <th colspan="2" style="width: 13%; text-align: center;">Saldo Awal</th>
              <th colspan="2" style="width: 13%; text-align: center;">Mutasi Kas & Bank</th>
              <th colspan="2" style="width: 13%; text-align: center;">Penyesuaian</th>
              <th colspan="2" style="width: 13%; text-align: center;">Neraca Saldo</th>
              <th colspan="2" style="width: 13%; text-align: center;">Laba/Rugi</th>
              <th colspan="2" style="width: 13%; text-align: center;">Neraca</th>
            </tr>
            <tr class="neracalajur-header-bottom">
              <th style="text-align: right;">Debet</th>
              <th style="text-align: right;">Kredit</th>
              <th style="text-align: right;">Debet</th>
              <th style="text-align: right;">Kredit</th>
              <th style="text-align: right;">Debet</th>
              <th style="text-align: right;">Kredit</th>
              <th style="text-align: right;">Debet</th>
              <th style="text-align: right;">Kredit</th>
              <th style="text-align: right;">Debet</th>
              <th style="text-align: right;">Kredit</th>
              <th style="text-align: right;">Debet</th>
              <th style="text-align: right;">Kredit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rIdx) in pageRows" :key="rIdx" class="neracalajur-data-row">
              <td style="text-align: left;">{{ row.perkiraan }}</td>
              <td class="text-left" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ row.keterangan }}</td>
              <td style="text-align: right;">{{ formatCurrency(row.saDebet) }}</td>
              <td style="text-align: right;">{{ formatCurrency(row.saKredit) }}</td>
              <td style="text-align: right;">{{ formatCurrency(row.mutasiDebet) }}</td>
              <td style="text-align: right;">{{ formatCurrency(row.mutasiKredit) }}</td>
              <td style="text-align: right;">{{ formatCurrency(row.penyesuaianDebet) }}</td>
              <td style="text-align: right;">{{ formatCurrency(row.penyesuaianKredit) }}</td>
              <td style="text-align: right;">{{ formatCurrency(row.nsDebet) }}</td>
              <td style="text-align: right;">{{ formatCurrency(row.nsKredit) }}</td>
              <td style="text-align: right;">{{ formatCurrency(row.rlDebet) }}</td>
              <td style="text-align: right;">{{ formatCurrency(row.rlKredit) }}</td>
              <td style="text-align: right;">{{ formatCurrency(row.neracaDebet) }}</td>
              <td style="text-align: right;">{{ formatCurrency(row.neracaKredit) }}</td>
            </tr>

            <template v-if="pageIdx < neracalajurPages.length - 1">
              <tr v-for="blankIdx in (28 - pageRows.length)" :key="'blank-' + blankIdx" class="neracalajur-data-row-blank">
                <td v-for="n in 14" :key="n"></td>
              </tr>
            </template>

            <tr v-if="pageIdx === neracalajurPages.length - 1" class="neracalajur-total-row">
              <td colspan="2" style="text-align: left; font-weight: bold;">TOTAL :</td>
              <td style="text-align: right;">{{ formatCurrency(neracalajurTotals.saDebet) }}</td>
              <td style="text-align: right;">{{ formatCurrency(neracalajurTotals.saKredit) }}</td>
              <td style="text-align: right;">{{ formatCurrency(neracalajurTotals.mutasiDebet) }}</td>
              <td style="text-align: right;">{{ formatCurrency(neracalajurTotals.mutasiKredit) }}</td>
              <td style="text-align: right;">{{ formatCurrency(neracalajurTotals.penyesuaianDebet) }}</td>
              <td style="text-align: right;">{{ formatCurrency(neracalajurTotals.penyesuaianKredit) }}</td>
              <td style="text-align: right;">{{ formatCurrency(neracalajurTotals.nsDebet) }}</td>
              <td style="text-align: right;">{{ formatCurrency(neracalajurTotals.nsKredit) }}</td>
              <td style="text-align: right;">{{ formatCurrency(neracalajurTotals.rlDebet) }}</td>
              <td style="text-align: right;">{{ formatCurrency(neracalajurTotals.rlKredit) }}</td>
              <td style="text-align: right;">{{ formatCurrency(neracalajurTotals.neracaDebet) }}</td>
              <td style="text-align: right;">{{ formatCurrency(neracalajurTotals.neracaKredit) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="jurnal-print-footer">
        <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: ui-sans-serif, system-ui, sans-serif; color: #000; border-top: 1px solid #000; padding-top: 4px;">
          <span>{{ pageIdx + 1 }} of {{ neracalajurPages.length }}</span>
          <span>{{ currentPrintDateOnly }}</span>
          <span>{{ currentPrintTimeOnly }}</span>
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
  endDate: Date,
  currentPrintDateOnly: String,
  currentPrintTimeOnly: String,
});

const reportPeriod = computed(() => {
  const d = props.endDate ? new Date(props.endDate) : new Date();
  return `Per ${d.getMonth() + 1} - ${d.getFullYear()}`;
});

const neracalajurList = computed(() => {
  return props.dataSource.map((item) => {
    const perkiraan = item.Perkiraan !== undefined ? item.Perkiraan : (item.perkiraan !== undefined ? item.perkiraan : "");
    const keterangan = item.Keterangan !== undefined ? item.Keterangan : (item.keterangan !== undefined ? item.keterangan : "");

    const saDebet = Number(item.SaldoAwD !== undefined ? item.SaldoAwD : 0);
    const saKredit = Number(item.SaldoAwK !== undefined ? item.SaldoAwK : 0);

    const mutasiDebet = Number(item.MutasiDebet !== undefined ? item.MutasiDebet : (item.mutasidebet !== undefined ? item.mutasidebet : 0));
    const mutasiKredit = Number(item.MutasiKredit !== undefined ? item.MutasiKredit : (item.mutasikredit !== undefined ? item.mutasikredit : 0));

    const penyesuaianDebet = Number(item.JPD !== undefined ? item.JPD : 0);
    const penyesuaianKredit = Number(item.JPK !== undefined ? item.JPK : 0);

    const nsDebet = Number(item.NeracaSaldoAkd !== undefined ? item.NeracaSaldoAkd : 0);
    const nsKredit = Number(item.NeracaSaldoAkk !== undefined ? item.NeracaSaldoAkk : 0);

    const rlDebet = Number(item.LRD !== undefined ? item.LRD : 0);
    const rlKredit = Number(item.LRK !== undefined ? item.LRK : 0);

    const neracaDebet = Number(item.NeracaSaldoAkD !== undefined ? item.NeracaSaldoAkD : 0);
    const neracaKredit = Number(item.NeracaSaldoAkK !== undefined ? item.NeracaSaldoAkK : 0);

    return {
      perkiraan, keterangan,
      saDebet, saKredit,
      mutasiDebet, mutasiKredit,
      penyesuaianDebet, penyesuaianKredit,
      nsDebet, nsKredit,
      rlDebet, rlKredit,
      neracaDebet, neracaKredit
    };
  });
});

const neracalajurTotals = computed(() => {
  let totals = { saDebet: 0, saKredit: 0, mutasiDebet: 0, mutasiKredit: 0, penyesuaianDebet: 0, penyesuaianKredit: 0, nsDebet: 0, nsKredit: 0, rlDebet: 0, rlKredit: 0, neracaDebet: 0, neracaKredit: 0 };
  neracalajurList.value.forEach((row) => {
    Object.keys(totals).forEach(key => { totals[key] += row[key]; });
  });
  return totals;
});

const neracalajurPages = computed(() => {
  const list = neracalajurList.value;
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
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
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
}
.jurnal-table-wrapper {
  flex-grow: 1;
}
.jurnal-print-header {
  text-align: left;
  margin-bottom: 20px;
}
.jurnal-report-title {
  font-size: 14px;
  font-weight: bold;
  color: #000;
}
.jurnal-report-subtitle {
  font-size: 11px;
  color: #000;
}
.neracalajur-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8px;
  color: #000 !important;
  table-layout: fixed;
}
.neracalajur-table th, .neracalajur-table td {
  border: 1px solid #000;
  padding: 2px 2px;
  vertical-align: middle;
  white-space: nowrap;
}
.neracalajur-table th {
  font-weight: bold;
  background-color: #ffffff;
}
.neracalajur-data-row-blank td {
  height: 25px;
}
.neracalajur-total-row td {
  background-color: #ffffff;
}
.jurnal-print-footer {
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
    border: none !important;
    box-shadow: none !important;
    page-break-after: always !important;
  }
  .jurnal-page-sheet.landscape-page {
    width: 297mm !important;
    height: 210mm !important;
    padding: 10mm !important;
  }
}
</style>
