<template>
  <div class="jurnal-preview-container">
    <div
      v-for="(pageRows, pageIdx) in aktivaPages"
      :key="pageIdx"
      class="jurnal-page-sheet landscape-page"
    >
      <div class="jurnal-print-header" style="text-align: left; margin-bottom: 20px;">
        <h3 class="jurnal-report-title" style="font-size: 14px; font-weight: bold; font-family: ui-sans-serif, system-ui, sans-serif; color: #000; margin: 0 0 2px 0;">
          DAFTAR AKTIVA TETAP
        </h3>
        <p class="jurnal-report-subtitle" style="font-size: 11px; font-weight: bold; color: #000; margin: 0;">
          Tgl. Pembukuan s/d : {{ formatIndoDate(endDate) }}
        </p>
      </div>

      <div class="jurnal-table-wrapper">
        <table class="neracalajur-table">
          <thead>
            <tr class="neracalajur-header-top">
              <th rowspan="2" style="width: 3%">No</th>
              <th rowspan="2" style="width: 7%">No Aktiva</th>
              <th rowspan="2" style="width: 14%">Keterangan</th>
              <th rowspan="2" style="width: 6%">Tgl Beli</th>
              <th rowspan="2" style="width: 3%">Qty</th>
              <th rowspan="2" style="width: 3%">%</th>
              <th colspan="4" style="width: 28%">Nilai Perolehan</th>
              <th colspan="3" style="width: 21%">Penyusutan Tahun Ini</th>
              <th colspan="2" style="width: 15%">Penyusutan Kumulatif</th>
              <th rowspan="2" style="width: 8%">Nilai Buku</th>
            </tr>
            <tr class="neracalajur-header-bottom">
              <th>Bulan Lalu</th>
              <th>Tambah</th>
              <th>Kurang</th>
              <th>Bulan Ini</th>
              <th>Tambah</th>
              <th>Kurang</th>
              <th>Bulan Ini</th>
              <th>Bulan Lalu</th>
              <th>Bulan Ini</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rIdx) in pageRows" :key="rIdx" class="neracalajur-data-row">
              <td>{{ rIdx + 1 }}.</td>
              <td>{{ row.noAktiva }}</td>
              <td class="text-left">{{ row.keterangan }}</td>
              <td>{{ formatShortDate(row.tglBeli) }}</td>
              <td>{{ row.qty }}</td>
              <td>{{ row.persen }}%</td>
              <td class="text-right">{{ formatCurrency(row.hpLalu) }}</td>
              <td class="text-right">{{ formatCurrency(row.hpTambah) }}</td>
              <td class="text-right">{{ formatCurrency(row.hpKurang) }}</td>
              <td class="text-right">{{ formatCurrency(row.hpKini) }}</td>
              <td class="text-right">{{ formatCurrency(row.susutTambah) }}</td>
              <td class="text-right">{{ formatCurrency(row.susutKurang) }}</td>
              <td class="text-right">{{ formatCurrency(row.susutKini) }}</td>
              <td class="text-right">{{ formatCurrency(row.akmLalu) }}</td>
              <td class="text-right">{{ formatCurrency(row.akmKini) }}</td>
              <td class="text-right">{{ formatCurrency(row.nilaiBuku) }}</td>
            </tr>

            <template v-if="pageIdx < aktivaPages.length - 1">
              <tr v-for="blankIdx in (28 - pageRows.length)" :key="'blank-' + blankIdx" class="neracalajur-data-row-blank">
                <td v-for="n in 16" :key="n"></td>
              </tr>
            </template>

            <tr v-if="pageIdx === aktivaPages.length - 1" class="neracalajur-total-row">
              <td colspan="6" class="text-right font-bold">TOTAL :</td>
              <td class="text-right font-bold">{{ formatCurrency(aktivaTotals.hpLalu) }}</td>
              <td class="text-right font-bold">{{ formatCurrency(aktivaTotals.hpTambah) }}</td>
              <td class="text-right font-bold">{{ formatCurrency(aktivaTotals.hpKurang) }}</td>
              <td class="text-right font-bold">{{ formatCurrency(aktivaTotals.hpKini) }}</td>
              <td class="text-right font-bold">{{ formatCurrency(aktivaTotals.susutTambah) }}</td>
              <td class="text-right font-bold">{{ formatCurrency(aktivaTotals.susutKurang) }}</td>
              <td class="text-right font-bold">{{ formatCurrency(aktivaTotals.susutKini) }}</td>
              <td class="text-right font-bold">{{ formatCurrency(aktivaTotals.akmLalu) }}</td>
              <td class="text-right font-bold">{{ formatCurrency(aktivaTotals.akmKini) }}</td>
              <td class="text-right font-bold">{{ formatCurrency(aktivaTotals.nilaiBuku) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="jurnal-print-footer">
        <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: ui-sans-serif, system-ui, sans-serif; color: #000; border-top: 1px solid #000; padding-top: 4px;">
          <span>{{ pageIdx + 1 }} of {{ aktivaPages.length }}</span>
          <span>{{ currentPrintDateOnly }}</span>
          <span>{{ currentPrintTimeOnly }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { formatCurrency, formatShortDate, formatIndoDate } from "./printHelpers";

const props = defineProps({
  dataSource: Array,
  endDate: Date,
  currentPrintDateOnly: String,
  currentPrintTimeOnly: String,
});

const aktivaList = computed(() => {
  return props.dataSource.map((item) => {
    const noAktiva = item.NoAktiva !== undefined ? item.NoAktiva : (item.no_aktiva !== undefined ? item.no_aktiva : (item.NoAktivaTetap !== undefined ? item.NoAktivaTetap : (item.Kode !== undefined ? item.Kode : (item.no !== undefined ? item.no : ""))));
    const keterangan = item.Keterangan !== undefined ? item.Keterangan : (item.keterangan !== undefined ? item.keterangan : (item.Nama !== undefined ? item.Nama : (item.nama !== undefined ? item.nama : "")));
    const tglBeli = item.TglBeli !== undefined ? item.TglBeli : (item.tglbeli !== undefined ? item.tglbeli : (item.Tanggal !== undefined ? item.Tanggal : (item.tanggal !== undefined ? item.tanggal : "")));
    const qty = Number(item.Jml !== undefined ? item.Jml : (item.jml !== undefined ? item.jml : (item.Qty !== undefined ? item.Qty : (item.qty !== undefined ? item.qty : 0))));
    const persen = Number(item.Persen !== undefined ? item.Persen : (item.persen !== undefined ? item.persen : (item.Tarif !== undefined ? item.Tarif : (item.tarif !== undefined ? item.tarif : 0))));

    const hpLalu = Number(item.HpLalu !== undefined ? item.HpLalu : (item.hplalu !== undefined ? item.hplalu : (item.NilaiBulanLalu !== undefined ? item.NilaiBulanLalu : (item.nilaibulanlalu !== undefined ? item.nilaibulanlalu : (item.PerolehanLalu !== undefined ? item.PerolehanLalu : 0)))));
    const hpTambah = Number(item.HpTambah !== undefined ? item.HpTambah : (item.hptambah !== undefined ? item.hptambah : (item.PenambahanBulanIni !== undefined ? item.PenambahanBulanIni : (item.penambahanbulanini !== undefined ? item.penambahanbulanini : (item.Tambah !== undefined ? item.Tambah : 0)))));
    const hpKurang = Number(item.HpKurang !== undefined ? item.HpKurang : (item.hpkurang !== undefined ? item.hpkurang : (item.PenguranganBulanIni !== undefined ? item.PenguranganBulanIni : (item.penguranganbulanini !== undefined ? item.penguranganbulanini : (item.Kurang !== undefined ? item.Kurang : 0)))));
    const hpKini = Number(item.HpKini !== undefined ? item.HpKini : (item.hpkini !== undefined ? item.hpkini : (item.NilaiBulanIni !== undefined ? item.NilaiBulanIni : (item.nilaibulanini !== undefined ? item.nilaibulanini : (item.PerolehanKini !== undefined ? item.PerolehanKini : 0)))));

    const susutTambah = Number(item.SusutTambah !== undefined ? item.SusutTambah : (item.susuttambah !== undefined ? item.susuttambah : (item.PenyusutanBulanIni !== undefined ? item.PenyusutanBulanIni : (item.penyusutanbulanini !== undefined ? item.penyusutanbulanini : 0))));
    const susutKurang = Number(item.SusutKurang !== undefined ? item.SusutKurang : (item.susutkurang !== undefined ? item.susutkurang : (item.PenyusutanPengurangan !== undefined ? item.PenyusutanPengurangan : (item.penyusutanpengurangan !== undefined ? item.penyusutanpengurangan : 0))));
    const susutKini = Number(item.SusutKini !== undefined ? item.SusutKini : (item.susutkini !== undefined ? item.susutkini : (item.PenyusutanKini !== undefined ? item.PenyusutanKini : (item.penyusutankini !== undefined ? item.penyusutankini : 0))));

    const akmLalu = Number(item.AkmLalu !== undefined ? item.AkmLalu : (item.akmlalu !== undefined ? item.akmlalu : (item.AkmTahunLalu !== undefined ? item.AkmTahunLalu : (item.akmtahunlalu !== undefined ? item.akmtahunlalu : 0))));
    const akmKini = Number(item.AkmKini !== undefined ? item.AkmKini : (item.akmkini !== undefined ? item.akmkini : (item.AkmBulanIni !== undefined ? item.AkmBulanIni : (item.akmbulanini !== undefined ? item.akmbulanini : 0))));
    const nilaiBuku = Number(item.NilaiBuku !== undefined ? item.NilaiBuku : (item.nilaibuku !== undefined ? item.nilaibuku : (item.BookValue !== undefined ? item.BookValue : (item.bookvalue !== undefined ? item.bookvalue : 0))));

    return {
      noAktiva, keterangan, tglBeli, qty, persen,
      hpLalu, hpTambah, hpKurang, hpKini,
      susutTambah, susutKurang, susutKini,
      akmLalu, akmKini, nilaiBuku
    };
  });
});

const aktivaTotals = computed(() => {
  let totals = { hpLalu: 0, hpTambah: 0, hpKurang: 0, hpKini: 0, susutTambah: 0, susutKurang: 0, susutKini: 0, akmLalu: 0, akmKini: 0, nilaiBuku: 0 };
  aktivaList.value.forEach((row) => {
    Object.keys(totals).forEach(key => { totals[key] += row[key]; });
  });
  return totals;
});

const aktivaPages = computed(() => {
  const list = aktivaList.value;
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
  font-weight: bold;
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
