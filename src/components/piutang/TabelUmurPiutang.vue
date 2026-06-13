<template>
  <div class="grid-card">
    <div class="grid-header">
      <h3 class="grid-title">
        <i class="dx-icon-clock" aria-hidden="true" style="margin-right:6px;" />
        Tabel Umur Piutang
      </h3>
    </div>

    <DxDataGrid
      :data-source="dataSource"
      :show-borders="false"
      :column-auto-width="true"
      :word-wrap-enabled="false"
      :row-alternation-enabled="true"
      :hover-state-enabled="true"
      key-expr="pelanggan_id"
      @initialized="onInit"
    >
      <!-- Toolbar -->
      <DxToolbar>
        <DxItem name="exportButton" />
        <DxItem name="searchPanel" />
      </DxToolbar>

      <DxSearchPanel :visible="true" :width="180" placeholder="Cari pelanggan..." />
      <DxExport :enabled="true" :formats="['xlsx', 'pdf']" />
      <DxSorting mode="multiple" />

      <!-- Kolom -->
      <DxColumn
        data-field="kode_pelanggan"
        caption="Kode"
        :width="90"
        :allow-sorting="true"
      />
      <DxColumn
        data-field="nama_pelanggan"
        caption="Pelanggan"
        :min-width="160"
      />
      <DxColumn
        data-field="bucket_0_30"
        caption="0–30 Hari"
        data-type="number"
        :format="formatCurrency"
        css-class="col-lancar"
        alignment="right"
      />
      <DxColumn
        data-field="bucket_31_60"
        caption="31–60 Hari"
        data-type="number"
        :format="formatCurrency"
        css-class="col-warning"
        alignment="right"
      />
      <DxColumn
        data-field="bucket_61_90"
        caption="61–90 Hari"
        data-type="number"
        :format="formatCurrency"
        css-class="col-danger"
        alignment="right"
      />
      <DxColumn
        data-field="bucket_90plus"
        caption=">90 Hari"
        data-type="number"
        :format="formatCurrency"
        css-class="col-kritis"
        alignment="right"
      />
      <DxColumn
        data-field="total"
        caption="Total"
        data-type="number"
        :format="formatCurrency"
        alignment="right"
        :allow-sorting="true"
        css-class="col-total"
      />
      <DxColumn
        data-field="status_badge"
        caption="Status"
        :width="100"
        cell-template="statusTemplate"
        alignment="center"
      />

      <!-- Template status badge -->
      <template #statusTemplate="{ data }">
        <span :class="['badge', `badge-${data.value}`]">
          {{ badgeLabel(data.value) }}
        </span>
      </template>

      <!-- Summary baris total -->
      <DxSummary>
        <DxTotalItem column="nama_pelanggan" summary-type="count" display-format="{0} pelanggan" />
        <DxTotalItem column="bucket_0_30"   summary-type="sum" :value-format="formatCurrency" />
        <DxTotalItem column="bucket_31_60"  summary-type="sum" :value-format="formatCurrency" />
        <DxTotalItem column="bucket_61_90"  summary-type="sum" :value-format="formatCurrency" />
        <DxTotalItem column="bucket_90plus" summary-type="sum" :value-format="formatCurrency" />
        <DxTotalItem column="total"         summary-type="sum" :value-format="formatCurrency" display-format="Rp {0}" />
      </DxSummary>

      <DxLoadPanel :enabled="true" />
      <DxScrolling mode="virtual" />
    </DxDataGrid>
  </div>
</template>

<script>
import DxDataGrid, {
  DxColumn,
  DxSummary,
  DxTotalItem,
  DxSorting,
  DxSearchPanel,
  DxToolbar,
  DxItem,
  DxExport,
  DxLoadPanel,
  DxScrolling,
} from 'devextreme-vue/data-grid'

export default {
  name: 'TabelUmurPiutang',

  components: {
    DxDataGrid, DxColumn, DxSummary, DxTotalItem,
    DxSorting, DxSearchPanel, DxToolbar, DxItem,
    DxExport, DxLoadPanel, DxScrolling,
  },

  props: {
    dataSource: { type: Array, default: () => [] },
  },

  data() {
    return {
      formatCurrency: {
        type: 'fixedPoint',
        precision: 0,
        thousandSeparator: '.',
        decimalSeparator: ',',
      },
    }
  },

  methods: {
    onInit(e) {
      this.gridInstance = e.component
    },

    badgeLabel(val) {
      const map = {
        lancar:    'Lancar',
        perhatian: 'Perhatian',
        melebihi:  'Melebihi',
        kritis:    'Kritis',
      }
      return map[val] ?? val
    },
  },
}
</script>

<style scoped>
.grid-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  margin-bottom: 20px;
}
.grid-header { margin-bottom: 14px; }
.grid-title {
  font-size: 14px; font-weight: 600; color: #222; margin: 0;
  display: flex; align-items: center;
}

/* Badge status */
.badge {
  display: inline-block;
  font-size: 10px; font-weight: 600;
  padding: 2px 9px; border-radius: 10px;
  text-transform: uppercase; letter-spacing: .04em;
}
.badge-lancar    { background: #e8f5e9; color: #2e7d32; }
.badge-perhatian { background: #fff3e0; color: #e65100; }
.badge-melebihi  { background: #fce4ec; color: #c62828; }
.badge-kritis    { background: #ffcdd2; color: #b71c1c; }

/* Warna kolom bucket */
:deep(.col-lancar .dx-data-row)    { color: #2e7d32; }
:deep(.col-warning .dx-data-row)   { color: #e65100; }
:deep(.col-danger .dx-data-row)    { color: #c62828; }
:deep(.col-kritis .dx-data-row)    { color: #b71c1c; }
:deep(.col-total)                  { font-weight: 600; }
</style>
