<template>
  <!-- ============ LEMBAR KERTAS ============ -->
  <div class="report-sheet">
    <!-- Kop laporan -->
    <div class="report-head">
      <div class="company">PT SIAP INTEGRASI</div>
      <h1 class="title">Register Purchase Order</h1>
      <div class="period">Periode 01 Agustus 2026 &ndash; 31 Agustus 2026</div>
    </div>

    <DxDataGrid
      class="report-grid"
      :data-source="dataSource"
      key-expr="Id"
      :show-borders="false"
      :show-column-lines="false"
      :show-row-lines="true"
      :row-alternation-enabled="false"
      :hover-state-enabled="true"
      :column-auto-width="true"
      :word-wrap-enabled="false"
      :allow-column-resizing="true"
      column-resizing-mode="widget"
      @exporting="onExporting"
    >
      <DxLoadPanel :enabled="true" />
      <DxScrolling mode="virtual" :use-native="true" />
      <DxGrouping :auto-expand-all="true" />
      <DxGroupPanel :visible="false" />
      <DxHeaderFilter :visible="true" />
      <DxColumnFixing :enabled="true" />

      <DxColumn data-field="NoBukti"    caption="No. Bukti" :group-index="0" />
      <DxColumn data-field="Tanggal"    caption="Tanggal" data-type="date" format="dd/MM/yyyy" :width="90" />
      <DxColumn data-field="KodeSupp"   caption="Kode Supp" :width="90" />
      <DxColumn data-field="NamaSupp"   caption="Nama Supplier" :min-width="200" />
      <DxColumn data-field="PPN"        caption="PPN" :width="60" alignment="center" />
      <DxColumn data-field="Kodebrg"    caption="Kode Barang" :width="110" />
      <DxColumn data-field="NamaBrg"    caption="Nama Barang" :min-width="220" />
      <DxColumn data-field="Satuan"     caption="Satuan" :width="70" alignment="center" />
      <DxColumn data-field="Qnt"        caption="Qty"     :width="90"  format="#,##0.###" />
      <DxColumn data-field="Harga"      caption="Harga"   :width="110" format="#,##0.00" />
      <DxColumn data-field="Diskon"     caption="Diskon"  :width="90"  format="#,##0.00" />
      <DxColumn data-field="Jumlah"     caption="Jumlah"  :width="130" format="#,##0.00" />

      <DxSummary>
        <!-- Subtotal per No. Bukti -->
        <DxGroupItem
          column="Jumlah" summary-type="sum"
          :show-in-group-footer="true" :align-by-column="true"
          value-format="#,##0.00" display-format="{0}"
        />
        <DxGroupItem
          column="Diskon" summary-type="sum"
          :show-in-group-footer="true" :align-by-column="true"
          value-format="#,##0.00" display-format="{0}"
        />
        <!-- Grand total -->
        <DxTotalItem
          column="Jumlah" summary-type="sum"
          value-format="#,##0.00" display-format="{0}"
        />
        <DxTotalItem
          column="NamaBrg" summary-type="count"
          display-format="{0} baris"
        />
      </DxSummary>
    </DxDataGrid>

    <!-- Kaki laporan -->
    <footer class="report-foot">
      <span>Dicetak: {{ printedAt }}</span>
      <span>Oleh: {{ userName }}</span>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  DxDataGrid, DxColumn, DxGrouping, DxGroupPanel, DxScrolling,
  DxSummary, DxGroupItem, DxTotalItem, DxHeaderFilter,
  DxColumnFixing, DxLoadPanel
} from 'devextreme-vue/data-grid'

const props = defineProps({
  dataSource: { type: [Array, Object], default: () => [] },
  userName:   { type: String, default: 'admin' }
})

const printedAt = computed(() =>
  new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())
)

function onExporting (e) { /* biarkan default / isi sesuai kebutuhan */ }
</script>

<style scoped>
/* ============================================================
   TOKEN
   ============================================================ */
