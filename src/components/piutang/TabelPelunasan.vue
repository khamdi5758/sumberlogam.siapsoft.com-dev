<template>
  <div class="grid-card">
    <div class="grid-header">
      <h3 class="grid-title">
        <i class="dx-icon-check" aria-hidden="true" style="margin-right:6px;color:#388e3c;" />
        Pelunasan Piutang Periode
      </h3>
      <span class="total-chip success" v-if="total > 0">
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

      <DxSearchPanel :visible="true" :width="180" placeholder="Cari..." />
      <DxExport :enabled="true" :formats="['xlsx']" />
      <DxSorting mode="multiple" />

      <DxColumn data-field="no_bayar"       caption="No. Pembayaran" :width="130" />
      <DxColumn data-field="tgl_bayar"      caption="Tgl Bayar"      :width="100" alignment="center" />
      <DxColumn data-field="no_nota"        caption="No. Nota"       :width="120" />
      <DxColumn data-field="nama_pelanggan" caption="Pelanggan"      :min-width="160" />
      <DxColumn
        data-field="jumlah_bayar"
        caption="Jumlah (Rp)"
        data-type="number"
        :format="formatCurrency"
        alignment="right"
        :sort-order="'desc'"
      />
      <DxColumn
        data-field="metode_bayar"
        caption="Metode"
        :width="90"
        alignment="center"
        cell-template="metodeTemplate"
      />
      <DxColumn data-field="no_referensi" caption="No. Referensi" :width="130" />

      <template #metodeTemplate="{ data }">
        <span :class="['badge-metode', `metode-${(data.value || '').toLowerCase()}`]">
          {{ data.value }}
        </span>
      </template>

      <DxSummary>
        <DxTotalItem column="nama_pelanggan" summary-type="count"  display-format="{0} transaksi" />
        <DxTotalItem column="jumlah_bayar"   summary-type="sum"    :value-format="formatCurrency" display-format="Total: Rp {0}" />
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
  name: 'TabelPelunasan',

  components: {
    DxDataGrid, DxColumn, DxSummary, DxTotalItem,
    DxSorting, DxSearchPanel, DxToolbar, DxItem,
    DxExport, DxLoadPanel,
  },

  props: {
    dataSource: { type: Array, default: () => [] },
    total:      { type: Number, default: 0 },
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
      return formatRupiah(this.total)
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
.total-chip { font-size: 11px; padding: 3px 10px; border-radius: 12px; font-weight: 600; }
.total-chip.success { background: #e8f5e9; color: #2e7d32; }
.badge-metode {
  font-size: 10px; font-weight: 600; padding: 2px 8px;
  border-radius: 10px; letter-spacing: .04em;
}
.metode-transfer { background: #e3f2fd; color: #1565c0; }
.metode-tunai    { background: #e8f5e9; color: #2e7d32; }
.metode-giro     { background: #f3e5f5; color: #6a1b9a; }
</style>
