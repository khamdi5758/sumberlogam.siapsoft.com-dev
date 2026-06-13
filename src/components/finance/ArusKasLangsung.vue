<template>
  <div class="cf-wrapper">

    <!-- KPI 4 kolom arus kas -->
    <div class="cf-kpi-row">
      <div v-for="k in kpiItems" :key="k.key" class="cf-kpi" :class="k.cls">
        <div class="cf-kpi-icon" :style="k.iconStyle">
          <i :class="'dx-icon-' + k.icon" aria-hidden="true" />
        </div>
        <div>
          <div class="cf-kpi-label">{{ k.label }}</div>
          <div class="cf-kpi-val" :style="{ color: k.color }">{{ k.value }}</div>
          <div class="cf-kpi-sub" :class="k.deltaClass">{{ k.sub }}</div>
        </div>
      </div>
    </div>

    <!-- 3 kartu rincian arus kas -->
    <div class="cf-cards-row">
      <div v-for="kat in kategoris" :key="kat.key" class="cf-card">
        <div class="cf-card-head">
          <span class="cf-dot" :style="{ background: kat.color }" />
          <span class="cf-card-title">{{ kat.label }}</span>
          <span class="cf-subtotal" :class="netOf(kat.key) >= 0 ? 'pos' : 'neg'">
            {{ netOf(kat.key) >= 0 ? '+' : '' }}{{ fmtJuta(netOf(kat.key)) }}
          </span>
        </div>

        <div class="cf-item-list">
          <div
            v-for="item in itemsOf(kat.key)"
            :key="item.id"
            class="cf-item"
          >
            <span class="cf-item-dot" :style="{ background: item.tipe === 'kredit' ? '#1D9E75' : '#E24B4A' }" />
            <div class="cf-item-body">
              <div class="cf-item-desc">{{ item.keterangan }}</div>
              <div class="cf-item-meta">{{ item.nama_akun }} · {{ item.tgl }}</div>
            </div>
            <span class="cf-item-amt" :class="item.tipe === 'kredit' ? 'pos' : 'neg'">
              {{ item.tipe === 'kredit' ? '+' : '' }}{{ fmtJuta(item.nilai_signed) }}
            </span>
          </div>
        </div>

        <div class="cf-subtotal-bar">
          <span>Subtotal {{ kat.label.toLowerCase() }}</span>
          <span :class="netOf(kat.key) >= 0 ? 'pos' : 'neg'" style="font-weight:600">
            {{ netOf(kat.key) >= 0 ? '+' : '' }}{{ fmtJuta(netOf(kat.key)) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Grand total + saldo -->
    <div class="cf-grand-row">
      <div class="cf-grand-box blue">
        <span class="cf-grand-label">Net Cash Flow Q{{ kuartal }}</span>
        <span class="cf-grand-val">{{ netTotal >= 0 ? '+' : '' }}{{ fmtJuta(netTotal) }}</span>
      </div>
      <div class="cf-grand-box gray">
        <span class="cf-grand-label">Saldo awal periode</span>
        <span class="cf-grand-val">{{ fmtJuta(saldoAwal) }}</span>
      </div>
      <div class="cf-grand-box green">
        <span class="cf-grand-label">Saldo akhir periode</span>
        <span class="cf-grand-val">{{ fmtJuta(saldoAkhir) }}</span>
      </div>
    </div>

    <!-- DataGrid Transaksi Kas -->
    <div class="cf-grid-card">
      <div class="cf-grid-head">
        <h3 class="cf-grid-title">
          <i class="dx-icon-event" aria-hidden="true" style="margin-right:6px;font-size:15px" />
          Detail transaksi kas
        </h3>
      </div>

      <DxDataGrid
        :data-source="transaksi"
        :show-borders="false"
        :column-auto-width="true"
        :row-alternation-enabled="true"
        :hover-state-enabled="true"
        key-expr="id"
      >
        <DxToolbar>
          <DxItem name="exportButton" />
          <DxItem name="searchPanel" />
        </DxToolbar>

        <DxSearchPanel :visible="true" :width="200" placeholder="Cari transaksi..." />
        <DxExport :enabled="true" :formats="['xlsx']" />
        <DxSorting mode="multiple" />
        <DxFilterRow :visible="true" />

        <DxColumn data-field="tgl"         caption="Tanggal"   :width="95"  alignment="center" />
        <DxColumn data-field="no_jurnal"   caption="No. Jurnal" :width="110" />
        <DxColumn data-field="keterangan"  caption="Keterangan" :min-width="200" />
        <DxColumn data-field="nama_akun"   caption="Akun"       :min-width="140" />
        <DxColumn data-field="kategori"    caption="Kategori"   :width="100" cell-template="kategoriTpl" alignment="center" />
        <DxColumn data-field="tipe"        caption="Tipe"       :width="80"  cell-template="tipeTpl"     alignment="center" />
        <DxColumn
          data-field="jumlah"
          caption="Jumlah (Rp)"
          data-type="number"
          :format="fmtGrid"
          alignment="right"
          :width="140"
        />
        <DxColumn data-field="metode"      caption="Metode"     :width="90"  alignment="center" />

        <template #kategoriTpl="{ data }">
          <span :class="['badge', 'badge-' + data.value.toLowerCase()]">{{ data.value }}</span>
        </template>
        <template #tipeTpl="{ data }">
          <span :class="['tipe-chip', data.value === 'kredit' ? 'cr' : 'db']">
            {{ data.value === 'kredit' ? 'Masuk' : 'Keluar' }}
          </span>
        </template>

        <DxSummary>
          <DxTotalItem column="keterangan" summary-type="count" display-format="{0} transaksi" />
          <DxTotalItem column="jumlah"     summary-type="sum"   :value-format="fmtGrid" display-format="Total: Rp {0}" />
        </DxSummary>

        <DxLoadPanel :enabled="true" />
        <DxScrolling mode="virtual" />
      </DxDataGrid>
    </div>

  </div>
</template>

<script>
import DxDataGrid, {
  DxColumn, DxSummary, DxTotalItem, DxSorting, DxFilterRow,
  DxSearchPanel, DxToolbar, DxItem, DxExport, DxLoadPanel, DxScrolling,
} from 'devextreme-vue/data-grid'
import { formatJuta, formatPersen } from '@/utils/format'

export default {
  name: 'ArusKasLangsung',

  components: { DxDataGrid, DxColumn, DxSummary, DxTotalItem, DxSorting, DxFilterRow, DxSearchPanel, DxToolbar, DxItem, DxExport, DxLoadPanel, DxScrolling },

  props: {
    arusKas:   { type: Object, default: () => ({}) },
    transaksi: { type: Array,  default: () => [] },
    kuartal:   { type: Number, default: 3 },
  },

  data() {
    return {
      kategoris: [
        { key: 'operasi',   label: 'Aktivitas operasi',   color: '#1D9E75' },
        { key: 'investasi', label: 'Aktivitas investasi', color: '#E24B4A' },
        { key: 'pendanaan', label: 'Aktivitas pendanaan', color: '#EF9F27' },
      ],
      fmtGrid: { type: 'fixedPoint', precision: 0, thousandSeparator: '.', decimalSeparator: ',' },
    }
  },

  computed: {
    netTotal()  { return this.arusKas?.net_total  ?? 0 },
    saldoAwal() { return this.arusKas?.saldo_awal ?? 0 },
    saldoAkhir(){ return this.arusKas?.saldo_akhir ?? 0 },

    kpiItems() {
      const a = this.arusKas
      const mk = (key, label, icon, iconStyle, color) => {
        const d  = a?.[key] ?? {}
        const net = d.net ?? 0
        return {
          key, label, icon, iconStyle, color,
          value: (net >= 0 ? '+' : '') + formatJuta(net),
          sub:   formatPersen(d.pct_delta ?? 0) + ' vs periode lalu',
          deltaClass: (d.pct_delta ?? 0) >= 0 ? 'up' : 'dn',
        }
      }
      return [
        mk('operasi',   'Arus kas operasi',   'chart',   'background:#E1F5EE;color:#085041', '#0F6E56'),
        mk('investasi', 'Arus kas investasi', 'home',    'background:#FCEBEB;color:#791F1F', '#A32D2D'),
        mk('pendanaan', 'Arus kas pendanaan', 'money',   'background:#FAEEDA;color:#633806', '#854F0B'),
        {
          key: 'net', label: 'Net cash flow', icon: 'refresh',
          iconStyle: 'background:#E6F1FB;color:#0C447C',
          color: this.netTotal >= 0 ? '#0F6E56' : '#A32D2D',
          value: (this.netTotal >= 0 ? '+' : '') + formatJuta(this.netTotal),
          sub: 'Saldo akhir: ' + formatJuta(this.saldoAkhir),
          deltaClass: this.netTotal >= 0 ? 'up' : 'dn',
        },
      ]
    },
  },

  methods: {
    fmtJuta: formatJuta,
    itemsOf(key) { return this.arusKas?.[key]?.items ?? [] },
    netOf(key)   { return this.arusKas?.[key]?.net   ?? 0 },
  },
}
</script>

<style scoped>
.cf-wrapper { display: flex; flex-direction: column; gap: 16px; }
.cf-kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
@media (max-width: 900px) { .cf-kpi-row { grid-template-columns: repeat(2, 1fr); } }
.cf-kpi { background: #fff; border-radius: 10px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
.cf-kpi-icon { width: 38px; height: 38px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
.cf-kpi-label { font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: #888; margin-bottom: 3px; }
.cf-kpi-val   { font-size: 17px; font-weight: 600; margin-bottom: 2px; }
.cf-kpi-sub   { font-size: 10px; }
.up { color: #0F6E56; } .dn { color: #A32D2D; }

.cf-cards-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
@media (max-width: 900px) { .cf-cards-row { grid-template-columns: 1fr; } }
.cf-card { background: #fff; border-radius: 10px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
.cf-card-head { display: flex; align-items: center; gap: 7px; margin-bottom: 12px; }
.cf-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.cf-card-title { font-size: 12px; font-weight: 600; color: #1a1a2e; flex: 1; }
.cf-subtotal { font-size: 12px; font-weight: 600; }
.pos { color: #0F6E56; } .neg { color: #A32D2D; }
.cf-item-list { display: flex; flex-direction: column; gap: 0; margin-bottom: 8px; }
.cf-item { display: flex; align-items: flex-start; gap: 8px; padding: 7px 0; border-bottom: 0.5px solid #f0f0f0; }
.cf-item:last-child { border-bottom: none; }
.cf-item-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }
.cf-item-body { flex: 1; min-width: 0; }
.cf-item-desc { font-size: 11px; color: #222; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cf-item-meta { font-size: 10px; color: #999; }
.cf-item-amt  { font-size: 11px; font-weight: 600; flex-shrink: 0; min-width: 72px; text-align: right; }
.cf-subtotal-bar { background: #f7f8fa; border-radius: 6px; padding: 6px 10px; display: flex; justify-content: space-between; font-size: 11px; color: #666; }

.cf-grand-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.cf-grand-box { border-radius: 10px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; }
.cf-grand-box.blue  { background: #E6F1FB; }
.cf-grand-box.gray  { background: #F1EFE8; }
.cf-grand-box.green { background: #E1F5EE; }
.cf-grand-label { font-size: 11px; font-weight: 500; color: #555; }
.cf-grand-val   { font-size: 16px; font-weight: 600; color: #1a1a2e; }

.cf-grid-card { background: #fff; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
.cf-grid-head { margin-bottom: 14px; }
.cf-grid-title { font-size: 13px; font-weight: 600; color: #1a1a2e; margin: 0; display: flex; align-items: center; }
.badge { display: inline-block; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 10px; }
.badge-operasi   { background: #E1F5EE; color: #085041; }
.badge-investasi { background: #FCEBEB; color: #791F1F; }
.badge-pendanaan { background: #FAEEDA; color: #633806; }
.tipe-chip { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 8px; }
.tipe-chip.cr { background: #E1F5EE; color: #085041; }
.tipe-chip.db { background: #FCEBEB; color: #791F1F; }
</style>
