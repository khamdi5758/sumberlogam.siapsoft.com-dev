<template>
  <div class="report-workspace">

    <!-- ══════════════ CHROME / TOOLBAR ══════════════ -->
    <div class="rb-chrome">
      <div class="rb-chrome__title">
        <i class="rb-ico">&#9776;</i>
        <span>{{ reportTitle }}</span>
      </div>

      <div class="rb-chrome__tools">
        <!-- Zoom -->
        <div class="rb-group">
          <button class="rb-btn" title="Perkecil (Ctrl -)" @click="zoomOut">&#8722;</button>
          <button class="rb-btn rb-btn--zoom" title="Kembalikan ke 100%" @click="zoomReset">
            {{ Math.round(zoom * 100) }}%
          </button>
          <button class="rb-btn" title="Perbesar (Ctrl +)" @click="zoomIn">&#43;</button>
        </div>

        <span class="rb-sep"></span>

        <!-- Struktur -->
        <div class="rb-group">
          <button class="rb-btn" title="Buka semua grup" @click="expandAll">Buka semua</button>
          <button class="rb-btn" title="Tutup semua grup" @click="collapseAll">Tutup semua</button>
          <button class="rb-btn" title="Pilih kolom yang tampil" @click="showColumnChooser">Kolom</button>
        </div>

        <span class="rb-sep"></span>

        <!-- Keluaran -->
        <div class="rb-group">
          <button class="rb-btn" title="Unduh sebagai Excel" @click="exportExcel">Excel</button>
          <button class="rb-btn" title="Unduh sebagai PDF" @click="exportPdf">PDF</button>
          <button class="rb-btn" title="Cetak lembar ini" @click="printSheet">Cetak</button>
        </div>

        <span class="rb-sep"></span>

        <button class="rb-btn rb-btn--ghost" title="Kembalikan susunan kolom & grup ke awal" @click="resetLayout">
          Atur ulang
        </button>

        <span class="rb-sep"></span>
        <slot name="extra-tools"></slot>
      </div>
    </div>

    <!-- ══════════════ LEMBAR KERTAS ══════════════ -->
    <div ref="sheetEl" class="report-sheet" :style="{ '--z': zoom }">

      <header class="report-head">
        <div class="company">{{ companyName }}</div>
        <h1 class="title">{{ reportTitle }}</h1>
        <div class="period">{{ periodLabel }}</div>
      </header>

      <DxDataGrid
        ref="gridRef"
        class="report-grid"
        :data-source="dataSource"
        :key-expr="keyExpr"
        :show-borders="false"
        :show-column-lines="false"
        :show-row-lines="true"
        :row-alternation-enabled="false"
        :hover-state-enabled="true"
        :allow-column-resizing="true"
        column-resizing-mode="widget"
        :allow-column-reordering="true"
        :column-min-width="60"
        :word-wrap-enabled="false"
        :remote-operations="false"
        @context-menu-preparing="onContextMenuPreparing"
        @cell-dbl-click="onCellDblClick"
        @content-ready="onContentReady"
      >
        <!-- Susunan kolom, lebar, dan grup tersimpan otomatis -->
        <DxStateStoring :enabled="true" type="localStorage" :storage-key="storageKey" />

        <DxLoadPanel :enabled="true" />
        <DxScrolling mode="standard" column-rendering-mode="standard" />
        <DxSorting mode="multiple" />
        <DxSelection mode="multiple" show-check-boxes-mode="none" />

        <!-- INI yang membuatnya dinamis: panel tarik-kolom-ke-sini -->
        <DxGroupPanel
          :visible="true"
          :allow-column-dragging="true"
          empty-panel-text="Tarik judul kolom ke sini untuk mengelompokkan"
        />
        <DxGrouping :auto-expand-all="true" :context-menu-enabled="true" expand-mode="rowClick" />

        <DxFilterRow :visible="true" />
        <DxHeaderFilter :visible="true" />
        <DxFilterPanel :visible="true" />
        <DxSearchPanel :visible="true" :width="220" placeholder="Cari di seluruh laporan" />
        <DxColumnChooser :enabled="true" mode="select" title="Kolom yang ditampilkan" />
        <DxColumnFixing :enabled="true" />
        <DxPaging :enabled="false" />

        <slot name="columns">
          <DxColumn data-field="NoBukti"  caption="No. bukti"    :group-index="0" />
          <DxColumn data-field="Tanggal"  caption="Tanggal"      data-type="date" format="dd/MM/yyyy" :width="95" />
          <DxColumn data-field="KodeSupp" caption="Kode supp"    :width="95" />
          <DxColumn data-field="NamaSupp" caption="Nama supplier" :min-width="190" />
          <DxColumn data-field="PPN"      caption="PPN"          :width="60" alignment="center" />
          <DxColumn data-field="KodeBrg"  caption="Kode barang"  :width="110" />
          <DxColumn data-field="NamaBrg"  caption="Nama barang"  :min-width="200" />
          <DxColumn data-field="Satuan"   caption="Satuan"       :width="70" alignment="center" />
          <DxColumn data-field="Qnt"      caption="Qty"          :width="90"  format="#,##0.###" />
          <DxColumn data-field="Harga"    caption="Harga"        :width="110" format="#,##0.00" />
          <DxColumn data-field="Diskon"   caption="Diskon"       :width="95"  format="#,##0.00" />
          <DxColumn data-field="Jumlah"   caption="Jumlah"       :width="130" format="#,##0.00" fixed-position="right" />
        </slot>

        <DxSummary>
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
          <DxTotalItem column="Jumlah"  summary-type="sum"   value-format="#,##0.00" display-format="{0}" />
          <DxTotalItem column="NamaBrg" summary-type="count" display-format="{0} baris" />
        </DxSummary>
      </DxDataGrid>

      <footer class="report-foot">
        <span>Dicetak: {{ printedAt }}</span>
        <span>Oleh: {{ userName }}</span>
      </footer>
    </div>

    <!-- Notifikasi salin -->
    <transition name="rb-fade">
      <div v-if="toast" class="rb-toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  DxDataGrid, DxColumn, DxGrouping, DxGroupPanel, DxScrolling, DxSorting,
  DxSummary, DxGroupItem, DxTotalItem, DxHeaderFilter, DxFilterRow,
  DxFilterPanel, DxSearchPanel, DxColumnChooser, DxColumnFixing,
  DxSelection, DxStateStoring, DxLoadPanel, DxPaging
} from 'devextreme-vue/data-grid'

