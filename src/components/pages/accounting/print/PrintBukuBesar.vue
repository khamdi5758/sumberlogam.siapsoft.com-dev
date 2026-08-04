<template>
  <div class="jurnal-preview-container">
    <div
      v-for="(pageGroups, pageIdx) in bukubesarPages"
      :key="pageIdx"
      class="jurnal-page-sheet"
    >
      <div class="jurnal-print-header">
        <h3 class="jurnal-report-title">LAPORAN BUKU BESAR</h3>
        <p class="jurnal-report-subtitle">Periode : {{ reportPeriod }}</p>
        <p class="jurnal-report-subtitle" style="font-weight: normal; font-size: 13px; margin-top: 4px;">
          {{ filterParams?.jurnalPenutup || 'Tanpa Jurnal Penutup' }}
        </p>
      </div>

      <div class="jurnal-table-wrapper">
        <div v-for="group in pageGroups" :key="group.code" style="margin-bottom: 24px;">
          <div v-if="group.isStart" class="bukubesar-group-header">
            {{ group.code }} {{ group.name }}
          </div>
          <div v-else class="bukubesar-group-header-continued">
            {{ group.code }} {{ group.name }} (Sambungan)
          </div>

          <table class="bukubesar-table">
            <thead>
              <tr class="bukubesar-header-row">
                <th style="width: 5%">No</th>
                <th style="width: 10%">Tanggal</th>
                <th style="width: 15%">No Bukti</th>
                <th style="width: 30%">Keterangan</th>
                <th style="width: 13%" class="text-right">Debet</th>
                <th style="width: 13%" class="text-right">Kredit</th>
                <th style="width: 14%" class="text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="group.isStart" class="bukubesar-saldo-awal-row">
                <td colspan="4" class="text-left font-bold">SALDO AWAL :</td>
                <td class="text-right">-</td>
                <td class="text-right">-</td>
                <td class="text-right font-bold">{{ formatLabaRugiCurrency(group.saldoAwal) }}</td>
              </tr>
              <tr v-else class="bukubesar-saldo-awal-row">
                <td colspan="4" class="text-left italic">Saldo Pindahan :</td>
                <td class="text-right">-</td>
                <td class="text-right">-</td>
                <td class="text-right italic">{{ formatLabaRugiCurrency(group.rows[0]?.saldo - group.rows[0]?.debet + group.rows[0]?.kredit) }}</td>
              </tr>

              <tr v-for="(row, rIdx) in group.rows" :key="rIdx">
                <td>{{ rIdx + 1 }}.</td>
                <td>{{ formatShortDate(row.tanggal) }}</td>
                <td>{{ row.nobukti }}</td>
                <td class="text-left">{{ row.keterangan }}</td>
                <td class="text-right">{{ formatCurrencyID(row.debet) }}</td>
                <td class="text-right">{{ formatCurrencyID(row.kredit) }}</td>
                <td class="text-right">{{ formatLabaRugiCurrency(row.saldo) }}</td>
              </tr>

              <tr v-if="group.isEnd" class="bukubesar-subtotal-row">
                <td colspan="4" class="text-right font-bold">Total Mutasi :</td>
                <td class="text-right font-bold">{{ formatCurrencyID(group.totalDebet) }}</td>
                <td class="text-right font-bold">{{ formatCurrencyID(group.totalKredit) }}</td>
                <td class="text-right">-</td>
              </tr>
              <tr v-if="group.isEnd" class="bukubesar-total-label-row">
                <td colspan="4" class="text-right font-bold">SALDO AKHIR :</td>
                <td class="text-right">-</td>
                <td class="text-right">-</td>
                <td class="text-right font-bold">{{ formatLabaRugiCurrency(group.saldoAwal + group.totalDebet - group.totalKredit) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="jurnal-print-footer">
        <div class="flex justify-between">
          <span>Dicetak: {{ currentPrintTime }}</span>
          <span>Halaman {{ pageIdx + 1 }} dari {{ bukubesarPages.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { formatCurrencyID, formatShortDate, formatLabaRugiCurrency } from "./printHelpers";

const props = defineProps({
  dataSource: Array,
  startDate: Date,
  endDate: Date,
  filterParams: Object,
  currentPrintTime: String,
});

const reportPeriod = computed(() => {
  const options = { day: "numeric", month: "short", year: "numeric" };
  const s = props.startDate ? new Date(props.startDate) : new Date();
  const e = props.endDate ? new Date(props.endDate) : new Date();
  return `${s.toLocaleDateString("id-ID", options)} - ${e.toLocaleDateString("id-ID", options)}`;
});

const groupedBukuBesar = computed(() => {
  const groupsMap = new Map();
  const groupsOrder = [];

  props.dataSource.forEach((item) => {
    const code = item.KodePerkiraan || item.KodeAkun || item.Kode || "";
    const name = item.NamaPerkiraan || item.NamaAkun || item.Nama || "";
    const key = `${code}_${name}`;

    const date = item.Tanggal || item.tanggal || "";
    const nobukti = item.NoBukti || item.nobukti || "";
    const keterangan = item.Keterangan || item.keterangan || "";
    const debet = Number(item.Debet || item.debet || 0);
    const kredit = Number(item.Kredit || item.kredit || 0);

    const saldoAwal = Number(item.SaldoAwal || item.saldoawal || item.SaldoAwalD || 0);

    if (!groupsMap.has(key)) {
      const newGroup = {
        code,
        name,
        saldoAwal,
        rows: [],
        totalDebet: 0,
        totalKredit: 0
      };
      groupsMap.set(key, newGroup);
      groupsOrder.push(newGroup);
    }

    const group = groupsMap.get(key);
    group.rows.push({
      tanggal: date,
      nobukti,
      keterangan,
      debet,
      kredit,
      saldo: 0
    });
  });

  groupsOrder.forEach((group) => {
    let runningSaldo = group.saldoAwal;
    group.rows.forEach((row) => {
      runningSaldo = runningSaldo + row.debet - row.kredit;
      row.saldo = runningSaldo;
      group.totalDebet += row.debet;
      group.totalKredit += row.kredit;
    });
  });

  return groupsOrder;
});

const bukubesarPages = computed(() => {
  const groups = groupedBukuBesar.value;
  const pages = [];
  let currentPageGroups = [];
  let currentLines = 0;
  const maxLinesPerPage = 28;

  groups.forEach((group) => {
    const headerLines = 3;
    const footerLines = 3;
    const totalLinesNeeded = headerLines + group.rows.length + footerLines;

    if (currentPageGroups.length === 0 || currentLines + totalLinesNeeded <= maxLinesPerPage) {
      currentPageGroups.push({
        ...group,
        isStart: true,
        isEnd: true,
        rows: [...group.rows]
      });
      currentLines += totalLinesNeeded;
    } else {
      let rowIdx = 0;
      let isGroupStart = true;

      while (rowIdx < group.rows.length) {
        const linesAvailable = maxLinesPerPage - currentLines - headerLines;
        if (linesAvailable <= 3) {
          pages.push(currentPageGroups);
          currentPageGroups = [];
          currentLines = 0;
          continue;
        }

        const rowsToTake = Math.min(linesAvailable, group.rows.length - rowIdx);
        const isGroupEnd = rowIdx + rowsToTake >= group.rows.length;

        let pageGroup = currentPageGroups.find(g => g.code === group.code);
        if (!pageGroup) {
          pageGroup = {
            code: group.code,
            name: group.name,
            isStart: isGroupStart,
            isEnd: false,
            rows: [],
            saldoAwal: group.saldoAwal,
            totalDebet: group.totalDebet,
            totalKredit: group.totalKredit
          };
          currentPageGroups.push(pageGroup);
        }

        const slice = group.rows.slice(rowIdx, rowIdx + rowsToTake);
        pageGroup.rows.push(...slice);

        currentLines += headerLines + rowsToTake;
        rowIdx += rowsToTake;

        if (isGroupEnd) {
          pageGroup.isEnd = true;
          currentLines += footerLines;
        }

        if (rowIdx < group.rows.length) {
          pages.push(currentPageGroups);
          currentPageGroups = [];
          currentLines = 0;
          isGroupStart = false;
        }
      }
    }
  });

  if (currentPageGroups.length > 0) {
    pages.push(currentPageGroups);
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
.bukubesar-group-header {
  font-size: 13px;
  font-weight: bold;
  color: #000;
  margin-top: 10px;
  margin-bottom: 4px;
  text-transform: uppercase;
}
.bukubesar-group-header-continued {
  font-size: 12px;
  font-weight: bold;
  color: #000;
  margin-top: 10px;
  margin-bottom: 4px;
  text-transform: uppercase;
  font-style: italic;
}
.bukubesar-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}
.bukubesar-table th, .bukubesar-table td {
  border: 1px solid #cbd5e1;
  padding: 6px 8px;
}
.bukubesar-table th {
  background-color: #f8fafc;
  font-weight: 600;
}
.bukubesar-saldo-awal-row td {
  background-color: #f8fafc;
}
.bukubesar-subtotal-row td {
  border-top: 2px solid #475569;
}
.bukubesar-total-label-row td {
  border-top: 1px solid #cbd5e1;
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
