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
          <button class="rb-btn" title="Perkecil (Ctrl -)" @click="zoomOut">
            <Minus :size="15" :stroke-width="2" />
          </button>
          <button class="rb-btn rb-btn--zoom" title="Kembalikan ke 100%" @click="zoomReset">
            {{ Math.round(zoom * 100) }}%
          </button>
          <button class="rb-btn" title="Perbesar (Ctrl +)" @click="zoomIn">
            <Plus :size="15" :stroke-width="2" />
          </button>
        </div>

        <span class="rb-sep"></span>

        <!-- Mode Tampilan -->
        <div class="rb-group">
          <select class="rb-select" v-model="filterSettings.viewMode" title="Mode Tampilan" @change="applyFilterOptionsToGrid">
            <option value="paper">Halaman Kertas</option>
            <option value="all">Semua Data</option>
          </select>
        </div>

        <!-- Paginasi (Hanya jika mode Halaman Kertas) -->
        <div class="rb-group" v-if="filterSettings.viewMode === 'paper'">
          <button class="rb-btn" title="Halaman pertama" :disabled="pageIndex === 0" @click="setPageIndex(0)">
            <ChevronsLeft :size="15" :stroke-width="2" />
          </button>
          <button class="rb-btn" title="Halaman sebelumnya" :disabled="pageIndex === 0" @click="setPageIndex(pageIndex - 1)">
            <ChevronLeft :size="15" :stroke-width="2" />
          </button>

          <input
            type="text"
            class="rb-pager-input"
            :value="pageIndex + 1"
            @change="onPageInputChange"
            @keydown.enter="onPageInputChange"
            title="Masukkan halaman"
          />
          <span class="rb-pager-total">/ {{ totalPages }}</span>

          <button class="rb-btn" title="Halaman berikutnya" :disabled="pageIndex >= totalPages - 1" @click="setPageIndex(pageIndex + 1)">
            <ChevronRight :size="15" :stroke-width="2" />
          </button>
          <button class="rb-btn" title="Halaman terakhir" :disabled="pageIndex >= totalPages - 1" @click="setPageIndex(totalPages - 1)">
            <ChevronsRight :size="15" :stroke-width="2" />
          </button>
        </div>

        <span class="rb-sep"></span>

        <!-- Struktur -->
        <div class="rb-group">
          <button class="rb-btn" title="Buka semua grup" @click="expandAll">
            <ChevronsDown :size="15" :stroke-width="2" />
          </button>
          <button class="rb-btn" title="Tutup semua grup" @click="collapseAll">
            <ChevronsUp :size="15" :stroke-width="2" />
          </button>
          <button class="rb-btn" title="Pilih kolom yang tampil" @click="showColumnChooser">
            <Columns3 :size="15" :stroke-width="2" />
          </button>
          <button class="rb-btn" title="Pengaturan filter" @click="showFilterPopup">
            <Filter :size="15" :stroke-width="2" />
          </button>
        </div>

        <span class="rb-sep"></span>

        <!-- Keluaran -->
        <div class="rb-group">
          <button class="rb-btn" title="Unduh sebagai Excel" @click="exportExcel">
            <FileSpreadsheet :size="15" :stroke-width="2" />
          </button>
          <button class="rb-btn" title="Unduh sebagai PDF" @click="exportPdf">
            <FileText :size="15" :stroke-width="2" />
          </button>
          <button class="rb-btn" title="Cetak lembar ini" @click="printSheet">
            <Printer :size="15" :stroke-width="2" />
          </button>
        </div>

        <span class="rb-sep"></span>

        <button class="rb-btn rb-btn--ghost" title="Kembalikan susunan kolom & grup ke awal" @click="resetLayout">
          <RotateCcw :size="15" :stroke-width="2" />
        </button>

        <span class="rb-sep"></span>
        <slot name="extra-tools"></slot>
      </div>
    </div>

    <!-- ══════════════ LEMBAR KERTAS ══════════════ -->
    <div ref="sheetEl" class="report-sheet" :style="{ '--z': zoom }">

      <div class="report-head">
        <img
          v-if="companyLogo && !logoLoadFailed"
          class="report-logo"
          :src="companyLogo"
          :alt="`Logo ${companyName}`"
          @error="logoLoadFailed = true"
        />
        <div v-else class="report-logo report-logo--fallback" aria-hidden="true">KMJ</div>
        <div class="report-head__content">
          <div class="company">{{ companyName }}</div>
          <div v-if="companyAddress" class="company-address">
            {{ companyAddress }}<span v-if="companyPhone"> &bull; Telp: {{ companyPhone }}</span>
          </div>
          <h1 class="title">{{ reportTitle }}</h1>
          <div class="period">{{ periodLabel }}</div>
        </div>
      </div>

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
        :column-auto-width="true"
        :column-min-width="60"
        :word-wrap-enabled="false"
        :remote-operations="false"
        @context-menu-preparing="onContextMenuPreparing"
        @cell-dbl-click="onCellDblClick"
        @row-click="onRowClick"
        @content-ready="onContentReady"
      >
        <!-- Susunan kolom, lebar, dan grup tersimpan otomatis -->
        <DxStateStoring :enabled="true" type="localStorage" :storage-key="storageKey" />

        <DxLoadPanel :enabled="true" />
        <DxScrolling mode="standard" column-rendering-mode="standard" :use-native="true" />
        <DxSorting mode="multiple" />
        <DxSelection mode="multiple" show-check-boxes-mode="none" />

        <!-- INI yang membuatnya dinamis: panel tarik-kolom-ke-sini -->
        <DxGroupPanel
          :visible="true"
          :allow-column-dragging="true"
          empty-panel-text="Tarik judul kolom ke sini untuk mengelompokkan"
        />
        <DxGrouping :auto-expand-all="true" :context-menu-enabled="true" expand-mode="rowClick" />

        <DxFilterRow :visible="filterSettings.showFilterRow" />
        <DxHeaderFilter :visible="filterSettings.showHeaderFilter" />
        <DxFilterPanel :visible="filterSettings.showFilterPanel" />
        <DxSearchPanel :visible="filterSettings.showSearchPanel" :width="220" placeholder="Cari di seluruh laporan" />
        <DxColumnChooser :enabled="false" mode="select" title="Kolom yang ditampilkan" />
        <DxColumnFixing :enabled="true" />
        <DxPaging :enabled="filterSettings.viewMode === 'paper'" :page-size="filterSettings.pageSize" />
        <DxPager :visible="false" />

        <slot name="columns">
          <DxColumn
            v-for="col in dynamicColumns"
            :key="col.dataField"
            :data-field="col.dataField"
            :caption="col.caption"
            :alignment="col.alignment"
            :data-type="col.dataType"
            :format="col.format"
            :width="col.width"
            :min-width="col.minWidth"
            :group-index="col.groupIndex"
            :fixed="col.fixed"
            :fixed-position="col.fixedPosition"
          />
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

    <!-- Popup pengaturan filter -->
    <DxPopup
      :visible="filterPopupVisible"
      :show-title="true"
      title="Pengaturan Filter"
      :width="260"
      :height="undefined"
      :shading="false"
      :on-hidden="hideFilterPopup"
    >
      <template #contentTemplate>
        <div class="rb-filter-popup">
          <div class="rb-filter-popup__row">
            <span>Baris filter</span>
            <DxCheckBox
              :value="filterSettings.showFilterRow"
              @valueChanged="(e) => setFilterOption('showFilterRow', e.value)"
            />
          </div>
          <div class="rb-filter-popup__row">
            <span>Filter header kolom</span>
            <DxCheckBox
              :value="filterSettings.showHeaderFilter"
              @valueChanged="(e) => setFilterOption('showHeaderFilter', e.value)"
            />
          </div>
          <div class="rb-filter-popup__row">
            <span>Panel filter</span>
            <DxCheckBox
              :value="filterSettings.showFilterPanel"
              @valueChanged="(e) => setFilterOption('showFilterPanel', e.value)"
            />
          </div>
          <div class="rb-filter-popup__row">
            <span>Panel pencarian</span>
            <DxCheckBox
              :value="filterSettings.showSearchPanel"
              @valueChanged="(e) => setFilterOption('showSearchPanel', e.value)"
            />
          </div>
        </div>
      </template>
    </DxPopup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  DxDataGrid, DxColumn, DxGrouping, DxGroupPanel, DxScrolling, DxSorting,
  DxSummary, DxGroupItem, DxTotalItem, DxHeaderFilter, DxFilterRow,
  DxFilterPanel, DxSearchPanel, DxColumnChooser, DxColumnFixing,
  DxSelection, DxStateStoring, DxLoadPanel, DxPaging, DxPager
} from 'devextreme-vue/data-grid'
import DxPopup from 'devextreme-vue/popup'
import DxCheckBox from 'devextreme-vue/check-box'
import {
  Minus, Plus, ChevronsDown, ChevronsUp, Columns3, Filter,
  FileSpreadsheet, FileText, Printer, RotateCcw,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-vue-next'

function getStoredCompany () {
  try {
    const stored = JSON.parse(localStorage.getItem('perusahaan') || 'null')
    return Array.isArray(stored) ? (stored[0] || {}) : (stored || {})
  } catch {
    return {}
  }
}

const props = defineProps({
  dataSource:  { type: [Array, Object], default: () => [] },
  keyExpr:     { type: String, default: 'Id' },
  companyName: { type: String, default: 'PT SIAP INTEGRASI' },
  companyAddress: { type: String, default: '' },
  companyPhone: { type: String, default: '' },
  reportTitle: { type: String, default: 'Register purchase order' },
  periodLabel: { type: String, default: '' },
  userName:    { type: String, default: 'admin' },
  storageKey:  { type: String, default: 'report-register-po' },
  fileName:    { type: String, default: 'register-po' },
  logoSrc:     { type: String, default: '' },
  // Nama-nama dataField kolom yang selnya digabung tampilannya (merge)
  // kalau nilainya sama dengan baris tepat di atasnya. Contoh: ['NamaSupp', 'Tanggal']
  // Catatan: hanya berlaku untuk baris yang bersebelahan, jadi data harus
  // sudah tersusun/terurut berdasarkan kolom tersebut supaya nilai yang
  // sama saling berdekatan (kolom yang dipakai untuk grouping otomatis
  // sudah terurut dengan sendirinya).
  mergeColumns: { type: Array, default: () => [] }
})

const storedCompany = getStoredCompany()
const companyName = computed(() => storedCompany.namaperusahaan || props.companyName)
const companyAddress = computed(() =>
  [storedCompany.alamat1, storedCompany.alamat2].filter(Boolean).join(' ') || props.companyAddress
)
const companyPhone = computed(() => storedCompany.telpon || props.companyPhone)
const companyLogo = computed(() =>
  storedCompany.logo || storedCompany.logoUrl || storedCompany.logoPerusahaan || props.logoSrc
)
const logoLoadFailed = ref(false)

const dynamicColumns = computed(() => {
  const data = Array.isArray(props.dataSource) ? props.dataSource : []
  if (data.length === 0) return []

  const allKeysSet = new Set()
  const normalizedKeysSet = new Set()
  data.forEach(item => {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach(key => {
        const normalizedKey = key.toLowerCase().replace(/[\s_]/g, '')
        if (!['id', 'keyindex', 'pagetotal', 'uuid', 'rowversion'].includes(normalizedKey)) {
          if (!normalizedKeysSet.has(normalizedKey)) {
            normalizedKeysSet.add(normalizedKey)
            allKeysSet.add(key)
          }
        }
      })
    }
  })

  const allKeys = Array.from(allKeysSet)

  return allKeys.map(key => {
    const lower = key.toLowerCase()

    // Determine alignment
    let alignment = 'left'
    if (
      lower.startsWith('qnt') ||
      lower.startsWith('harga') ||
      lower.startsWith('diskon') ||
      lower.startsWith('jumlah') ||
      lower.startsWith('dpp') ||
      lower.startsWith('ppn') ||
      lower.startsWith('total') ||
      lower.startsWith('sum') ||
      lower.startsWith('avg') ||
      lower.startsWith('dec')
    ) {
      alignment = 'right'
    } else if (
      lower.includes('tanggal') ||
      lower.includes('tgl') ||
      lower.includes('date') ||
      lower.includes('ppn')
    ) {
      alignment = 'center'
    }

    // Parse caption
    let caption = key

    // Determine dataType and format
    let dataType = 'string'
    let format = undefined

    if (
      lower.includes('tanggal') ||
      lower.includes('tgl') ||
      lower.includes('date')
    ) {
      dataType = 'date'
      format = 'dd/MM/yyyy'
    } else if (
      lower.startsWith('qnt') ||
      lower.startsWith('harga') ||
      lower.startsWith('diskon') ||
      lower.startsWith('jumlah') ||
      lower.startsWith('dpp') ||
      lower.startsWith('total') ||
      lower.startsWith('sum') ||
      lower.startsWith('avg') ||
      lower.startsWith('dec')
    ) {
      dataType = 'number'
      if (lower.startsWith('qnt') || lower.includes('qty')) {
        format = '#,##0.###'
      } else {
        format = '#,##0.00'
      }
    }

    // Let DevExtreme size columns from their content.
    let minWidth = undefined

    if (lower === 'namasupp') {
      minWidth = 190
    } else if (lower === 'namabrg') {
      minWidth = 200
    }

    // Grouping
    let groupIndex = undefined
    if (lower === 'nobukti') {
      groupIndex = 0
    }

    // Fixed column
    let fixed = undefined
    let fixedPosition = undefined
    if (lower === 'jumlah') {
      fixed = true
      fixedPosition = 'right'
    }

    return {
      dataField: key,
      caption,
      alignment,
      dataType,
      format,
      minWidth,
      groupIndex,
      fixed,
      fixedPosition
    }
  })
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

/* ─────────────── DRAG-TO-SCROLL (untuk pengguna mouse) ───────────────
   Trackpad bisa langsung swipe kiri/kanan, tapi mouse biasa tidak.
   Solusi ini menambahkan "klik-tahan-geser" pada area grid: user
   klik-tahan tombol kiri mouse lalu menggeser ke kiri/kanan untuk
   men-scroll horizontal, mirip gesture drag di peta.
------------------------------------------------------------------- */
let dragCleanup = null

function enableDragScroll () {
  // Bersihkan listener lama kalau grid sempat re-render
  if (dragCleanup) dragCleanup()

  const container = sheetEl.value?.querySelector(
    '.dx-datagrid-rowsview .dx-scrollable-container'
  )
  if (!container) return

  const DRAG_THRESHOLD = 6 // px — di bawah ini dianggap klik biasa, bukan drag

  let isDown = false
  let dragging = false   // baru true setelah melewati threshold
  let startX = 0
  let scrollLeftStart = 0
  let justDragged = false // dipakai onClickCapture, direset setelah 1 click

  function onMouseDown (e) {
    // Jangan aktifkan drag-scroll kalau user sedang klik di editor filter,
    // checkbox, atau tombol lain di dalam grid
    if (e.target.closest('.dx-texteditor, input, textarea, .dx-checkbox, .dx-selectbox, button')) return
    // Hanya klik kiri
    if (e.button !== 0) return

    isDown = true
    dragging = false
    startX = e.pageX - container.offsetLeft
    scrollLeftStart = container.scrollLeft
  }

  function endDrag () {
    isDown = false
    if (dragging) {
      justDragged = true
      container.classList.remove('rb-dragging')
    }
    dragging = false
  }

  function onMouseUp () { endDrag() }
  function onMouseLeave () { endDrag() }

  function onMouseMove (e) {
    if (!isDown) return
    const x = e.pageX - container.offsetLeft
    const walk = x - startX

    if (!dragging) {
      // Belum lewat threshold → biarkan sebagai klik biasa (row selection tetap jalan)
      if (Math.abs(walk) < DRAG_THRESHOLD) return
      dragging = true
      container.classList.add('rb-dragging')
    }

    e.preventDefault()
    container.scrollLeft = scrollLeftStart - walk
  }

  // Cegah klik "nyangkut" jadi select sel HANYA kalau barusan benar-benar drag
  function onClickCapture (e) {
    if (justDragged) {
      e.stopPropagation()
      e.preventDefault()
      justDragged = false
    }
  }

  container.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mouseup', onMouseUp)
  container.addEventListener('mouseleave', onMouseLeave)
  container.addEventListener('mousemove', onMouseMove)
  container.addEventListener('click', onClickCapture, true)

  dragCleanup = () => {
    container.removeEventListener('mousedown', onMouseDown)
    window.removeEventListener('mouseup', onMouseUp)
    container.removeEventListener('mouseleave', onMouseLeave)
    container.removeEventListener('mousemove', onMouseMove)
    container.removeEventListener('click', onClickCapture, true)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  // Tunggu DxDataGrid selesai render pertama kali sebelum memasang drag-scroll
  setTimeout(enableDragScroll, 300)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (dragCleanup) dragCleanup()
})

/* ─────────────── STRUKTUR ─────────────── */
const expandAll   = () => grid()?.expandAll()
const collapseAll = () => grid()?.collapseAll()
const showColumnChooser = () => grid()?.showColumnChooser()

/* ─────────────── FILTER (Baris filter, header, panel, pencarian) ─────────────── */
const savedFilters = localStorage.getItem(`${props.storageKey}:filters`)
const defaultFilters = {
  showFilterRow: false,
  showHeaderFilter: false,
  showFilterPanel: true,
  showSearchPanel: false,
  viewMode: 'paper',
  pageSize: 20
}
const filterSettings = ref(savedFilters ? { ...defaultFilters, ...JSON.parse(savedFilters) } : defaultFilters)
const filterPopupVisible = ref(false)

const showFilterPopup = () => { filterPopupVisible.value = true }
const hideFilterPopup = () => { filterPopupVisible.value = false }

const pageIndex = ref(0)
const totalPages = ref(1)

function updatePagerInfo () {
  const g = grid()
  if (!g) return
  pageIndex.value = g.pageIndex()
  totalPages.value = g.pageCount() || 1
}

function setPageIndex (idx) {
  const g = grid()
  if (!g) return
  const targetIdx = Math.max(0, Math.min(idx, totalPages.value - 1))
  g.pageIndex(targetIdx)
  pageIndex.value = targetIdx
}

function onPageInputChange (e) {
  const val = parseInt(e.target.value, 10)
  if (!isNaN(val)) {
    const targetIdx = Math.max(0, Math.min(val - 1, totalPages.value - 1))
    setPageIndex(targetIdx)
    e.target.value = targetIdx + 1
  } else {
    e.target.value = pageIndex.value + 1
  }
}

function applyFilterOptionsToGrid () {
  const g = grid()
  if (!g) return

  const optionsToSet = {
    'filterRow.visible': filterSettings.value.showFilterRow,
    'headerFilter.visible': filterSettings.value.showHeaderFilter,
    'filterPanel.visible': filterSettings.value.showFilterPanel,
    'searchPanel.visible': filterSettings.value.showSearchPanel,
    'paging.enabled': filterSettings.value.viewMode === 'paper',
    'paging.pageSize': filterSettings.value.pageSize
  }

  let changed = false
  for (const [key, val] of Object.entries(optionsToSet)) {
    if (g.option(key) !== val) {
      g.option(key, val)
      changed = true
    }
  }

  localStorage.setItem(`${props.storageKey}:filters`, JSON.stringify(filterSettings.value))

  if (changed) {
    setTimeout(() => {
      try {
        g.updateDimensions()
        updatePagerInfo()
      } catch (e) {}
    }, 50)
  } else {
    updatePagerInfo()
  }
}

function setFilterOption (key, val) {
  if (filterSettings.value[key] !== val) {
    filterSettings.value[key] = val
    applyFilterOptionsToGrid()
  }
}

function resetLayout () {
  grid()?.state(null)
  localStorage.removeItem(props.storageKey)
  localStorage.removeItem(`${props.storageKey}:filters`)
  filterSettings.value = {
    showFilterRow: false,
    showHeaderFilter: false,
    showFilterPanel: true,
    showSearchPanel: false,
    viewMode: 'paper',
    pageSize: 20
  }
  activeRowKey.value = null
  applyFilterOptionsToGrid()
  applyZoom(1)
  notify('Susunan dikembalikan ke awal')
}

function onContentReady () {
  applyFilterOptionsToGrid()
  updatePagerInfo()
  // Grid bisa di-rebuild saat kolom/grup berubah — pasang ulang drag-scroll
  enableDragScroll()
  // Hitung ulang sel yang perlu digabung (merge) berdasarkan tampilan final
  applyColumnMerge()
}

/* ─────────────── MERGE KOLOM ───────────────
   DevExtreme DataGrid tidak punya rowSpan bawaan untuk sel data.
   Triknya: kalau nilai kolom ini sama dengan baris data tepat di
   atasnya, sembunyikan teksnya secara visual dan hapus border di
   antara keduanya — secara visual jadi terlihat seperti satu sel
   gabungan.
   Aktifkan lewat prop :merge-columns="['NamaSupp', 'Tanggal']".
   Data harus sudah terurut berdasarkan kolom tsb supaya nilai yang
   sama saling berdekatan (kolom yang dipakai groupIndex otomatis
   sudah terurut dengan sendirinya).

   CATATAN PERBAIKAN:
   Sebelumnya logic ini jalan di event `cellPrepared` per-sel, dengan
   mengambil "baris sebelumnya" dari `getVisibleRows()`. Pendekatan itu
   rapuh karena:
   1. `cellPrepared` bisa terpanggil ulang berkali-kali (mis. saat
      DxStateStoring atau opsi grid berubah lewat applyFilterOptionsToGrid),
      dan tiap kali itu terjadi seluruh grid di-render ulang dari data
      asli — sehingga teks yang sudah "dikosongkan" bisa muncul lagi.
   2. Index dari getVisibleRows() tidak selalu selaras dengan urutan
      elemen DOM saat event tsb berjalan, terutama saat baris grup
      (dx-group-row) turut dihitung.

   Solusi: JANGAN hitung merge per-sel saat cellPrepared. Sebagai
   gantinya, lakukan SATU KALI pass penuh setelah grid selesai
   render (`content-ready`), baca langsung dari DOM yang sudah jadi,
   berurutan baris demi baris, dan reset perhitungan setiap kali
   ketemu baris grup (dx-group-row) — supaya merge tidak pernah
   "menembus" ke grup lain. Ini membuat hasilnya konsisten walau
   grid di-render ulang berkali-kali.
*/
function applyColumnMerge () {
  const g = grid()
  const rowsView = sheetEl.value?.querySelector('.dx-datagrid-rowsview')
  if (!g || !rowsView || !props.mergeColumns.length) return

  const visibleColumns = g.getVisibleColumns()

  props.mergeColumns.forEach(field => {
    const colIndex = visibleColumns.findIndex(c => c.dataField === field)
    if (colIndex === -1) return // dataField tidak ditemukan di kolom yang sedang tampil

    // Ambil baris data & baris grup sesuai urutan tampil di layar —
    // baris grup dipakai sebagai penanda untuk memutus rantai merge.
    const rows = Array.from(rowsView.querySelectorAll('.dx-data-row, .dx-group-row'))

    let prevCell = null
    let prevValue = null

    rows.forEach(row => {
      if (row.classList.contains('dx-group-row')) {
        // Masuk grup baru → mulai lagi dari sel kosong biasa
        prevCell = null
        prevValue = null
        return
      }

      const cell = row.children[colIndex]
      if (!cell) { prevCell = null; prevValue = null; return }

      // Reset dulu sebelum dievaluasi ulang, supaya pass berikutnya
      // (mis. setelah scroll/re-render) tidak mewarisi state lama.
      cell.classList.remove('rb-merged-cell')
      cell.style.borderTop = ''
      if (prevCell) prevCell.style.borderBottom = ''

      const value = cell.textContent

      if (prevCell && value !== '' && value === prevValue) {
        cell.classList.add('rb-merged-cell')
        cell.style.borderTop = 'none'
        prevCell.style.borderBottom = 'none'
      }

      prevCell = cell
      prevValue = value
    })
  })
}

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

/* Klik di baris yang sama sekali lagi → lepas seleksinya (toggle).
   Ctrl/Shift+klik tetap dibiarkan mengikuti perilaku multi-select bawaan grid.
   PENTING: status "sudah dipilih atau belum" TIDAK dibaca dari grid
   (g.getSelectedRowKeys()), karena saat event row-click ini berjalan,
   grid sudah lebih dulu otomatis men-select barisnya sendiri — kalau kita
   baca statusnya dari grid, selalu kebaca "sudah terpilih" dan langsung
   di-deselect lagi (select+deselect dalam satu klik = kelihatan tidak
   bisa dipilih). Makanya dipakai ref sendiri sebagai sumber kebenaran. */
const activeRowKey = ref(null)

function onRowClick (e) {
  if (e.rowType !== 'data') return
  if (e.event && (e.event.ctrlKey || e.event.metaKey || e.event.shiftKey)) return

  const g = grid()
  if (!g) return

  if (activeRowKey.value === e.key) {
    g.deselectRows([e.key])
    activeRowKey.value = null
  } else {
    g.selectRows([e.key], false) // false = ganti seleksi, bukan ditambah
    activeRowKey.value = e.key
  }
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
  ws.getCell('A1').value = companyName.value
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

  const pageWidth = doc.internal.pageSize.getWidth()
  const centerX = pageWidth / 2

  doc.setFontSize(11); doc.text(companyName.value, centerX, 34, { align: 'center' })
  doc.setFontSize(14); doc.text(props.reportTitle, centerX, 52, { align: 'center' })
  doc.setFontSize(9);  doc.text(props.periodLabel, centerX, 66, { align: 'center' })

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
  --select-bg:  #e2e8f0;
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
  padding: 2px 14px;
  background: var(--layout-sidebar-bg);
  color: var(--layout-sidebar-text);
  font-family: var(--font-sans);
  border: 1px solid var(--layout-sidebar-border);
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}
.rb-chrome__title {
  display: flex; align-items: center; gap: 8px;
  font-size: 12.5px; font-weight: 600; letter-spacing: -.005em;
}
.rb-ico { color: var(--layout-sidebar-text); font-style: normal; }
.rb-chrome__tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rb-group { display: flex; align-items: center; gap: 2px; }
.rb-sep { width: 1px; height: 18px; background: var(--layout-sidebar-border); }

.rb-btn {
  height: 27px; min-width: 27px;
  padding: 0 9px;
  font: inherit; font-size: 11.5px;
  color: var(--layout-sidebar-text);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: background .12s, color .12s, border-color .12s;
}
.rb-btn:hover  { background: var(--layout-sidebar-hover); border-color: var(--layout-sidebar-border); color: var(--layout-sidebar-accent); }
.rb-btn:active { transform: scale(.97); }
.rb-btn:focus-visible { outline: 2px solid var(--layout-sidebar-accent); outline-offset: 1px; }
.rb-btn--zoom  { min-width: 46px; font-variant-numeric: tabular-nums; }
.rb-btn--ghost { color: var(--layout-sidebar-muted); }

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

.report-head {
  position: relative;
  display: flex;
  align-items: center;
  gap: calc(18px * var(--z));
  min-height: calc(72px * var(--z));
  text-align: left;
  padding-bottom: calc(12px * var(--z));
}
.report-head__content { flex: 1; min-width: 0; }
.report-logo {
  flex: 0 0 auto;
  width: calc(64px * var(--z));
  height: calc(64px * var(--z));
  object-fit: contain;
}
.report-logo--fallback {
  display: grid;
  place-items: center;
  color: #fff;
  background: var(--ink);
  border-radius: 6px;
  font-size: calc(16px * var(--z));
  font-weight: 800;
  letter-spacing: .08em;
}
.report-head .company {
  font-size: calc(11.5px * var(--z));
  font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
}
.report-head .company-address {
  font-size: calc(9.5px * var(--z));
  color: var(--ink-soft);
  margin-top: calc(2px * var(--z));
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

/* ---- Sel hasil merge (lihat fungsi applyColumnMerge) ----
   Teks tetap ada di DOM (supaya fitur salin sel/baris tetap akurat),
   hanya disembunyikan secara visual + border dihilangkan supaya
   terlihat seperti satu sel gabungan dengan baris di atasnya. */
.report-sheet :deep(.rb-merged-cell) {
  border-top: none !important;
  color: transparent !important;
}

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

/* ---- Matikan seluruh biru bawaan tema ----
   Baris yang sedang selected/focused dikecualikan dari style hover,
   supaya warna "terpilih" langsung tampil begitu diklik — tidak perlu
   menggeser mouse/scroll dulu supaya hover-nya lepas. */
.report-sheet :deep(.dx-datagrid-rowsview .dx-row.dx-state-hover:not(.dx-header-row):not(.dx-selection):not(.dx-row-focused) > td) {
  background: var(--tint) !important;
  color: var(--ink) !important;
}
.report-sheet :deep(.dx-datagrid-rowsview .dx-selection > td),
.report-sheet :deep(.dx-datagrid-rowsview .dx-selection.dx-row > td),
.report-sheet :deep(.dx-row-focused.dx-data-row > td),
.report-sheet :deep(.dx-row-focused.dx-group-row > td) {
  background: var(--select-bg) !important;
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

/* ---- Drag-to-scroll (mouse) ---- */
.report-sheet :deep(.dx-datagrid-rowsview .dx-scrollable-container) {
  cursor: grab;
}
.report-sheet :deep(.dx-datagrid-rowsview .dx-scrollable-container.rb-dragging) {
  cursor: grabbing;
  user-select: none;
}


/* ============================================================
   POPUP FILTER
   ============================================================ */
.rb-filter-popup {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-size: 12.5px;
  color: var(--ink);
}
.rb-filter-popup__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

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

.rb-select {
  height: 27px;
  padding: 0 24px 0 8px;
  font: inherit; font-size: 11.5px;
  color: var(--layout-sidebar-text);
  background: var(--layout-sidebar-bg);
  border: 1px solid var(--layout-sidebar-border);
  border-radius: 4px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23eff1f6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 6px center;
  background-size: 12px;
  transition: border-color .12s, color .12s;
}
.rb-select:hover {
  border-color: var(--layout-sidebar-accent);
  color: var(--layout-sidebar-accent);
}
.rb-select:focus {
  outline: none;
  border-color: var(--layout-sidebar-accent);
}
.rb-pager-input {
  width: 34px;
  height: 20px;
  text-align: center;
  font: inherit;
  font-size: 11.5px;
  color: var(--ink);
  background: var(--paper);
  border: 1px solid var(--paper-edge);
  border-radius: 4px;
  margin: 0 4px;
}
.rb-pager-input:focus {
  outline: none;
  border-color: var(--ink);
}
.rb-pager-total {
  font-size: 11.5px;
  color: var(--ink-soft);
  margin-right: 8px;
  align-self: center;
}

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
  .report-head {
    display: block !important;
    text-align: center !important;
  }
  .report-head__content { width: 100%; }
  .report-logo {
    position: absolute;
    top: 0;
    left: 0;
  }
  .report-head .company,
  .report-head .company-address,
  .report-head .title,
  .report-head .period {
    text-align: center !important;
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