const props = defineProps({
  dataSource:  { type: [Array, Object], default: () => [] },
  keyExpr:     { type: String, default: 'Id' },
  companyName: { type: String, default: 'PT SIAP INTEGRASI' },
  reportTitle: { type: String, default: 'Register purchase order' },
  periodLabel: { type: String, default: '' },
  userName:    { type: String, default: 'admin' },
  storageKey:  { type: String, default: 'report-register-po' },
  fileName:    { type: String, default: 'register-po' }
})

const gridRef = ref(null)
const sheetEl = ref(null)
const toast   = ref('')
const grid    = () => gridRef.value?.instance

const printedAt = computed(() =>
  new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())
)

/* ─────────────── ZOOM ─────────────── */
const ZOOM_KEY = `${props.storageKey}:zoom`
const zoom = ref(Number(localStorage.getItem(ZOOM_KEY)) || 1)

function applyZoom (v) {
  zoom.value = Math.min(1.6, Math.max(0.7, Math.round(v * 10) / 10))
  localStorage.setItem(ZOOM_KEY, String(zoom.value))
  requestAnimationFrame(() => grid()?.updateDimensions())
}
const zoomIn    = () => applyZoom(zoom.value + 0.1)
const zoomOut   = () => applyZoom(zoom.value - 0.1)
const zoomReset = () => applyZoom(1)

function onKeydown (e) {
  if (!(e.ctrlKey || e.metaKey)) return
  if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomIn() }
  if (e.key === '-')                  { e.preventDefault(); zoomOut() }
  if (e.key === '0')                  { e.preventDefault(); zoomReset() }
}
onMounted(()      => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

/* ─────────────── STRUKTUR ─────────────── */
const expandAll   = () => grid()?.expandAll()
const collapseAll = () => grid()?.collapseAll()
const showColumnChooser = () => grid()?.showColumnChooser()

function resetLayout () {
  grid()?.state(null)
  localStorage.removeItem(props.storageKey)
  applyZoom(1)
  notify('Susunan dikembalikan ke awal')
}

function onContentReady () { /* hook bila perlu */ }

/* ─────────────── CLIPBOARD ─────────────── */
function notify (msg) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 1600)
}