.report-sheet {
  --ink:        #16181d;   /* teks utama          */
  --ink-soft:   #5b6068;   /* teks sekunder       */
  --rule-heavy: #16181d;   /* garis tebal ledger  */
  --rule-mid:   #b8bcc2;   /* garis grup          */
  --rule-hair:  #e8e9ec;   /* garis antar baris   */
  --paper:      #ffffff;
  --paper-edge: #e3e4e8;
  --tint:       #f7f8f9;   /* hover / seleksi     */

  --font-body: "Inter", ui-sans-serif, "Segoe UI", Roboto, Arial, sans-serif;
  --font-num:  "Roboto Mono", ui-monospace, "Consolas", monospace;
}

/* ============================================================
   LEMBAR KERTAS
   ============================================================ */
.report-sheet {
  background: var(--paper);
  color: var(--ink);
  max-width: 1240px;
  margin: 20px auto;
  padding: 34px 38px 20px;
  border: 1px solid var(--paper-edge);
  border-radius: 2px;
  box-shadow: 0 1px 1px rgba(16, 18, 24, .04), 0 10px 28px rgba(16, 18, 24, .07);
  font-family: var(--font-body);
}

/* ---- Kop ---- */
.report-head { text-align: center; padding-bottom: 12px; }
.report-head .company {
  font-size: 12px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
}
.report-head .title {
  font-size: 19px; font-weight: 600; letter-spacing: -.01em; margin: 4px 0 2px;
}
.report-head .period { font-size: 11.5px; color: var(--ink-soft); }
.report-head::after {
  content: ""; display: block; margin-top: 14px;
  border-bottom: 2px solid var(--rule-heavy);
}

/* ---- Kaki ---- */
.report-foot {
  display: flex; justify-content: space-between;
  margin-top: 14px; padding-top: 8px;
  border-top: 1px solid var(--rule-hair);
  font-size: 10.5px; color: var(--ink-soft);
}

/* ============================================================
   OVERRIDE DEVEXTREME
   ============================================================ */
.report-sheet :deep(.dx-datagrid),
.report-sheet :deep(.dx-datagrid-rowsview),
.report-sheet :deep(.dx-datagrid-headers),
.report-sheet :deep(.dx-datagrid-total-footer) {
  background: transparent;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 12.5px;
}
.report-sheet :deep(.dx-datagrid-borders > *) { border: none !important; }

/* ---- Header: aturan ledger, tebal atas & bawah ---- */
.report-sheet :deep(.dx-datagrid-headers) {
  border-bottom: 1px solid var(--rule-heavy) !important;
  color: var(--ink);
}
.report-sheet :deep(.dx-header-row > td) {
  background: var(--paper) !important;
  padding: 4px 10px 9px !important;
  font-size: 10.5px !important;
  font-weight: 700;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--ink);
  vertical-align: bottom;
  border: none !important;
}
.report-sheet :deep(.dx-datagrid-headers .dx-datagrid-table .dx-row > td) {
  border-bottom: none !important;
}

/* ---- Baris data ---- */
.report-sheet :deep(.dx-datagrid-rowsview .dx-data-row > td) {
  background: var(--paper) !important;
  border-bottom: 1px solid var(--rule-hair) !important;
  border-top: none !important;
  padding: 7px 10px !important;
  line-height: 1.35;
}
.report-sheet :deep(.dx-datagrid .dx-row-alt > td) { background: var(--paper) !important; }

/* Angka: tabular supaya kolom digit sejajar */
.report-sheet :deep(.dx-datagrid td[role="gridcell"].dx-datagrid-nowrap),
.report-sheet :deep(.dx-datagrid .dx-data-row > td) {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}

/* ---- Baris grup: putih, bukan biru ---- */
.report-sheet :deep(.dx-datagrid-rowsview .dx-group-row) { background: var(--paper) !important; }
.report-sheet :deep(.dx-datagrid-rowsview .dx-group-row > td) {
  background: var(--paper) !important;
  color: var(--ink) !important;
  font-weight: 700;
  font-size: 12.5px;
  padding: 18px 10px 6px !important;
  border-top: none !important;
  border-bottom: 1px solid var(--rule-mid) !important;
}
.report-sheet :deep(.dx-datagrid-group-closed),
.report-sheet :deep(.dx-datagrid-group-opened) { color: var(--ink-soft); }

