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
    <div v-if="hasBeenFiltered" :class="['jurnal', 'bukubesar', 'mutasi', 'biaya', 'aktivatetap', 'labarugi', 'neracalajur'].includes(type) ? 'jurnal-preview-outer' : 'card-box'">
      <!-- Kondisi Jurnal: Render PDF-style A4 Preview -->
      <template v-if="type === 'jurnal'">
        <div v-if="dataSource.length === 0" class="no-data-jurnal">
          Tidak ada data jurnal untuk periode ini.
        </div>
        <div v-else class="jurnal-preview-container">
          <div
            v-for="(pageTransactions, pageIdx) in jurnalPages"
            :key="pageIdx"
            class="jurnal-page-sheet"
          >
            <!-- Header -->
            <div class="jurnal-print-header">
              <h3 class="jurnal-report-title">{{ reportTitle }}</h3>
              <p class="jurnal-report-subtitle">Periode : {{ reportPeriod }}</p>
            </div>

            <!-- Table Container -->
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

                  <!-- Grand Total (Only on the last page) -->
                  <tr v-if="pageIdx === jurnalPages.length - 1" class="grand-total-row">
                    <td colspan="4" class="text-right font-bold py-2">
                      GRAND TOTAL :
                    </td>
                    <td class="text-right font-bold py-2">
                      {{ formatCurrencyID(grandTotalDebet) }}
                    </td>
                    <td class="text-right font-bold py-2">
                      {{ formatCurrencyID(grandTotalKredit) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Footer -->
            <div class="jurnal-print-footer">
              <div class="flex justify-between">
                <span>Dicetak: {{ currentPrintTime }}</span>
                <span>Halaman {{ pageIdx + 1 }} dari {{ jurnalPages.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Kondisi Buku Besar: Render PDF-style A4 Preview -->
      <template v-else-if="type === 'bukubesar'">
        <div v-if="dataSource.length === 0" class="no-data-jurnal">
          Tidak ada data buku besar untuk periode ini.
        </div>
        <div v-else class="jurnal-preview-container">
          <div
            v-for="(pageGroups, pageIdx) in bukubesarPages"
            :key="pageIdx"
            class="jurnal-page-sheet"
          >
            <!-- Header -->
            <div class="jurnal-print-header">
              <h3 class="jurnal-report-title">LAPORAN BUKU BESAR</h3>
              <p class="jurnal-report-subtitle">Periode : {{ reportPeriod }}</p>
              <p class="jurnal-report-subtitle" style="font-weight: normal; font-size: 13px; margin-top: 4px;">
                {{ filterParams.jurnalPenutup || 'Tanpa Jurnal Penutup' }}
              </p>
            </div>

            <!-- Table Container -->
            <div class="jurnal-table-wrapper">
              <div v-for="group in pageGroups" :key="group.code" style="margin-bottom: 24px;">
                <!-- Group Header Box (only if it starts on this page) -->
                <div v-if="group.isStart" class="bukubesar-group-header">
                  {{ group.code }} {{ group.name }}
                </div>
                <div v-else class="bukubesar-group-header-continued">
                  {{ group.code }} {{ group.name }} (Sambungan)
                </div>

                <table class="jurnal-table">
                  <thead>
                    <tr class="bukubesar-table-header-row">
                      <th style="width: 10%" class="text-left">Tanggal</th>
                      <th style="width: 20%" class="text-left">No Bukti</th>
                      <th style="width: 25%" class="text-left">Keterangan</th>
                      <th style="width: 15%" class="text-left">Lawan</th>
                      <th style="width: 10%" class="text-right">Debet</th>
                      <th style="width: 10%" class="text-right">Kredit</th>
                      <th style="width: 10%" class="text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, rowIdx) in group.rows" :key="rowIdx">
                      <td class="text-left">{{ formatShortDate(row.tanggal) }}</td>
                      <td class="text-left" style="font-weight: bold;">{{ row.nobukti }}</td>
                      <td class="text-left">{{ row.keterangan }}</td>
                      <td class="text-left">{{ row.lawan }}</td>
                      <td class="text-right">{{ formatCurrencyID(row.debet) }}</td>
                      <td class="text-right">{{ formatCurrencyID(row.kredit) }}</td>
                      <td class="text-right">{{ formatCurrencyID(row.saldo) }}</td>
                    </tr>

                    <!-- Group Footer/Totals (only if it ends on this page) -->
                    <template v-if="group.isEnd">
                      <!-- Separation line -->
                      <tr class="bukubesar-subtotal-row">
                        <td colspan="4"></td>
                        <td class="text-right border-y-black">{{ formatCurrencyID(group.totalDebet) }}</td>
                        <td class="text-right border-y-black">{{ formatCurrencyID(group.totalKredit) }}</td>
                        <td></td>
                      </tr>
                      <!-- Total Label row -->
                      <tr class="bukubesar-total-label-row">
                        <td colspan="4" class="text-center font-bold" style="padding-top: 8px;">Total</td>
                        <td class="text-right font-bold" style="padding-top: 8px;">{{ formatCurrencyID(group.totalDebet) }}</td>
                        <td class="text-right font-bold" style="padding-top: 8px;">{{ formatCurrencyID(group.totalKredit) }}</td>
                        <td></td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Footer -->
            <div class="jurnal-print-footer">
              <div class="flex justify-between">
                <span>Dicetak: {{ currentPrintTime }}</span>
                <span>Halaman {{ pageIdx + 1 }} dari {{ bukubesarPages.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Kondisi Mutasi: Render PDF-style A4 Preview -->
      <template v-else-if="type === 'mutasi'">
        <div class="jurnal-preview-container">
          <div
            v-for="(pageRows, pageIdx) in mutasiPages"
            :key="pageIdx"
            class="jurnal-page-sheet"
          >
            <!-- Header -->
            <div class="jurnal-print-header" style="text-align: left; margin-bottom: 20px;">
              <h3 class="jurnal-report-title" style="font-size: 16px; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 2px;">
                LAPORAN MUTASI
              </h3>
              <p class="jurnal-report-subtitle" style="font-size: 13px;">
                Periode : {{ reportPeriod }}
              </p>
            </div>

            <!-- Table Container -->
            <div class="jurnal-table-wrapper">
              <table class="mutasi-table">
                <thead>
                  <tr class="mutasi-header-top">
                    <th rowspan="2" style="width: 15%; text-align: left; border: 1px solid #000; padding: 6px 8px;">Perkiraan</th>
                    <th rowspan="2" style="width: 35%; text-align: left; border: 1px solid #000; padding: 6px 8px;">Keterangan</th>
                    <th colspan="2" style="width: 25%; text-align: center; border: 1px solid #000; padding: 6px 8px;">
                      {{ formatMutasiDate(endDate) }}
                    </th>
                    <th colspan="2" style="width: 25%; text-align: center; border: 1px solid #000; padding: 6px 8px;">
                      S/d {{ formatMutasiDate(endDate) }}
                    </th>
                  </tr>
                  <tr class="mutasi-header-bottom">
                    <th style="width: 12.5%; text-align: right; border: 1px solid #000; padding: 6px 8px;">Debet</th>
                    <th style="width: 12.5%; text-align: right; border: 1px solid #000; padding: 6px 8px;">Kredit</th>
                    <th style="width: 12.5%; text-align: right; border: 1px solid #000; padding: 6px 8px;">Debet</th>
                    <th style="width: 12.5%; text-align: right; border: 1px solid #000; padding: 6px 8px;">Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIdx) in pageRows" :key="rowIdx" class="mutasi-data-row">
                    <td class="text-left" style="border: 1px solid #000; padding: 5px 8px; font-weight: bold;">
                      {{ row.perkiraan }}
                    </td>
                    <td class="text-left" style="border: 1px solid #000; padding: 5px 8px;">
                      {{ row.keterangan }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 5px 8px;">
                      {{ formatCurrencyID(row.debet) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 5px 8px;">
                      {{ formatCurrencyID(row.kredit) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 5px 8px;">
                      {{ formatCurrencyID(row.sdDebet) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 5px 8px;">
                      {{ formatCurrencyID(row.sdKredit) }}
                    </td>
                  </tr>



                  <!-- Totals Row (Only on the last page) -->
                  <tr v-if="pageIdx === mutasiPages.length - 1" class="mutasi-total-row">
                    <td colspan="2" class="text-right" style="border: 1px solid #000; padding: 6px 8px; font-weight: bold; text-align: right;">
                      Total
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 6px 8px; font-weight: bold;">
                      {{ formatCurrencyID(mutasiTotals.debet) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 6px 8px; font-weight: bold;">
                      {{ formatCurrencyID(mutasiTotals.kredit) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 6px 8px; font-weight: bold;">
                      {{ formatCurrencyID(mutasiTotals.sdDebet) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 6px 8px; font-weight: bold;">
                      {{ formatCurrencyID(mutasiTotals.sdKredit) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Footer -->
            <div class="jurnal-print-footer">
              <div class="flex justify-between">
                <span>Dicetak: {{ currentPrintTime }}</span>
                <span>Halaman {{ pageIdx + 1 }} dari {{ mutasiPages.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Kondisi Biaya: Render PDF-style A4 Preview -->
      <template v-else-if="type === 'biaya'">
        <div class="jurnal-preview-container">
          <div
            v-for="(pageRows, pageIdx) in biayaPages"
            :key="pageIdx"
            class="jurnal-page-sheet"
          >
            <!-- Header -->
            <div class="jurnal-print-header" style="text-align: left; margin-bottom: 20px;">
              <h3 class="jurnal-report-title" style="font-size: 16px; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 2px;">
                LAPORAN BIAYA
              </h3>
              <p class="jurnal-report-subtitle" style="font-size: 13px;">
                Periode : {{ reportPeriod }}
              </p>
            </div>

            <!-- Table Container -->
            <div class="jurnal-table-wrapper">
              <table class="mutasi-table">
                <thead>
                  <tr class="mutasi-header-top">
                    <th style="width: 5%; text-align: left; border: 1px solid #000; padding: 6px 8px;">No</th>
                    <th style="width: 15%; text-align: left; border: 1px solid #000; padding: 6px 8px;">Perkiraan</th>
                    <th style="width: 40%; text-align: left; border: 1px solid #000; padding: 6px 8px;">Keterangan</th>
                    <th style="width: 20%; text-align: right; border: 1px solid #000; padding: 6px 8px;">
                      {{ formatMutasiDate(endDate) }}
                    </th>
                    <th style="width: 20%; text-align: right; border: 1px solid #000; padding: 6px 8px;">
                      S/d {{ formatMutasiDate(endDate) }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIdx) in pageRows" :key="rowIdx" class="mutasi-data-row">
                    <td class="text-left" style="border: 1px solid #000; padding: 5px 8px;">
                      {{ pageIdx * 18 + rowIdx + 1 }}
                    </td>
                    <td class="text-left" style="border: 1px solid #000; padding: 5px 8px; font-weight: bold;">
                      {{ row.perkiraan }}
                    </td>
                    <td class="text-left" style="border: 1px solid #000; padding: 5px 8px;">
                      {{ row.keterangan }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 5px 8px;">
                      {{ formatCurrencyID(row.bulanIni) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 5px 8px;">
                      {{ formatCurrencyID(row.sdBulanIni) }}
                    </td>
                  </tr>

                  <!-- Totals Row (Only on the last page) -->
                  <tr v-if="pageIdx === biayaPages.length - 1" class="mutasi-total-row">
                    <td colspan="3" class="text-right" style="border: 1px solid #000; padding: 6px 8px; font-weight: bold; text-align: right;">
                      Total
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 6px 8px; font-weight: bold;">
                      {{ formatCurrencyID(biayaTotals.bulanIni) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 6px 8px; font-weight: bold;">
                      {{ formatCurrencyID(biayaTotals.sdBulanIni) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Footer -->
            <div class="jurnal-print-footer">
              <div class="flex justify-between">
                <span>Dicetak: {{ currentPrintTime }}</span>
                <span>Halaman {{ pageIdx + 1 }} dari {{ biayaPages.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Kondisi Aktiva Tetap: Render PDF-style A4 Landscape Preview -->
      <template v-else-if="type === 'aktivatetap'">
        <div class="jurnal-preview-container">
          <div
            v-for="(pageRows, pageIdx) in aktivaPages"
            :key="pageIdx"
            class="jurnal-page-sheet landscape-page"
          >
            <!-- Header -->
            <div class="jurnal-print-header" style="text-align: left; margin-bottom: 15px;">
              <h3 class="jurnal-report-title" style="font-size: 16px; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 2px;">
                LAPORAN AKTIVA TETAP
              </h3>
              <p class="jurnal-report-subtitle" style="font-size: 13px;">
                Periode : {{ formatAktivaPeriod }}
              </p>
            </div>

            <!-- Table Container -->
            <div class="jurnal-table-wrapper" style="overflow-x: auto;">
              <table class="mutasi-table" style="font-size: 9px; width: 100%;">
                <thead>
                  <tr class="mutasi-header-top">
                    <th rowspan="2" style="border: 1px solid #000; padding: 4px; text-align: left; width: 6%;">No Aktiva Tetap</th>
                    <th rowspan="2" style="border: 1px solid #000; padding: 4px; text-align: left; width: 14%;">Keterangan</th>
                    <th rowspan="2" style="border: 1px solid #000; padding: 4px; text-align: center; width: 6%;">Tgl Beli</th>
                    <th rowspan="2" style="border: 1px solid #000; padding: 4px; text-align: right; width: 3%;">Jml</th>
                    <th rowspan="2" style="border: 1px solid #000; padding: 4px; text-align: right; width: 3%;">%</th>
                    <th colspan="4" style="border: 1px solid #000; padding: 4px; text-align: center;">Nilai Perolehan Aktiva Tetap</th>
                    <th colspan="3" style="border: 1px solid #000; padding: 4px; text-align: center;">Penyusutan Aktiva Tetap Tahun Berjalan</th>
                    <th colspan="2" style="border: 1px solid #000; padding: 4px; text-align: center;">Akm Penyusutan Aktiva Tetap</th>
                    <th rowspan="2" style="border: 1px solid #000; padding: 4px; text-align: right; width: 8%;">Nilai Buku</th>
                  </tr>
                  <tr class="mutasi-header-bottom">
                    <!-- Nilai Perolehan -->
                    <th style="border: 1px solid #000; padding: 4px; text-align: right; width: 7%;">s/d Bulan Lalu</th>
                    <th style="border: 1px solid #000; padding: 4px; text-align: right; width: 7%;">Penambahan Bulan ini</th>
                    <th style="border: 1px solid #000; padding: 4px; text-align: right; width: 7%;">Pengurangan Bulan ini</th>
                    <th style="border: 1px solid #000; padding: 4px; text-align: right; width: 7%;">s/d Bulan ini</th>
                    <!-- Penyusutan -->
                    <th style="border: 1px solid #000; padding: 4px; text-align: right; width: 7%;">Penambahan Bulan ini</th>
                    <th style="border: 1px solid #000; padding: 4px; text-align: right; width: 7%;">Pengurangan Bulan ini</th>
                    <th style="border: 1px solid #000; padding: 4px; text-align: right; width: 7%;">s/d Bulan ini</th>
                    <!-- Akm Penyusutan -->
                    <th style="border: 1px solid #000; padding: 4px; text-align: right; width: 7%;">s/d tahun Lalu</th>
                    <th style="border: 1px solid #000; padding: 4px; text-align: right; width: 7%;">s/d Bulan ini</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIdx) in pageRows" :key="rowIdx" class="mutasi-data-row">
                    <td class="text-left" style="border: 1px solid #000; padding: 4px; font-weight: bold; white-space: nowrap;">
                      {{ row.noAktiva }}
                    </td>
                    <td class="text-left" style="border: 1px solid #000; padding: 4px;">
                      {{ row.keterangan }}
                    </td>
                    <td class="text-center" style="border: 1px solid #000; padding: 4px; white-space: nowrap;">
                      {{ formatShortDate(row.tglBeli) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 4px;">
                      {{ row.qty }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 4px;">
                      {{ row.persen }}
                    </td>
                    <!-- Nilai Perolehan -->
                    <td class="text-right" style="border: 1px solid #000; padding: 4px;">
                      {{ formatCurrencyID(row.hpLalu) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 4px;">
                      {{ formatCurrencyID(row.hpTambah) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 4px;">
                      {{ formatCurrencyID(row.hpKurang) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 4px;">
                      {{ formatCurrencyID(row.hpKini) }}
                    </td>
                    <!-- Penyusutan -->
                    <td class="text-right" style="border: 1px solid #000; padding: 4px;">
                      {{ formatCurrencyID(row.susutTambah) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 4px;">
                      {{ formatCurrencyID(row.susutKurang) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 4px;">
                      {{ formatCurrencyID(row.susutKini) }}
                    </td>
                    <!-- Akm Penyusutan -->
                    <td class="text-right" style="border: 1px solid #000; padding: 4px;">
                      {{ formatCurrencyID(row.akmLalu) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 4px;">
                      {{ formatCurrencyID(row.akmKini) }}
                    </td>
                    <!-- Nilai Buku -->
                    <td class="text-right" style="border: 1px solid #000; padding: 4px; font-weight: bold;">
                      {{ formatCurrencyID(row.nilaiBuku) }}
                    </td>
                  </tr>

                  <!-- Totals Row (Only on the last page) -->
                  <tr v-if="pageIdx === aktivaPages.length - 1" class="mutasi-total-row">
                    <td colspan="5" class="text-right" style="border: 1px solid #000; padding: 4px; font-weight: bold; text-align: right;">
                      TOTAL
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 4px; font-weight: bold;">
                      {{ formatCurrencyID(aktivaTotals.hpLalu) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 4px; font-weight: bold;">
                      {{ formatCurrencyID(aktivaTotals.hpTambah) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 4px; font-weight: bold;">
                      {{ formatCurrencyID(aktivaTotals.hpKurang) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 4px; font-weight: bold;">
                      {{ formatCurrencyID(aktivaTotals.hpKini) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 4px; font-weight: bold;">
                      {{ formatCurrencyID(aktivaTotals.susutTambah) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 4px; font-weight: bold;">
                      {{ formatCurrencyID(aktivaTotals.susutKurang) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 4px; font-weight: bold;">
                      {{ formatCurrencyID(aktivaTotals.susutKini) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 4px; font-weight: bold;">
                      {{ formatCurrencyID(aktivaTotals.akmLalu) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 4px; font-weight: bold;">
                      {{ formatCurrencyID(aktivaTotals.akmKini) }}
                    </td>
                    <td class="text-right" style="border: 1px solid #000; padding: 4px; font-weight: bold;">
                      {{ formatCurrencyID(aktivaTotals.nilaiBuku) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Footer -->
            <div class="jurnal-print-footer">
              <div class="flex justify-between">
                <span>Dicetak: {{ currentPrintTime }}</span>
                <span>Halaman {{ pageIdx + 1 }} dari {{ aktivaPages.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Kondisi Laba Rugi: Render PDF-style A4 Preview -->
      <template v-else-if="type === 'labarugi'">
        <div v-if="dataSource.length === 0" class="no-data-jurnal">
          Tidak ada data laba rugi untuk periode ini.
        </div>
        <div v-else class="jurnal-preview-container">
          <div
            v-for="(pageGroups, pageIdx) in labarugiPages"
            :key="pageIdx"
            class="jurnal-page-sheet"
          >
            <!-- Header -->
            <div class="jurnal-print-header" style="text-align: left; margin-bottom: 20px;">
              <h3 class="jurnal-report-title" style="font-size: 14px; font-weight: bold; font-family: ui-sans-serif, system-ui, sans-serif; color: #000; margin: 0 0 2px 0;">
                Laporan : Laba / Rugi
              </h3>
              <p class="jurnal-report-subtitle" style="font-size: 12px; font-weight: bold; color: #000; margin: 0;">
                Periode : {{ labaRugiPeriod }}
              </p>
            </div>

            <!-- Table Container -->
            <div class="jurnal-table-wrapper">
              <div v-for="(item, idx) in pageGroups" :key="idx" style="margin-bottom: 12px;">
                <!-- Group Header -->
                <div v-if="item.type === 'group'" style="margin-bottom: 4px;">
                  <div v-if="item.isStart" class="labarugi-group-header">
                    {{ item.name.toUpperCase() }}
                  </div>
                  <div v-else class="labarugi-group-header-continued">
                    {{ item.name.toUpperCase() }} (Sambungan)
                  </div>

                  <!-- Rows -->
                  <div v-for="(row, rowIdx) in item.rows" :key="rowIdx" class="labarugi-row">
                    <div class="labarugi-cell-name">
                      {{ row.code }} - {{ row.name }}
                    </div>
                    <div class="labarugi-cell-amount">
                      {{ formatLabaRugiCurrency(row.amount) }}
                    </div>
                  </div>

                  <!-- Subtotal -->
                  <div v-if="item.isEnd" class="labarugi-subtotal-row">
                    <div class="labarugi-cell-name font-bold">
                      SubTotal {{ item.name }}
                    </div>
                    <div class="labarugi-cell-amount font-bold">
                      {{ formatLabaRugiCurrency(item.subtotal) }}
                    </div>
                  </div>
                </div>

                <!-- Final Net Profit / Loss -->
                <div v-else-if="item.type === 'netProfitLoss'" class="labarugi-netprofit-row">
                  <div class="labarugi-cell-name font-bold">
                    LABA / (RUGI) BERSIH :
                  </div>
                  <div class="labarugi-cell-amount font-bold">
                    {{ formatLabaRugiCurrency(netProfitLoss) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
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

      <!-- Kondisi Neraca Lajur: Render PDF-style A4 Landscape Preview -->
      <template v-else-if="type === 'neracalajur'">
        <div v-if="dataSource.length === 0" class="no-data-jurnal">
          Tidak ada data neraca lajur untuk periode ini.
        </div>
        <div v-else class="jurnal-preview-container">
          <div
            v-for="(pageRows, pageIdx) in neracalajurPages"
            :key="pageIdx"
            class="jurnal-page-sheet landscape-page"
          >
            <!-- Header -->
            <div class="jurnal-print-header" style="text-align: left; margin-bottom: 20px;">
              <h3 class="jurnal-report-title" style="font-size: 14px; font-weight: bold; font-family: ui-sans-serif, system-ui, sans-serif; color: #000; margin: 0 0 2px 0;">
                NERACA LAJUR
              </h3>
              <p class="jurnal-report-subtitle" style="font-size: 12px; font-weight: bold; color: #000; margin: 0;">
                {{ neracaLajurPeriod }}
              </p>
            </div>

            <!-- Table Container -->
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
                    <th style="width: 6.5%; text-align: right;">Debet</th>
                    <th style="width: 6.5%; text-align: right;">Kredit</th>
                    <th style="width: 6.5%; text-align: right;">Debet</th>
                    <th style="width: 6.5%; text-align: right;">Kredit</th>
                    <th style="width: 6.5%; text-align: right;">Debet</th>
                    <th style="width: 6.5%; text-align: right;">Kredit</th>
                    <th style="width: 6.5%; text-align: right;">Debet</th>
                    <th style="width: 6.5%; text-align: right;">Kredit</th>
                    <th style="width: 6.5%; text-align: right;">Debet</th>
                    <th style="width: 6.5%; text-align: right;">Kredit</th>
                    <th style="width: 6.5%; text-align: right;">Debet</th>
                    <th style="width: 6.5%; text-align: right;">Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIdx) in pageRows" :key="rowIdx" class="neracalajur-data-row">
                    <td style="text-align: left;">
                      {{ row.perkiraan }}
                    </td>
                    <td style="text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      {{ row.keterangan }}
                    </td>
                    <td style="text-align: right;">
                      {{ formatCurrencyID(row.saDebet) }}
                    </td>
                    <td style="text-align: right;">
                      {{ formatCurrencyID(row.saKredit) }}
                    </td>
                    <td style="text-align: right;">
                      {{ formatCurrencyID(row.mutasiDebet) }}
                    </td>
                    <td style="text-align: right;">
                      {{ formatCurrencyID(row.mutasiKredit) }}
                    </td>
                    <td style="text-align: right;">
                      {{ formatCurrencyID(row.penyesuaianDebet) }}
                    </td>
                    <td style="text-align: right;">
                      {{ formatCurrencyID(row.penyesuaianKredit) }}
                    </td>
                    <td style="text-align: right;">
                      {{ formatCurrencyID(row.nsDebet) }}
                    </td>
                    <td style="text-align: right;">
                      {{ formatCurrencyID(row.nsKredit) }}
                    </td>
                    <td style="text-align: right;">
                      {{ formatCurrencyID(row.lrDebet) }}
                    </td>
                    <td style="text-align: right;">
                      {{ formatCurrencyID(row.lrKredit) }}
                    </td>
                    <td style="text-align: right;">
                      {{ formatCurrencyID(row.neracaDebet) }}
                    </td>
                    <td style="text-align: right;">
                      {{ formatCurrencyID(row.neracaKredit) }}
                    </td>
                  </tr>

                  <!-- Fill remaining blank rows if it is not the last page, to keep page size consistent -->
                  <template v-if="pageIdx < neracalajurPages.length - 1">
                    <tr v-for="blankIdx in (28 - pageRows.length)" :key="'blank-' + blankIdx" class="neracalajur-data-row-blank">
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </template>

                  <!-- Totals Row (Only on the last page) -->
                  <tr v-if="pageIdx === neracalajurPages.length - 1" class="neracalajur-total-row">
                    <td colspan="2" style="text-align: left; font-weight: bold;">
                      Total
                    </td>
                    <td style="text-align: right; font-weight: bold;">
                      {{ formatCurrencyID(neracalajurTotals.saDebet) }}
                    </td>
                    <td style="text-align: right; font-weight: bold;">
                      {{ formatCurrencyID(neracalajurTotals.saKredit) }}
                    </td>
                    <td style="text-align: right; font-weight: bold;">
                      {{ formatCurrencyID(neracalajurTotals.mutasiDebet) }}
                    </td>
                    <td style="text-align: right; font-weight: bold;">
                      {{ formatCurrencyID(neracalajurTotals.mutasiKredit) }}
                    </td>
                    <td style="text-align: right; font-weight: bold;">
                      {{ formatCurrencyID(neracalajurTotals.penyesuaianDebet) }}
                    </td>
                    <td style="text-align: right; font-weight: bold;">
                      {{ formatCurrencyID(neracalajurTotals.penyesuaianKredit) }}
                    </td>
                    <td style="text-align: right; font-weight: bold;">
                      {{ formatCurrencyID(neracalajurTotals.nsDebet) }}
                    </td>
                    <td style="text-align: right; font-weight: bold;">
                      {{ formatCurrencyID(neracalajurTotals.nsKredit) }}
                    </td>
                    <td style="text-align: right; font-weight: bold;">
                      {{ formatCurrencyID(neracalajurTotals.lrDebet) }}
                    </td>
                    <td style="text-align: right; font-weight: bold;">
                      {{ formatCurrencyID(neracalajurTotals.lrKredit) }}
                    </td>
                    <td style="text-align: right; font-weight: bold;">
                      {{ formatCurrencyID(neracalajurTotals.neracaDebet) }}
                    </td>
                    <td style="text-align: right; font-weight: bold;">
                      {{ formatCurrencyID(neracalajurTotals.neracaKredit) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Footer -->
            <div class="jurnal-print-footer">
              <table style="width: 100%; border-collapse: collapse; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 8px; color: #000; margin-top: 4px;">
                <tbody>
                  <tr>
                    <!-- Page Number, Date, Time -->
                    <td style="width: 6%; text-align: left; padding: 2px 1px;">
                      {{ pageIdx + 1 }} of {{ neracalajurPages.length }}
                    </td>
                    <td style="width: 7%; text-align: left; padding: 2px 1px;">
                      {{ currentPrintDateOnly }}
                    </td>
                    <td style="width: 7%; text-align: left; padding: 2px 1px;">
                      {{ currentPrintTimeOnly }}
                    </td>
                    <!-- 12 Totals -->
                    <td style="width: 6.5%; text-align: right; padding: 2px 1px;">
                      {{ formatCurrencyID(neracalajurTotals.saDebet) }}
                    </td>
                    <td style="width: 6.5%; text-align: right; padding: 2px 1px;">
                      {{ formatCurrencyID(neracalajurTotals.saKredit) }}
                    </td>
                    <td style="width: 6.5%; text-align: right; padding: 2px 1px;">
                      {{ formatCurrencyID(neracalajurTotals.mutasiDebet) }}
                    </td>
                    <td style="width: 6.5%; text-align: right; padding: 2px 1px;">
                      {{ formatCurrencyID(neracalajurTotals.mutasiKredit) }}
                    </td>
                    <td style="width: 6.5%; text-align: right; padding: 2px 1px;">
                      {{ formatCurrencyID(neracalajurTotals.penyesuaianDebet) }}
                    </td>
                    <td style="width: 6.5%; text-align: right; padding: 2px 1px;">
                      {{ formatCurrencyID(neracalajurTotals.penyesuaianKredit) }}
                    </td>
                    <td style="width: 6.5%; text-align: right; padding: 2px 1px;">
                      {{ formatCurrencyID(neracalajurTotals.nsDebet) }}
                    </td>
                    <td style="width: 6.5%; text-align: right; padding: 2px 1px;">
                      {{ formatCurrencyID(neracalajurTotals.nsKredit) }}
                    </td>
                    <td style="width: 6.5%; text-align: right; padding: 2px 1px;">
                      {{ formatCurrencyID(neracalajurTotals.lrDebet) }}
                    </td>
                    <td style="width: 6.5%; text-align: right; padding: 2px 1px;">
                      {{ formatCurrencyID(neracalajurTotals.lrKredit) }}
                    </td>
                    <td style="width: 6.5%; text-align: right; padding: 2px 1px;">
                      {{ formatCurrencyID(neracalajurTotals.neracaDebet) }}
                    </td>
                    <td style="width: 6.5%; text-align: right; padding: 2px 1px;">
                      {{ formatCurrencyID(neracalajurTotals.neracaKredit) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
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

const formatMutasiDate = (date) => {
  if (!date) return "30 Dec 1899";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "30 Dec 1899";
  const day = d.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

const mutasiList = computed(() => {
  if (props.type !== "mutasi") return [];
  
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
  if (props.type !== "mutasi") return [];
  
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

const labarugiGroups = computed(() => {
  if (props.type !== "labarugi") return [];
  
  const groupsMap = new Map();
  const groupsOrder = [];
  
  props.dataSource.forEach((item) => {
    let groupName = item.nmgroup1 || item.NamaHeader || item.Header;
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
    
    const row = {
      code,
      name,
      amount: amountVal
    };
    
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
  if (props.type !== "labarugi") return 0;
  return labarugiGroups.value.reduce((sum, g) => sum + g.subtotal, 0);
});

const labarugiPages = computed(() => {
  if (props.type !== "labarugi") return [];
  
  const groups = labarugiGroups.value;
  const pages = [];
  let currentPageItems = [];
  let currentLines = 0;
  const maxLinesPerPage = 28;

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
      if (linesNeeded <= 8 || currentLines > 15) {
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
      currentPageItems.push({
        type: "netProfitLoss"
      });
      pages.push(currentPageItems);
    } else {
      pages.push(currentPageItems);
      pages.push([{
        type: "netProfitLoss"
      }]);
    }
  } else {
    pages.push([{
      type: "netProfitLoss"
    }]);
  }
  
  if (pages.length === 0) {
    pages.push([]);
  }
  
  return pages;
});

const labaRugiPeriod = computed(() => {
  return `${endDate.value.getMonth() + 1}-${endDate.value.getFullYear()}`;
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

const formatLabaRugiCurrency = (value) => {
  const num = Number(value || 0);
  if (num < 0) {
    return `(${Number(Math.abs(num)).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })})`;
  }
  return num.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const getFieldVal = (item, keys) => {
  for (const key of keys) {
    if (item[key] !== undefined) {
      return Number(item[key] || 0);
    }
    const lowerKey = key.toLowerCase();
    const foundKey = Object.keys(item).find(k => k.toLowerCase() === lowerKey);
    if (foundKey !== undefined) {
      return Number(item[foundKey] || 0);
    }
  }
  return 0;
};

const getStrFieldVal = (item, keys) => {
  for (const key of keys) {
    if (item[key] !== undefined) {
      return String(item[key] || "");
    }
    const lowerKey = key.toLowerCase();
    const foundKey = Object.keys(item).find(k => k.toLowerCase() === lowerKey);
    if (foundKey !== undefined) {
      return String(item[foundKey] || "");
    }
  }
  return "";
};

const neracalajurList = computed(() => {
  if (props.type !== "neracalajur") return [];
  
  return props.dataSource.map((item) => {
    const perkiraan = getStrFieldVal(item, ["Perkiraan", "perkiraan", "Kode", "KodePerkiraan", "accountCode", "KodeAkun"]);
    const keterangan = getStrFieldVal(item, ["Keterangan", "keterangan", "Nama", "NamaPerkiraan", "accountName", "NamaAkun"]);
    
    const saDebet = getFieldVal(item, ["SADebet", "saDebet", "SaldoAwalDebet", "SAD", "SA_Debet", "SaldoAwalD", "AwalDebet"]);
    const saKredit = getFieldVal(item, ["SAKredit", "saKredit", "SaldoAwalKredit", "SAK", "SA_Kredit", "SaldoAwalK", "AwalKredit"]);
    
    const mutasiDebet = getFieldVal(item, ["MutasiDebet", "mutasiDebet", "MD", "MutasiD", "MutDebet", "Debet", "debet"]);
    const mutasiKredit = getFieldVal(item, ["MutasiKredit", "mutasiKredit", "MK", "MutasiK", "MutKredit", "Kredit", "kredit"]);
    
    const penyesuaianDebet = getFieldVal(item, ["PenyesuaianDebet", "penyesuaianDebet", "PD", "PenyesuaianD", "PenyDebet"]);
    const penyesuaianKredit = getFieldVal(item, ["PenyesuaianKredit", "penyesuaianKredit", "PK", "PenyesuaianK", "PenyKredit"]);
    
    const nsDebet = getFieldVal(item, ["NeracaSaldoDebet", "neracaSaldoDebet", "NSDebet", "NSD", "NeracaSaldoD"]);
    const nsKredit = getFieldVal(item, ["NeracaSaldoKredit", "neracaSaldoKredit", "NSKredit", "NSK", "NeracaSaldoK"]);
    
    const lrDebet = getFieldVal(item, ["LabaRugiDebet", "labaRugiDebet", "LRDebet", "LRD", "LabaRugiD"]);
    const lrKredit = getFieldVal(item, ["LabaRugiKredit", "labaRugiKredit", "LRKredit", "LRK", "LabaRugiK"]);
    
    const neracaDebet = getFieldVal(item, ["NeracaDebet", "neracaDebet", "NDebet", "ND", "NeracaD"]);
    const neracaKredit = getFieldVal(item, ["NeracaKredit", "neracaKredit", "NKredit", "NK", "NeracaK"]);
    
    return {
      perkiraan,
      keterangan,
      saDebet,
      saKredit,
      mutasiDebet,
      mutasiKredit,
      penyesuaianDebet,
      penyesuaianKredit,
      nsDebet,
      nsKredit,
      lrDebet,
      lrKredit,
      neracaDebet,
      neracaKredit
    };
  });
});

const neracalajurTotals = computed(() => {
  const totals = {
    saDebet: 0,
    saKredit: 0,
    mutasiDebet: 0,
    mutasiKredit: 0,
    penyesuaianDebet: 0,
    penyesuaianKredit: 0,
    nsDebet: 0,
    nsKredit: 0,
    lrDebet: 0,
    lrKredit: 0,
    neracaDebet: 0,
    neracaKredit: 0
  };
  
  neracalajurList.value.forEach((row) => {
    totals.saDebet += row.saDebet;
    totals.saKredit += row.saKredit;
    totals.mutasiDebet += row.mutasiDebet;
    totals.mutasiKredit += row.mutasiKredit;
    totals.penyesuaianDebet += row.penyesuaianDebet;
    totals.penyesuaianKredit += row.penyesuaianKredit;
    totals.nsDebet += row.nsDebet;
    totals.nsKredit += row.nsKredit;
    totals.lrDebet += row.lrDebet;
    totals.lrKredit += row.lrKredit;
    totals.neracaDebet += row.neracaDebet;
    totals.neracaKredit += row.neracaKredit;
  });
  
  return totals;
});

const neracalajurPages = computed(() => {
  if (props.type !== "neracalajur") return [];
  
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

const neracaLajurPeriod = computed(() => {
  return `Per ${endDate.value.getMonth() + 1} - ${endDate.value.getFullYear()}`;
});

const biayaList = computed(() => {
  if (props.type !== "biaya") return [];
  
  return props.dataSource.map((item) => {
    const perkiraan = item.Perkiraan !== undefined ? item.Perkiraan : (item.perkiraan !== undefined ? item.perkiraan : "");
    const keterangan = item.Keterangan !== undefined ? item.Keterangan : (item.keterangan !== undefined ? item.keterangan : (item.NamaPerkiraan || item.namaperkiraan || item.Nama || item.nama || item.NamaAkun || item.namaakun || ""));
    
    const bulanIni = Number(item.BulanIni !== undefined ? item.BulanIni : (item.bulanini !== undefined ? item.bulanini : (item.Amount !== undefined ? item.Amount : (item.amount !== undefined ? item.amount : (item.Jumlah !== undefined ? item.Jumlah : (item.jumlah !== undefined ? item.jumlah : (item.Debet !== undefined ? item.Debet : (item.debet !== undefined ? item.debet : 0))))))));
    
    const sdBulanIni = Number(item.SdBulanIni !== undefined ? item.SdBulanIni : (item.sdbulanini !== undefined ? item.sdbulanini : (item.AmountSd !== undefined ? item.AmountSd : (item.amountSd !== undefined ? item.amountSd : (item.JumlahSd !== undefined ? item.JumlahSd : (item.jumlahSd !== undefined ? item.jumlahSd : (item.SdDebet !== undefined ? item.SdDebet : (item.sddebet !== undefined ? item.sddebet : 0))))))));

    return {
      perkiraan,
      keterangan,
      bulanIni,
      sdBulanIni
    };
  });
});

const biayaTotals = computed(() => {
  let totalBulanIni = 0;
  let totalSdBulanIni = 0;

  biayaList.value.forEach((row) => {
    totalBulanIni += row.bulanIni;
    totalSdBulanIni += row.sdBulanIni;
  });

  return {
    bulanIni: totalBulanIni,
    sdBulanIni: totalSdBulanIni
  };
});

const biayaPages = computed(() => {
  if (props.type !== "biaya") return [];
  
  const list = biayaList.value;
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

const aktivaList = computed(() => {
  if (props.type !== "aktivatetap") return [];
  
  return props.dataSource.map((item) => {
    const noAktiva = item.NoAktiva !== undefined ? item.NoAktiva : (item.no_aktiva !== undefined ? item.no_aktiva : (item.NoAktivaTetap !== undefined ? item.NoAktivaTetap : (item.Kode !== undefined ? item.Kode : (item.no !== undefined ? item.no : ""))));
    
    const keterangan = item.Keterangan !== undefined ? item.Keterangan : (item.keterangan !== undefined ? item.keterangan : (item.Nama !== undefined ? item.Nama : (item.nama !== undefined ? item.nama : "")));
    
    const tglBeli = item.TglBeli !== undefined ? item.TglBeli : (item.tglbeli !== undefined ? item.tglbeli : (item.Tanggal !== undefined ? item.Tanggal : (item.tanggal !== undefined ? item.tanggal : "")));
    
    const qty = Number(item.Jml !== undefined ? item.Jml : (item.jml !== undefined ? item.jml : (item.Qty !== undefined ? item.Qty : (item.qty !== undefined ? item.qty : 0))));
    
    const persen = Number(item.Persen !== undefined ? item.Persen : (item.persen !== undefined ? item.persen : (item.Tarif !== undefined ? item.Tarif : (item.tarif !== undefined ? item.tarif : 0))));

    // Nilai Perolehan
    const hpLalu = Number(item.HpLalu !== undefined ? item.HpLalu : (item.hplalu !== undefined ? item.hplalu : (item.NilaiBulanLalu !== undefined ? item.NilaiBulanLalu : (item.nilaibulanlalu !== undefined ? item.nilaibulanlalu : (item.PerolehanLalu !== undefined ? item.PerolehanLalu : 0)))));
    
    const hpTambah = Number(item.HpTambah !== undefined ? item.HpTambah : (item.hptambah !== undefined ? item.hptambah : (item.PenambahanBulanIni !== undefined ? item.PenambahanBulanIni : (item.penambahanbulanini !== undefined ? item.penambahanbulanini : (item.Tambah !== undefined ? item.Tambah : 0)))));
    
    const hpKurang = Number(item.HpKurang !== undefined ? item.HpKurang : (item.hpkurang !== undefined ? item.hpkurang : (item.PenguranganBulanIni !== undefined ? item.PenguranganBulanIni : (item.penguranganbulanini !== undefined ? item.penguranganbulanini : (item.Kurang !== undefined ? item.Kurang : 0)))));
    
    const hpKini = Number(item.HpKini !== undefined ? item.HpKini : (item.hpkini !== undefined ? item.hpkini : (item.NilaiBulanIni !== undefined ? item.NilaiBulanIni : (item.nilaibulanini !== undefined ? item.nilaibulanini : (item.PerolehanKini !== undefined ? item.PerolehanKini : 0)))));

    // Penyusutan Tahun Berjalan
    const susutTambah = Number(item.SusutTambah !== undefined ? item.SusutTambah : (item.susuttambah !== undefined ? item.susuttambah : (item.PenyusutanBulanIni !== undefined ? item.PenyusutanBulanIni : (item.penyusutanbulanini !== undefined ? item.penyusutanbulanini : 0))));
    
    const susutKurang = Number(item.SusutKurang !== undefined ? item.SusutKurang : (item.susutkurang !== undefined ? item.susutkurang : (item.PenyusutanPengurangan !== undefined ? item.PenyusutanPengurangan : (item.penyusutanpengurangan !== undefined ? item.penyusutanpengurangan : 0))));
    
    const susutKini = Number(item.SusutKini !== undefined ? item.SusutKini : (item.susutkini !== undefined ? item.susutkini : (item.PenyusutanKini !== undefined ? item.PenyusutanKini : (item.penyusutankini !== undefined ? item.penyusutankini : 0))));

    // Akumulasi Penyusutan
    const akmLalu = Number(item.AkmLalu !== undefined ? item.AkmLalu : (item.akmlalu !== undefined ? item.akmlalu : (item.AkmTahunLalu !== undefined ? item.AkmTahunLalu : (item.akmtahunlalu !== undefined ? item.akmtahunlalu : 0))));
    
    const akmKini = Number(item.AkmKini !== undefined ? item.AkmKini : (item.akmkini !== undefined ? item.akmkini : (item.AkmBulanIni !== undefined ? item.AkmBulanIni : (item.akmbulanini !== undefined ? item.akmbulanini : 0))));

    // Nilai Buku
    const nilaiBuku = Number(item.NilaiBuku !== undefined ? item.NilaiBuku : (item.nilaibuku !== undefined ? item.nilaibuku : (item.BookValue !== undefined ? item.BookValue : (item.bookvalue !== undefined ? item.bookvalue : 0))));

    return {
      noAktiva,
      keterangan,
      tglBeli,
      qty,
      persen,
      hpLalu,
      hpTambah,
      hpKurang,
      hpKini,
      susutTambah,
      susutKurang,
      susutKini,
      akmLalu,
      akmKini,
      nilaiBuku
    };
  });
});

const aktivaTotals = computed(() => {
  let totalHpLalu = 0;
  let totalHpTambah = 0;
  let totalHpKurang = 0;
  let totalHpKini = 0;
  let totalSusutTambah = 0;
  let totalSusutKurang = 0;
  let totalSusutKini = 0;
  let totalAkmLalu = 0;
  let totalAkmKini = 0;
  let totalNilaiBuku = 0;

  aktivaList.value.forEach((row) => {
    totalHpLalu += row.hpLalu;
    totalHpTambah += row.hpTambah;
    totalHpKurang += row.hpKurang;
    totalHpKini += row.hpKini;
    totalSusutTambah += row.susutTambah;
    totalSusutKurang += row.susutKurang;
    totalSusutKini += row.susutKini;
    totalAkmLalu += row.akmLalu;
    totalAkmKini += row.akmKini;
    totalNilaiBuku += row.nilaiBuku;
  });

  return {
    hpLalu: totalHpLalu,
    hpTambah: totalHpTambah,
    hpKurang: totalHpKurang,
    hpKini: totalHpKini,
    susutTambah: totalSusutTambah,
    susutKurang: totalSusutKurang,
    susutKini: totalSusutKini,
    akmLalu: totalAkmLalu,
    akmKini: totalAkmKini,
    nilaiBuku: totalNilaiBuku
  };
});

const aktivaPages = computed(() => {
  if (props.type !== "aktivatetap") return [];
  
  const list = aktivaList.value;
  const pages = [];
  const maxLinesPerPage = 20;
  
  for (let i = 0; i < list.length; i += maxLinesPerPage) {
    pages.push(list.slice(i, i + maxLinesPerPage));
  }
  
  if (pages.length === 0) {
    pages.push([]);
  }
  
  return pages;
});

const formatAktivaPeriod = computed(() => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const m = endDate.value.getMonth();
  const y = endDate.value.getFullYear();
  return `${months[m]} ${y}`;
});

const groupedBukuBesar = computed(() => {
  if (props.type !== "bukubesar") return [];
  
  const groups = {};
  props.dataSource.forEach((item) => {
    // Account Code field
    const perkiraanCode = item.Perkiraan !== undefined ? item.Perkiraan : (item.perkiraan !== undefined ? item.perkiraan : (item.KodePerk !== undefined ? item.KodePerk : (item.Kode !== undefined ? item.Kode : "")));
    
    // Account Name field
    const perkiraanName = item.NamaPerkiraan || item.namaperkiraan || item.Nama || item.nama || item.NamaAkun || item.namaakun || item.Keterangan || item.keterangan || "";
    
    const key = String(perkiraanCode).trim();
    if (!key) return;

    if (!groups[key]) {
      groups[key] = {
        code: key,
        name: perkiraanName,
        rows: []
      };
    }
    
    const tgl = item.tanggal || item.Tanggal || item.tgl || item.Tgl || "";
    const nobukti = item.Nobukti || item.nobukti || item.NoBukti || item.Voucher || "";
    const ket = item.keterangan || item.Keterangan || "";
    const lawan = item.Lawan || item.lawan || item.LwnPerk || "";
    const debet = Number(item.Debet !== undefined ? item.Debet : (item.debet !== undefined ? item.debet : (item.MD !== undefined ? item.MD : 0)));
    const kredit = Number(item.Kredit !== undefined ? item.Kredit : (item.kredit !== undefined ? item.kredit : (item.MK !== undefined ? item.MK : 0)));
    const saldo = Number(item.Saldo !== undefined ? item.Saldo : (item.saldo !== undefined ? item.saldo : 0));
    
    groups[key].rows.push({
      tanggal: tgl,
      nobukti: nobukti,
      keterangan: ket,
      lawan: lawan,
      debet: debet,
      kredit: kredit,
      saldo: saldo
    });
  });

  const result = Object.values(groups).map((group) => {
    // Sort: putting initial balance rows first
    const sortedRows = [...group.rows].sort((a, b) => {
      const isAInitial = String(a.nobukti).toLowerCase().includes("awal") || String(a.keterangan).toLowerCase().includes("awal");
      const isBInitial = String(b.nobukti).toLowerCase().includes("awal") || String(b.keterangan).toLowerCase().includes("awal");
      if (isAInitial && !isBInitial) return -1;
      if (!isAInitial && isBInitial) return 1;
      
      const dateA = new Date(a.tanggal);
      const dateB = new Date(b.tanggal);
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return dateA - dateB;
      }
      return 0;
    });

    let totalDebet = 0;
    let totalKredit = 0;
    sortedRows.forEach((r) => {
      totalDebet += r.debet;
      totalKredit += r.kredit;
    });

    return {
      code: group.code,
      name: group.name,
      rows: sortedRows,
      totalDebet,
      totalKredit
    };
  });

  return result.sort((a, b) => String(a.code).localeCompare(String(b.code)));
});

const bukubesarPages = computed(() => {
  if (props.type !== "bukubesar") return [];
  
  const groups = groupedBukuBesar.value;
  const pages = [];
  let currentPageGroups = [];
  let currentLines = 0;
  const maxLinesPerPage = 28; // same as Jurnal

  groups.forEach((group) => {
    const rows = group.rows;
    let rowIdx = 0;
    
    while (rowIdx < rows.length) {
      if (currentPageGroups.length === 0) {
        currentLines = 0;
      }
      
      const isGroupStart = !currentPageGroups.some(g => g.code === group.code);
      let headerLines = isGroupStart ? 3 : 0;
      let availableLines = maxLinesPerPage - currentLines - headerLines;
      
      if (isGroupStart && availableLines < 4 && currentPageGroups.length > 0) {
        pages.push(currentPageGroups);
        currentPageGroups = [];
        continue;
      }
      
      let rowsToTake = Math.min(rows.length - rowIdx, Math.max(1, availableLines));
      const isGroupEnd = (rowIdx + rowsToTake === rows.length);
      
      if (isGroupEnd) {
        const spaceNeeded = headerLines + rowsToTake + 2;
        if (currentLines + spaceNeeded > maxLinesPerPage && currentPageGroups.length > 0) {
          pages.push(currentPageGroups);
          currentPageGroups = [];
          continue;
        }
      }
      
      let pageGroup = currentPageGroups.find(g => g.code === group.code);
      if (!pageGroup) {
        pageGroup = {
          code: group.code,
          name: group.name,
          isStart: isGroupStart,
          isEnd: false,
          rows: [],
          totalDebet: group.totalDebet,
          totalKredit: group.totalKredit
        };
        currentPageGroups.push(pageGroup);
      }
      
      const slice = rows.slice(rowIdx, rowIdx + rowsToTake);
      pageGroup.rows.push(...slice);
      
      currentLines += headerLines + rowsToTake;
      rowIdx += rowsToTake;
      
      if (isGroupEnd) {
        pageGroup.isEnd = true;
        currentLines += 2;
      }
    }
  });
  
  if (currentPageGroups.length > 0) {
    pages.push(currentPageGroups);
  }
  
  return pages;
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
    // Key-agnostic resolution
    const perkiraanVal = item.perkiraan !== undefined ? item.perkiraan : item.Perkiraan;
    const keteranganVal = item.Keterangan !== undefined ? item.Keterangan : (item.keterangan !== undefined ? item.keterangan : item.accountName);
    
    // Group 1 resolution (e.g. nmgroup1 or NamaHeader)
    let grp1Key = item.nmgroup1 || item.NamaHeader;
    if (!grp1Key && item.Header) {
      grp1Key = item.Header;
    }
    if (!grp1Key) {
      grp1Key = "Lain-lain";
    }

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

    // Group 2 resolution (e.g. NamaGrpAcc or Header)
    let grp2KeyName = item.NamaGrpAcc || item.Header || String(item.KodeGrpAcc || "");
    if (!grp2KeyName) {
      grp2KeyName = "Detail";
    }
    const grp2Key = `${grp1Key}_${grp2KeyName}`;
    
    let grp2Id;
    if (!registeredGroups.has(grp2Key)) {
      grp2Id = nextId++;
      registeredGroups.set(grp2Key, grp2Id);
      tree.push({
        id: grp2Id,
        parentId: grp1Id,
        accountName: grp2KeyName,
        amount: 0,
        amountBulanLalu: 0,
        type: "header"
      });
    } else {
      grp2Id = registeredGroups.get(grp2Key);
    }

    // Amount resolution:
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

// Jurnal Specific Computations & Helpers
const formatCurrencyID = (value) => {
  const num = Number(value || 0);
  return num.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

const groupedTransactions = computed(() => {
  if (props.type !== "jurnal") return [];
  
  const groups = {};
  props.dataSource.forEach((item) => {
    const key = item.Nobukti;
    if (!groups[key]) {
      groups[key] = {
        Nobukti: item.Nobukti,
        tanggal: item.tanggal,
        JenisLaporan: item.JenisLaporan || "LAPORAN JURNAL",
        tgl1: item.tgl1,
        tgl2: item.tgl2,
        details: []
      };
    }
    groups[key].details.push(item);
  });

  // Sort details within each group by Urut/Prioritas
  Object.values(groups).forEach(g => {
    g.details.sort((a, b) => {
      if (a.Urut !== undefined && b.Urut !== undefined) {
        return a.Urut - b.Urut;
      }
      return String(a.Prioritas || "").localeCompare(String(b.Prioritas || ""));
    });
  });

  // Return as sorted list by date and Nobukti
  return Object.values(groups).sort((a, b) => {
    const dateCompare = new Date(a.tanggal) - new Date(b.tanggal);
    if (dateCompare !== 0) return dateCompare;
    return String(a.Nobukti).localeCompare(String(b.Nobukti));
  });
});

const jurnalPages = computed(() => {
  if (props.type !== "jurnal") return [];
  
  const transactions = groupedTransactions.value;
  const pages = [];
  let currentPage = [];
  let currentLines = 0;
  const maxLinesPerPage = 28; // A safe count of detail lines per A4 print page

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
  
  return pages;
});

const getGlobalIndex = (pageIdx, txIdx) => {
  let index = 1;
  for (let i = 0; i < pageIdx; i++) {
    index += jurnalPages.value[i].length;
  }
  return index + txIdx;
};

const reportTitle = computed(() => {
  if (props.dataSource.length > 0 && props.dataSource[0].JenisLaporan) {
    return `LAPORAN ${props.dataSource[0].JenisLaporan.toUpperCase()}`;
  }
  return "LAPORAN JURNAL";
});

const reportPeriod = computed(() => {
  if (props.dataSource.length > 0 && props.dataSource[0].tgl1 && props.dataSource[0].tgl2) {
    const formatDateFull = (dateStr) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };
    return `${formatDateFull(props.dataSource[0].tgl1)} - ${formatDateFull(props.dataSource[0].tgl2)}`;
  }
  
  const formatDateFull = (d) => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  return `${formatDateFull(startDate.value)} - ${formatDateFull(endDate.value)}`;
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

const grandTotalDebet = computed(() => {
  return props.dataSource.reduce((sum, item) => sum + Number(item.Debet || 0), 0);
});

const grandTotalKredit = computed(() => {
  return props.dataSource.reduce((sum, item) => sum + Number(item.kredit || 0), 0);
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

/* Jurnal Print Preview CSS */
.jurnal-preview-outer {
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
  background: transparent !important;
}

.no-data-jurnal {
  background-color: white;
  padding: 2.5rem;
  text-align: center;
  font-size: 14px;
  color: #64748b;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
}

.jurnal-preview-container {
  background-color: #f1f5f9; /* Slate-100 */
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
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
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
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #000000 !important;
  margin: 0 0 4px 0;
  text-transform: uppercase;
}

.jurnal-report-subtitle {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  color: #000000 !important;
  margin: 0;
}

.jurnal-table {
  width: 100%;
  border-collapse: collapse;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 12px;
  color: #000000 !important;
}

.jurnal-table th {
  border-top: 1px solid #000000;
  border-bottom: 1px solid #000000;
  padding: 6px 4px;
  font-weight: bold;
  text-align: left;
}

.jurnal-table th.text-right {
  text-align: right;
}

.jurnal-table td {
  padding: 5px 4px;
  vertical-align: top;
}

.jurnal-table tr.transaction-divider td {
  border-bottom: 1px solid #000000;
}

.jurnal-table tr.grand-total-row td {
  border-top: 1px solid #000000;
  border-bottom: 4px double #000000;
  font-weight: bold;
  font-size: 13px;
}

.jurnal-print-footer {
  margin-top: 1.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
  font-size: 11px;
  color: #64748b;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* Buku Besar Styles */
.bukubesar-group-header {
  border: 1px solid #000000;
  padding: 6px 12px;
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 8px;
  text-align: left;
}

.bukubesar-group-header-continued {
  font-weight: bold;
  font-size: 11px;
  color: #555555;
  margin-bottom: 4px;
  text-align: left;
  font-style: italic;
}

.bukubesar-table-header-row {
  border-top: 1px solid #000000;
  border-bottom: 1px solid #000000;
  font-weight: bold;
}

.bukubesar-table-header-row th {
  padding: 6px 4px;
}

.border-y-black {
  border-top: 1px solid #000000;
  border-bottom: 1px solid #000000;
  font-weight: bold;
  padding: 6px 4px;
}

.bukubesar-subtotal-row td {
  padding: 4px 4px;
}

.bukubesar-total-label-row td {
  padding: 8px 4px 4px 4px;
}

/* Mutasi Table Styles */
.mutasi-table {
  width: 100%;
  border-collapse: collapse;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 11px;
  color: #000000 !important;
}

.mutasi-table th, .mutasi-table td {
  border: 1px solid #000000;
  padding: 5px 8px;
}

.mutasi-table th {
  font-weight: bold;
  background-color: #ffffff;
}

.mutasi-table td {
  vertical-align: middle;
}

.mutasi-data-row-blank td {
  border: 1px solid #000000;
  height: 25px;
}

/* Laba Rugi Styles */
.labarugi-group-header {
  font-size: 13px;
  font-weight: bold;
  color: #000000;
  margin-top: 10px;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.labarugi-group-header-continued {
  font-size: 12px;
  font-weight: bold;
  color: #000000;
  margin-top: 10px;
  margin-bottom: 4px;
  text-transform: uppercase;
  font-style: italic;
}

.labarugi-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-family: ui-sans-serif, system-ui, sans-serif;
  color: #000000;
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
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.labarugi-subtotal-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: bold;
  color: #000000;
  padding-left: 20px;
  margin-top: 4px;
  margin-bottom: 12px;
}

.labarugi-netprofit-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: bold;
  color: #000000;
  border-top: 2px solid #000000;
  border-bottom: 2px solid #000000;
  padding: 6px 0;
  margin-top: 16px;
  margin-bottom: 16px;
}

/* Neraca Lajur Styles */
.neracalajur-table {
  width: 100%;
  border-collapse: collapse;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 8px;
  color: #000000 !important;
  table-layout: fixed;
}

.neracalajur-table th, .neracalajur-table td {
  border: 1px solid #000000;
  padding: 2px 2px;
  vertical-align: middle;
  white-space: nowrap;
}

.neracalajur-table th {
  font-weight: bold;
  background-color: #ffffff;
}

.neracalajur-header-top th {
  border: 1px solid #000000;
}

.neracalajur-header-bottom th {
  border: 1px solid #000000;
}

.neracalajur-data-row td {
  border: 1px solid #000000;
}

.neracalajur-data-row-blank td {
  border: 1px solid #000000;
  height: 25px;
}

.neracalajur-total-row td {
  border: 1px solid #000000;
  font-weight: bold;
  background-color: #ffffff;
}

@media print {
  .jurnal-preview-container {
    background-color: transparent !important;
    padding: 0 !important;
    gap: 0 !important;
    display: block !important;
    overflow: visible !important;
  }

  .jurnal-page-sheet {
    width: 100% !important;
    min-height: auto !important;
    height: 297mm !important;
    padding: 10mm !important;
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
    page-break-after: always !important;
    break-after: page !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    box-sizing: border-box !important;
  }

  .jurnal-page-sheet.landscape-page {
    width: 297mm !important;
    height: 210mm !important;
    min-height: auto !important;
    padding: 10mm !important;
  }
}

.jurnal-page-sheet.landscape-page {
  width: 297mm;
  min-height: 210mm;
  padding: 10mm 15mm;
}
</style>