async function toClipboard (text, label) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  notify(label)
}

function cellText (e) {
  return e.text ?? (e.value != null ? String(e.value) : '')
}

function onCellDblClick (e) {
  if (e.rowType !== 'data') return
  toClipboard(cellText(e), 'Sel disalin')
}

function rowText (rowData, columns) {
  return columns
    .filter(c => c.dataField && c.visible !== false)
    .map(c => {
      const v = rowData[c.dataField]
      return v == null ? '' : String(v)
    })
    .join('\t')
}

function onContextMenuPreparing (e) {
  const g = grid()
  if (!g) return
  const cols = g.getVisibleColumns()

  if (e.target === 'content' && e.row?.rowType === 'data') {
    const cellValue = e.column?.dataField ? e.row.data[e.column.dataField] : ''
    e.items = [
      {
        text: 'Salin sel',
        onItemClick: () => toClipboard(cellValue == null ? '' : String(cellValue), 'Sel disalin')
      },
      {
        text: 'Salin baris',
        onItemClick: () => toClipboard(rowText(e.row.data, cols), 'Baris disalin')
      },
      {
        text: 'Salin baris terpilih',
        onItemClick: async () => {
          const rows = await g.getSelectedRowsData()
          const src = rows.length ? rows : [e.row.data]
          const header = cols.filter(c => c.dataField).map(c => c.caption).join('\t')
          const body = src.map(r => rowText(r, cols)).join('\n')
          toClipboard(`${header}\n${body}`, `${src.length} baris disalin`)
        }
      },
      {
        text: 'Salin seluruh kolom',
        onItemClick: () => {
          const field = e.column?.dataField
          if (!field) return
          const all = g.getDataSource().items()
          const flat = []
          const walk = arr => arr.forEach(it => it.items ? walk(it.items) : flat.push(it))
          walk(all)
          toClipboard(flat.map(r => r[field] ?? '').join('\n'), 'Kolom disalin')
        }
      },
      { text: 'Kelompokkan berdasarkan kolom ini',
        visible: !!e.column?.dataField,
        onItemClick: () => g.columnOption(e.column.dataField, 'groupIndex', 0) },
      { text: 'Hapus semua pengelompokan',
        onItemClick: () => g.clearGrouping() }
    ]
  }
}

/* ─────────────── EXPORT ─────────────── */
async function exportExcel () {
  const [{ Workbook }, { exportDataGrid }, { saveAs }] = await Promise.all([
    import('exceljs'),
    import('devextreme/excel_exporter'),
    import('file-saver-es')
  ])
  const wb = new Workbook()
  const ws = wb.addWorksheet(props.reportTitle.slice(0, 31))

  ws.mergeCells('A1:D1')
  ws.getCell('A1').value = props.companyName
  ws.getCell('A1').font = { bold: true, size: 12 }
  ws.mergeCells('A2:D2')
  ws.getCell('A2').value = `${props.reportTitle} — ${props.periodLabel}`

  await exportDataGrid({
    component: grid(),
    worksheet: ws,
    topLeftCell: { row: 4, column: 1 },
    autoFilterEnabled: true,
    customizeCell: ({ gridCell, excelCell }) => {
      if (gridCell.rowType === 'header') {
        excelCell.font = { bold: true }
        excelCell.border = { bottom: { style: 'thin' } }
      }
      if (gridCell.rowType === 'group' || gridCell.rowType === 'groupFooter') {
        excelCell.font = { bold: true }
      }
      if (gridCell.rowType === 'totalFooter') {
        excelCell.font = { bold: true }
        excelCell.border = { top: { style: 'thin' }, bottom: { style: 'double' } }
      }
    }
  })

  const buf = await wb.xlsx.writeBuffer()
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `${props.fileName}.xlsx`)
  notify('Excel diunduh')
}