/* ---- Subtotal per grup ---- */
.report-sheet :deep(.dx-datagrid-rowsview .dx-datagrid-group-footer > td) {
  background: var(--paper) !important;
  border-top: 1px solid var(--rule-mid) !important;
  border-bottom: none !important;
  padding: 6px 10px 16px !important;
  font-weight: 600;
}

/* ---- Grand total: garis ganda ala buku besar ---- */
.report-sheet :deep(.dx-datagrid-total-footer) {
  border-top: 1px solid var(--rule-heavy) !important;
  border-bottom: 3px double var(--rule-heavy) !important;
}
.report-sheet :deep(.dx-datagrid-total-footer > .dx-datagrid-content) { padding: 0; }
.report-sheet :deep(.dx-datagrid-total-footer td) {
  background: var(--paper) !important;
  padding: 9px 10px !important;
  border: none !important;
}
.report-sheet :deep(.dx-datagrid-summary-item) {
  color: var(--ink) !important;
  font-weight: 700;
}

/* ---- Matikan seluruh warna biru bawaan tema ---- */
.report-sheet :deep(.dx-datagrid-rowsview .dx-row.dx-state-hover:not(.dx-header-row) > td) {
  background: var(--tint) !important;
  color: var(--ink) !important;
}
.report-sheet :deep(.dx-datagrid-rowsview .dx-selection > td),
.report-sheet :deep(.dx-datagrid-rowsview .dx-selection.dx-row > td),
.report-sheet :deep(.dx-row-focused.dx-data-row > td),
.report-sheet :deep(.dx-row-focused.dx-group-row > td) {
  background: var(--tint) !important;
  color: var(--ink) !important;
  border-bottom-color: var(--rule-hair) !important;
}
.report-sheet :deep(.dx-datagrid-focus-overlay) { display: none; }
.report-sheet :deep(.dx-datagrid-rowsview .dx-master-detail-row > td) { background: var(--paper) !important; }

/* ---- Toolbar: ikon datar, tanpa kotak biru ---- */
.report-sheet :deep(.dx-datagrid-header-panel) {
  border-bottom: none;
  padding-bottom: 4px;
}
.report-sheet :deep(.dx-datagrid-header-panel .dx-toolbar) { background: transparent; }
.report-sheet :deep(.dx-datagrid-header-panel .dx-button) {
  background: transparent !important;
  border: 1px solid transparent !important;
  box-shadow: none !important;
  color: var(--ink-soft) !important;
}
.report-sheet :deep(.dx-datagrid-header-panel .dx-button.dx-state-hover) {
  background: var(--tint) !important;
  border-color: var(--paper-edge) !important;
  color: var(--ink) !important;
}

/* ---- Scrollbar tipis ---- */
.report-sheet :deep(.dx-scrollable-container) {
  scrollbar-width: thin;
  scrollbar-color: rgba(22, 24, 29, 0.22) transparent;
}
.report-sheet :deep(.dx-scrollable-container::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}
.report-sheet :deep(.dx-scrollable-container::-webkit-scrollbar-track) {
  background: transparent;
}
.report-sheet :deep(.dx-scrollable-container::-webkit-scrollbar-thumb) {
  background: rgba(22, 24, 29, 0.22);
  border-radius: 4px;
}
.report-sheet :deep(.dx-scrollable-container::-webkit-scrollbar-thumb:hover) {
  background: rgba(22, 24, 29, 0.4);
}

/* ============================================================
   CETAK — grid jadi benar-benar selembar kertas
   ============================================================ */
@media print {
  .report-sheet {
    max-width: none; margin: 0; padding: 0;
    border: none; box-shadow: none;
  }
  .report-head {
    display: block !important;
    text-align: center !important;
  }
  .report-head .company,
  .report-head .title,
  .report-head .period {
    text-align: center !important;
  }
  .report-sheet :deep(.dx-datagrid-header-panel),
  .report-sheet :deep(.dx-datagrid-pager),
  .report-sheet :deep(.dx-datagrid-filter-row) { display: none !important; }

  .report-sheet :deep(.dx-datagrid-rowsview) { overflow: visible !important; }
  .report-sheet :deep(.dx-scrollable-container) { overflow: visible !important; }
  .report-sheet :deep(.dx-data-row) { break-inside: avoid; }
  .report-sheet :deep(.dx-group-row) { break-after: avoid; }
}
</style>
