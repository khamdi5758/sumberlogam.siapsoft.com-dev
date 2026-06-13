<template>
  <div class="grid-card">
    <div class="grid-header">
      <h3 class="grid-title">
        <i class="dx-icon-warning" aria-hidden="true" style="margin-right:6px;color:#e53935;" />
        Nota Jatuh Tempo
      </h3>
      <span class="total-chip danger" v-if="dataSource.length">
        {{ dataSource.length }} nota · {{ totalFormatted }}
      </span>
    </div>

    <DxDataGrid
      :data-source="dataSource"
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

      <DxSearchPanel :visible="true" :width="180" placeholder="Cari nota..." />
      <DxExport :enabled="true" :formats="['xlsx']" />
      <DxSorting mode="multiple" />

      <DxColumn data-field="no_nota"        caption="No. Nota"    :width="120" />
      <DxColumn data-field="nama_pelanggan" caption="Pelanggan"   :min-width="160" />
      <DxColumn data-field="tgl_nota"       caption="Tgl Nota"    :width="100" alignment="center" />
      <DxColumn data-field="tgl_jatuh_tempo" caption="Jatuh Tempo" :width="110" alignment="center" />
      <DxColumn
        data-field="sisa_piutang"
        caption="Sisa Piutang"
        data-type="number"
        :format="formatCurrency"
        alignment="right"
      />
      <DxColumn
        data-field="selisih_hari"
        caption="Lewat (Hari)"
        :width="110"
        alignment="center"
        cell-template="selisihTemplate"
        :sort-order="'desc'"
      />
      <DxColumn
        data-field="status_badge"
        caption="Status"
        :width="90"
        cell-template="statusTemplate"
        alignment="center"
      />

      <template #selisihTemplate="{ data }">
        <span class="overdue-chip">+{{ data.value }} hr</span>
      </template>

      <template #statusTemplate="{ data }">
        <span :class="['badge', `badge-${data.value}`]">
          {{ badgeLabel(data.value) }}
        </span>
      </template>

      <DxSummary>
        <DxTotalItem column="sisa_piutang" summary-type="sum" :value-format="formatCurrency" display-format="Total: Rp {0}" />
      </DxSummary>

      <DxLoadPanel :enabled="true" />
    </DxDataGrid>
  </div>
</template>

<script>
import DxDataGrid, {
  DxColumn, DxSummary, DxTotalItem, DxSorting,
  DxSearchPanel, DxToolbar, DxItem, DxExport, DxLoadPanel,
} from 'devextreme-vue/data-grid'
import { formatRupiah } from '@/utils/format'

export default {
  name: 'NotaJatuhTempo',

  components: {
    DxDataGrid, DxColumn, DxSummary, DxTotalItem,
    DxSorting, DxSearchPanel, DxToolbar, DxItem,
    DxExport, DxLoadPanel,
  },

  props: {
    dataSource: { type: Array, default: () => [] },
  },

  data() {
    return {
      formatCurrency: {
        type: 'fixedPoint', precision: 0,
        thousandSeparator: '.', decimalSeparator: ',',
      },
    }
  },

  computed: {
    totalFormatted() {
      const total = this.dataSource.reduce((s, r) => s + (r.sisa_piutang || 0), 0)
      return formatRupiah(total)
    },
  },

  methods: {
    badgeLabel(val) {
      const map = { lancar:'Lancar', perhatian:'Perhatian', melebihi:'Melebihi', kritis:'Kritis' }
      return map[val] ?? val
    },
  },
}
</script>

<style scoped>
.grid-card {
  background: #fff; border-radius: 10px;
  padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,.06);
}
.grid-header {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 14px;
}
.grid-title { font-size: 14px; font-weight: 600; color: #222; margin: 0; display: flex; align-items: center; }
.total-chip {
  font-size: 11px; padding: 3px 10px;
  border-radius: 12px; font-weight: 600;
}
.total-chip.danger { background: #ffebee; color: #c62828; }
.overdue-chip { font-size: 11px; color: #b71c1c; background: #ffcdd2; padding: 2px 7px; border-radius: 8px; }
.badge { display: inline-block; font-size: 10px; font-weight: 600; padding: 2px 9px; border-radius: 10px; letter-spacing:.04em; }
.badge-lancar    { background: #e8f5e9; color: #2e7d32; }
.badge-perhatian { background: #fff3e0; color: #e65100; }
.badge-melebihi  { background: #fce4ec; color: #c62828; }
.badge-kritis    { background: #ffcdd2; color: #b71c1c; }
</style>