async function exportPdf () {
  const [{ jsPDF }, { exportDataGrid }] = await Promise.all([
    import('jspdf'),
    import('devextreme/pdf_exporter')
  ])
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })

  doc.setFontSize(11); doc.text(props.companyName, 40, 34)
  doc.setFontSize(14); doc.text(props.reportTitle, 40, 52)
  doc.setFontSize(9);  doc.text(props.periodLabel, 40, 66)

  await exportDataGrid({
    jsPDFDocument: doc,
    component: grid(),
    topLeft: { x: 40, y: 76 },
    columnWidths: undefined,
    customDrawCell: ({ gridCell, pdfCell }) => {
      if (gridCell.rowType === 'header') {
        pdfCell.font = { style: 'bold' }
        pdfCell.backgroundColor = '#ffffff'
      }
      if (gridCell.rowType === 'group' || gridCell.rowType === 'totalFooter') {
        pdfCell.font = { style: 'bold' }
        pdfCell.backgroundColor = '#ffffff'
      }
    }
  })
  doc.save(`${props.fileName}.pdf`)
  notify('PDF diunduh')
}

function printSheet () {
  grid()?.updateDimensions()
  setTimeout(() => window.print(), 120)
}

defineExpose({ exportExcel, exportPdf, printSheet, resetLayout, grid })
</script>

<style scoped>
/* ============================================================
   TOKEN
   ============================================================ */
.report-workspace {
  --ink:        #16181d;
  --ink-soft:   #5b6068;
  --rule-heavy: #16181d;
  --rule-mid:   #b8bcc2;
  --rule-hair:  #e8e9ec;
  --paper:      #ffffff;
  --paper-edge: #e3e4e8;
  --tint:       #f7f8f9;
  --chrome:     #fbfbfc;

  --font-body: "Inter", ui-sans-serif, "Segoe UI", Roboto, Arial, sans-serif;
  font-family: var(--font-body);
  color: var(--ink);
}

/* ============================================================
   CHROME
   ============================================================ */
.rb-chrome {
  position: sticky; top: 0; z-index: 5;
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
  max-width: 1240px; margin: 0 auto;
  padding: 9px 14px;
  background: var(--chrome);
  border: 1px solid var(--paper-edge);
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}
.rb-chrome__title {
  display: flex; align-items: center; gap: 8px;
  font-size: 12.5px; font-weight: 600; letter-spacing: -.005em;
}
.rb-ico { color: var(--ink-soft); font-style: normal; }
.rb-chrome__tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rb-group { display: flex; align-items: center; gap: 2px; }
.rb-sep { width: 1px; height: 18px; background: var(--paper-edge); }

