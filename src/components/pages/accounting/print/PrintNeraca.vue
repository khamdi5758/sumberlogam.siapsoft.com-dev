<template>
  <div class="jurnal-preview-container">
    <div
      v-for="(pageRows, pageIdx) in neracaPages"
      :key="pageIdx"
      class="jurnal-page-sheet"
    >
      <div class="jurnal-print-header" style="text-align: left; margin-bottom: 20px;">
        <h3 class="jurnal-report-title" style="font-size: 14px; font-weight: bold; font-family: ui-sans-serif, system-ui, sans-serif; color: #000; margin: 0 0 2px 0;">
          NERACA
        </h3>
        <p class="jurnal-report-subtitle" style="font-size: 12px; font-weight: bold; color: #000; margin: 0;">
          Periode : {{ neracaPeriodLong }}
        </p>
      </div>

      <div class="jurnal-table-wrapper">
        <table class="neraca-table" style="width: 100%; border-collapse: collapse; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 10px; color: #000;">
          <thead>
            <tr class="neraca-header-top">
              <th rowspan="2" style="border: 1px solid #000; padding: 4px 6px; text-align: left; width: 45%;">Keterangan</th>
              <th colspan="3" style="border: 1px solid #000; padding: 4px 6px; text-align: center; width: 38%;">
                {{ formatIndoDate(startDate) }} s/d {{ formatIndoDate(endDate) }}
              </th>
              <th rowspan="2" style="border: 1px solid #000; padding: 4px 6px; text-align: right; width: 17%;">
                S/d {{ formatIndoDate(prevMonthEnd) }}
              </th>
            </tr>
            <tr class="neraca-header-bottom">
              <th style="border: 1px solid #000; padding: 4px 6px; text-align: right; width: 15%;">Realisasi</th>
              <th style="border: 1px solid #000; padding: 4px 6px; text-align: right; width: 15%;">Budget</th>
              <th style="border: 1px solid #000; padding: 4px 6px; text-align: center; width: 8%;">%</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, rowIdx) in pageRows"
              :key="rowIdx"
              :class="[
                'neraca-data-row',
                getRowLevel(row) === 0 ? 'neraca-row-level-0 font-bold' : '',
                getRowLevel(row) === 1 ? 'neraca-row-level-1 font-bold' : '',
                getRowLevel(row) === 2 ? 'neraca-row-level-2' : ''
              ]"
            >
              <td
                :style="{
                  border: '1px solid #000',
                  padding: '4px 6px',
                  'padding-left': (6 + getRowLevel(row) * 12) + 'px'
                }"
              >
                {{ row.accountName }}
              </td>
              <td style="border: 1px solid #000; padding: 4px 6px; text-align: right;">
                {{ formatLabaRugiCurrency(row.amount) }}
              </td>
              <td style="border: 1px solid #000; padding: 4px 6px; text-align: right;"></td>
              <td style="border: 1px solid #000; padding: 4px 6px; text-align: center;"></td>
              <td style="border: 1px solid #000; padding: 4px 6px; text-align: right;">
                {{ formatLabaRugiCurrency(row.amountBulanLalu) }}
              </td>
            </tr>

            <template v-if="pageRows.length < 28">
              <tr v-for="blankIdx in (28 - pageRows.length)" :key="'blank-' + blankIdx" class="neraca-data-row-blank">
                <td style="border: 1px solid #000; height: 18px;"></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;"></td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="jurnal-print-footer">
        <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: ui-sans-serif, system-ui, sans-serif; color: #000; border-top: 1px solid #000; padding-top: 4px;">
          <span>{{ pageIdx + 1 }} of {{ neracaPages.length }}</span>
          <span>{{ currentPrintDateOnly }}</span>
          <span>{{ currentPrintTimeOnly }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { formatIndoDate, formatLabaRugiCurrency } from "./printHelpers";

const props = defineProps({
  dataSource: Array,
  startDate: Date,
  endDate: Date,
  currentPrintDateOnly: String,
  currentPrintTimeOnly: String,
});

const prevMonthEnd = computed(() => {
  if (!props.startDate) return new Date();
  const d = new Date(props.startDate);
  d.setDate(d.getDate() - 1);
  return d;
});

const neracaPeriodLong = computed(() => {
  return `${formatIndoDate(props.startDate)} sampai dengan ${formatIndoDate(props.endDate)}`;
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
  return transformToTree(props.dataSource);
});

const getRowLevel = (row) => {
  if (row.parentId === 0) return 0;
  const parent = processedDataSource.value.find(node => node.id === row.parentId);
  if (!parent) return 1;
  if (parent.parentId === 0) return 1;
  return 2;
};

const neracaPages = computed(() => {
  const list = processedDataSource.value;
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
  text-align: left;
  margin-bottom: 20px;
}
.jurnal-report-title {
  font-size: 14px;
  font-weight: bold;
  color: #000;
}
.jurnal-report-subtitle {
  font-size: 12px;
  font-weight: bold;
  color: #000;
}
.neraca-table {
  width: 100%;
  border-collapse: collapse;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 10px;
  color: #000000 !important;
}
.neraca-table th, .neraca-table td {
  border: 1px solid #000000;
  padding: 4px 6px;
  vertical-align: middle;
}
.neraca-table th {
  font-weight: bold;
  background-color: #ffffff;
}
.neraca-row-level-0 {
  font-weight: bold;
}
.neraca-row-level-1 {
  font-weight: bold;
}
.neraca-row-level-2 {
  font-weight: normal;
}
.neraca-data-row-blank td {
  border: 1px solid #000000;
  height: 18px;
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
