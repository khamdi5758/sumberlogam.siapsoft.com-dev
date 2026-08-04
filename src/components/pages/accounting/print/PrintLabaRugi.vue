<template>
  <div class="jurnal-preview-container">
    <div
      v-for="(pageGroups, pageIdx) in labarugiPages"
      :key="pageIdx"
      class="jurnal-page-sheet"
    >
      <div class="jurnal-print-header" style="text-align: left; margin-bottom: 20px;">
        <h3 class="jurnal-report-title" style="font-size: 14px; font-weight: bold; font-family: ui-sans-serif, system-ui, sans-serif; color: #000; margin: 0 0 2px 0;">
          LAPORAN LABA RUGI
        </h3>
        <p class="jurnal-report-subtitle" style="font-size: 11px; font-weight: bold; color: #000; margin: 0;">
          Periode : {{ reportPeriod }}
        </p>
      </div>

      <div class="jurnal-table-wrapper">
        <div v-for="(group, gIdx) in pageGroups" :key="gIdx">
          <template v-if="group.type === 'group'">
            <div v-if="group.isStart" class="labarugi-group-header">
              {{ group.name }}
            </div>
            <div v-else class="labarugi-group-header-continued">
              {{ group.name }} (Sambungan)
            </div>

            <div v-for="(row, rIdx) in group.rows" :key="rIdx" class="labarugi-row">
              <div class="labarugi-cell-name">
                {{ row.code ? row.code + ' - ' : '' }}{{ row.name }}
              </div>
              <div class="labarugi-cell-amount">
                {{ formatLabaRugiCurrency(row.amount) }}
              </div>
            </div>

            <div v-if="group.isEnd" class="labarugi-subtotal-row">
              <div class="labarugi-cell-name" style="text-transform: uppercase;">
                TOTAL {{ group.name }} :
              </div>
              <div class="labarugi-cell-amount">
                {{ formatLabaRugiCurrency(group.subtotal) }}
              </div>
            </div>
          </template>

          <template v-else-if="group.type === 'netProfitLoss'">
            <div class="labarugi-netprofit-row">
              <div class="labarugi-cell-name" style="text-transform: uppercase;">
                LABA (RUGI) BERSIH :
              </div>
              <div class="labarugi-cell-amount">
                {{ formatLabaRugiCurrency(netProfitLoss) }}
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="jurnal-print-footer">
        <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: ui-sans-serif, system-ui, sans-serif; color: #000; border-top: 1px solid #000; padding-top: 4px;">
          <span>{{ pageIdx + 1 }} of {{ labarugiPages.length }}</span>
          <span>{{ currentPrintDateOnly }}</span>
          <span>{{ currentPrintTimeOnly }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { formatLabaRugiCurrency } from "./printHelpers";

const props = defineProps({
  dataSource: Array,
  endDate: Date,
  currentPrintDateOnly: String,
  currentPrintTimeOnly: String,
});

const reportPeriod = computed(() => {
  const d = props.endDate ? new Date(props.endDate) : new Date();
  return `${d.getMonth() + 1}-${d.getFullYear()}`;
});

const labarugiGroups = computed(() => {
  const groupsMap = new Map();
  const groupsOrder = [];

  props.dataSource.forEach((item) => {
    let groupName = item.NamaGrpAcc || item.nmgroup1 || item.NamaHeader || item.Header;
    if (!groupName) {
      groupName = "Lain-lain";
    }

    const code = item.perkiraan !== undefined ? item.perkiraan : item.Perkiraan;
    const name = item.Keterangan !== undefined ? item.Keterangan : (item.keterangan !== undefined ? item.keterangan : item.accountName);

    let amountVal = 0;
    if (item.Jumlah !== undefined) amountVal = Number(item.Jumlah);
    else if (item.Perhitungan !== undefined) amountVal = Number(item.Perhitungan);
    else if (item.SaldoAkhirD !== undefined) amountVal = Number(item.SaldoAkhirD);
    else if (item.NeracaSaldoAkD !== undefined) amountVal = Number(item.NeracaSaldoAkD);

    const row = { code, name, amount: amountVal };

    if (!groupsMap.has(groupName)) {
      const newGroup = {
        name: groupName,
        rows: [row],
        subtotal: amountVal
      };
      groupsMap.set(groupName, newGroup);
      groupsOrder.push(newGroup);
    } else {
      const existing = groupsMap.get(groupName);
      existing.rows.push(row);
      existing.subtotal += amountVal;
    }
  });

  return groupsOrder;
});

const netProfitLoss = computed(() => {
  return props.dataSource.reduce((acc, item) => {
    let val = 0;
    if (item.Jumlah !== undefined) val = Number(item.Jumlah);
    else if (item.Perhitungan !== undefined) val = Number(item.Perhitungan);
    else if (item.SaldoAkhirD !== undefined) val = Number(item.SaldoAkhirD);
    else if (item.NeracaSaldoAkD !== undefined) val = Number(item.NeracaSaldoAkD);
    return acc + val;
  }, 0);
});

const labarugiPages = computed(() => {
  const groups = labarugiGroups.value;
  const pages = [];
  let currentPageItems = [];
  let currentLines = 0;
  const maxLinesPerPage = 58;

  groups.forEach((group) => {
    const linesNeeded = 2 + group.rows.length + 2;

    if (currentPageItems.length === 0 || currentLines + linesNeeded <= maxLinesPerPage) {
      currentPageItems.push({
        type: "group",
        name: group.name,
        rows: group.rows,
        subtotal: group.subtotal,
        isStart: true,
        isEnd: true
      });
      currentLines += linesNeeded;
    } else {
      if (linesNeeded <= 8 || currentLines > 45) {
        pages.push(currentPageItems);
        currentPageItems = [{
          type: "group",
          name: group.name,
          rows: group.rows,
          subtotal: group.subtotal,
          isStart: true,
          isEnd: true
        }];
        currentLines = linesNeeded;
      } else {
        let rowIdx = 0;
        let isStart = true;

        while (rowIdx < group.rows.length) {
          const linesAvailable = maxLinesPerPage - currentLines - 2;

          if (linesAvailable <= 3) {
            pages.push(currentPageItems);
            currentPageItems = [];
            currentLines = 0;
            continue;
          }

          const rowsToTake = Math.min(linesAvailable, group.rows.length - rowIdx);
          const chunkRows = group.rows.slice(rowIdx, rowIdx + rowsToTake);
          rowIdx += rowsToTake;

          const isEnd = rowIdx >= group.rows.length;

          currentPageItems.push({
            type: "group",
            name: group.name,
            rows: chunkRows,
            subtotal: group.subtotal,
            isStart: isStart,
            isEnd: isEnd
          });

          currentLines += 2 + chunkRows.length + (isEnd ? 2 : 0);
          isStart = false;

          if (!isEnd) {
            pages.push(currentPageItems);
            currentPageItems = [];
            currentLines = 0;
          }
        }
      }
    }
  });

  if (currentPageItems.length > 0) {
    if (currentLines + 2 <= maxLinesPerPage) {
      currentPageItems.push({ type: "netProfitLoss" });
      pages.push(currentPageItems);
    } else {
      pages.push(currentPageItems);
      pages.push([{ type: "netProfitLoss" }]);
    }
  } else {
    pages.push([{ type: "netProfitLoss" }]);
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
.labarugi-group-header {
  font-size: 13px;
  font-weight: bold;
  color: #000;
  margin-top: 4px;
  margin-bottom: 2px;
  text-transform: uppercase;
}
.labarugi-group-header-continued {
  font-size: 12px;
  font-weight: bold;
  color: #000;
  margin-top: 4px;
  margin-bottom: 2px;
  text-transform: uppercase;
  font-style: italic;
}
.labarugi-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-family: ui-sans-serif, system-ui, sans-serif;
  color: #000;
  padding-left: 20px;
  margin-bottom: 2px;
}
.labarugi-cell-name {
  flex-grow: 1;
  text-align: left;
}
.labarugi-cell-amount {
  width: 150px;
  text-align: right;
}
.labarugi-subtotal-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: bold;
  color: #000;
  padding-left: 20px;
  margin-top: 2px;
  margin-bottom: 4px;
}
.labarugi-netprofit-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: bold;
  color: #000;
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
  padding: 6px 0;
  margin-top: 16px;
  margin-bottom: 16px;
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
    width: 100% !important;
    height: 297mm !important;
    padding: 10mm !important;
    border: none !important;
    box-shadow: none !important;
    page-break-after: always !important;
  }
}
</style>