.rb-btn {
  height: 27px; min-width: 27px;
  padding: 0 9px;
  font: inherit; font-size: 11.5px;
  color: var(--ink-soft);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: background .12s, color .12s, border-color .12s;
}
.rb-btn:hover  { background: #fff; border-color: var(--paper-edge); color: var(--ink); }
.rb-btn:active { transform: scale(.97); }
.rb-btn:focus-visible { outline: 2px solid var(--ink); outline-offset: 1px; }
.rb-btn--zoom  { min-width: 46px; font-variant-numeric: tabular-nums; }
.rb-btn--ghost { color: #9aa0a8; }

/* ============================================================
   LEMBAR KERTAS  (semua ukuran ikut --z)
   ============================================================ */
.report-sheet {
  --z: 1;
  background: var(--paper);
  max-width: 1240px;
  margin: 0 auto 24px;
  padding: calc(30px * var(--z)) calc(34px * var(--z)) calc(18px * var(--z));
  border: 1px solid var(--paper-edge);
  border-radius: 0 0 4px 4px;
  box-shadow: 0 1px 1px rgba(16,18,24,.04), 0 10px 28px rgba(16,18,24,.07);
}

.report-head { text-align: center; padding-bottom: calc(12px * var(--z)); }
.report-head .company {
  font-size: calc(11.5px * var(--z));
  font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
}
.report-head .title {
  font-size: calc(19px * var(--z));
  font-weight: 600; letter-spacing: -.01em; margin: calc(4px * var(--z)) 0 calc(2px * var(--z));
}
.report-head .period { font-size: calc(11.5px * var(--z)); color: var(--ink-soft); }
.report-head::after {
  content: ""; display: block;
  margin-top: calc(13px * var(--z));
  border-bottom: 2px solid var(--rule-heavy);
}

.report-foot {
  display: flex; justify-content: space-between;
  margin-top: calc(14px * var(--z)); padding-top: calc(8px * var(--z));
  border-top: 1px solid var(--rule-hair);
  font-size: calc(10.5px * var(--z)); color: var(--ink-soft);
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
  font-size: calc(12.5px * var(--z));
}
.report-sheet :deep(.dx-datagrid-borders > *) { border: none !important; }

/* ---- Panel grup: strip putus-putus, bukan bidang abu ---- */
.report-sheet :deep(.dx-datagrid-header-panel) {
  border-bottom: none;
  padding: 0 0 calc(8px * var(--z));
}
.report-sheet :deep(.dx-datagrid-group-panel) {
  min-height: calc(30px * var(--z));
  padding: calc(5px * var(--z)) calc(9px * var(--z));
  border: 1px dashed var(--rule-mid);
  border-radius: 3px;
  background: var(--paper);
}
.report-sheet :deep(.dx-group-panel-message) {
  color: #9aa0a8;
  font-size: calc(11px * var(--z));
  font-style: normal;
  padding: 0;
}
.report-sheet :deep(.dx-datagrid-group-panel .dx-group-panel-item) {
  background: var(--tint) !important;
  border: 1px solid var(--paper-edge) !important;
  border-radius: 3px;
  color: var(--ink) !important;
  font-size: calc(11px * var(--z));
  font-weight: 600;
  padding: calc(3px * var(--z)) calc(9px * var(--z));
  box-shadow: none;
}
.report-sheet :deep(.dx-datagrid-drop-highlight > td) { background: var(--tint) !important; }

/* ---- Header kolom ---- */
.report-sheet :deep(.dx-datagrid-headers) {
  border-bottom: 1px solid var(--rule-heavy) !important;
}
.report-sheet :deep(.dx-header-row > td) {
  background: var(--paper) !important;
  padding: calc(4px * var(--z)) calc(9px * var(--z)) calc(8px * var(--z)) !important;
  font-size: calc(10.5px * var(--z)) !important;
  font-weight: 700;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--ink);
  vertical-align: bottom;
  border: none !important;
}
.report-sheet :deep(.dx-datagrid-headers .dx-datagrid-table .dx-row > td) { border-bottom: none !important; }

/* Pegangan resize kolom */
.report-sheet :deep(.dx-datagrid-columns-separator) { background: var(--rule-heavy); width: 2px; }
.report-sheet :deep(.dx-datagrid-columns-separator-transparent) { background: transparent; }

/* ---- Filter row ---- */
.report-sheet :deep(.dx-datagrid-filter-row) { background: var(--paper) !important; }
.report-sheet :deep(.dx-datagrid-filter-row > td) {
  background: var(--paper) !important;
  border-bottom: 1px solid var(--rule-hair) !important;
  padding: calc(3px * var(--z)) calc(5px * var(--z)) !important;
}
.report-sheet :deep(.dx-datagrid-filter-row .dx-editor-cell .dx-texteditor) {
  background: var(--paper);
  border: 1px solid transparent;
  border-radius: 3px;
}
.report-sheet :deep(.dx-datagrid-filter-row .dx-editor-cell .dx-texteditor.dx-state-hover),
.report-sheet :deep(.dx-datagrid-filter-row .dx-editor-cell .dx-texteditor.dx-state-focused) {
  border-color: var(--paper-edge);
  box-shadow: none;
}

/* ---- Baris data ---- */
.report-sheet :deep(.dx-datagrid-rowsview .dx-data-row > td) {
  background: var(--paper) !important;
  border-bottom: 1px solid var(--rule-hair) !important;
  border-top: none !important;
  padding: calc(6px * var(--z)) calc(9px * var(--z)) !important;
  line-height: 1.35;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}
.report-sheet :deep(.dx-datagrid .dx-row-alt > td) { background: var(--paper) !important; }

/* ---- Baris grup ---- */
.report-sheet :deep(.dx-datagrid-rowsview .dx-group-row) { background: var(--paper) !important; }
.report-sheet :deep(.dx-datagrid-rowsview .dx-group-row > td) {
  background: var(--paper) !important;
  color: var(--ink) !important;
  font-weight: 700;
  font-size: calc(12.5px * var(--z));
  padding: calc(16px * var(--z)) calc(9px * var(--z)) calc(5px * var(--z)) !important;
  border-top: none !important;
  border-bottom: 1px solid var(--rule-mid) !important;
  cursor: pointer;
}
.report-sheet :deep(.dx-datagrid-group-closed),
.report-sheet :deep(.dx-datagrid-group-opened) { color: var(--ink-soft); }

/* ---- Subtotal grup ---- */
.report-sheet :deep(.dx-datagrid-rowsview .dx-datagrid-group-footer > td) {
  background: var(--paper) !important;
  border-top: 1px solid var(--rule-mid) !important;
  border-bottom: none !important;
  padding: calc(6px * var(--z)) calc(9px * var(--z)) calc(15px * var(--z)) !important;
  font-weight: 600;
}

/* ---- Grand total ---- */
.report-sheet :deep(.dx-datagrid-total-footer) {
  border-top: 1px solid var(--rule-heavy) !important;
  border-bottom: 3px double var(--rule-heavy) !important;
}
.report-sheet :deep(.dx-datagrid-total-footer td) {
  background: var(--paper) !important;
  padding: calc(8px * var(--z)) calc(9px * var(--z)) !important;
  border: none !important;
}
.report-sheet :deep(.dx-datagrid-summary-item) { color: var(--ink) !important; font-weight: 700; }

/* ---- Matikan seluruh biru bawaan tema ---- */
.report-sheet :deep(.dx-datagrid-rowsview .dx-row.dx-state-hover:not(.dx-header-row) > td),
.report-sheet :deep(.dx-datagrid-rowsview .dx-selection > td),
.report-sheet :deep(.dx-datagrid-rowsview .dx-selection.dx-row > td),
.report-sheet :deep(.dx-row-focused.dx-data-row > td),
.report-sheet :deep(.dx-row-focused.dx-group-row > td) {
  background: var(--tint) !important;
  color: var(--ink) !important;
}
.report-sheet :deep(.dx-datagrid-focus-overlay) {
  border: 1px solid var(--rule-mid);
  border-radius: 2px;
}
.report-sheet :deep(.dx-datagrid-focus-overlay::after) { display: none; }

/* ---- Filter panel & search ---- */
.report-sheet :deep(.dx-datagrid-filter-panel) {
  border-top: 1px solid var(--rule-hair);
  padding-top: calc(6px * var(--z));
  color: var(--ink-soft);
  font-size: calc(11px * var(--z));
}
.report-sheet :deep(.dx-datagrid-search-panel) {
  margin-left: calc(9px * var(--z));
  background: var(--paper);
  border: 1px solid var(--paper-edge);
  border-radius: 3px;
}

/* ---- Scrollbar ---- */
.report-sheet :deep(.dx-scrollable-scroll-content) { background: rgba(22,24,29,.22); }

/* ============================================================
   TOAST
   ============================================================ */
.rb-toast {
  position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%);
  background: var(--ink); color: #fff;
  font-size: 12px; padding: 8px 16px; border-radius: 5px;
  box-shadow: 0 6px 20px rgba(16,18,24,.22);
  z-index: 9999;
}
.rb-fade-enter-active, .rb-fade-leave-active { transition: opacity .18s, transform .18s; }
.rb-fade-enter-from, .rb-fade-leave-to { opacity: 0; transform: translate(-50%, 6px); }

/* ============================================================
   CETAK
   ============================================================ */
@media print {
  .rb-chrome, .rb-toast { display: none !important; }
  .report-sheet {
    --z: 1;
    max-width: none; margin: 0; padding: 0;
    border: none; box-shadow: none;
  }
  .report-sheet :deep(.dx-datagrid-header-panel),
  .report-sheet :deep(.dx-datagrid-filter-row),
  .report-sheet :deep(.dx-datagrid-filter-panel),
  .report-sheet :deep(.dx-datagrid-pager) { display: none !important; }
  .report-sheet :deep(.dx-datagrid-rowsview),
  .report-sheet :deep(.dx-scrollable-container) { overflow: visible !important; }
  .report-sheet :deep(.dx-data-row)  { break-inside: avoid; }
  .report-sheet :deep(.dx-group-row) { break-after: avoid; }
}
@page { size: A4 landscape; margin: 12mm; }
</style>
