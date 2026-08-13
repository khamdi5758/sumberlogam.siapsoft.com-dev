<template>
  <div class="serial-detail-wrapper">
    <!-- Data grid -->
    <DxDataGrid
      :data-source="detailRows"
      :show-borders="true"
      :column-auto-width="true"
      :row-alternation-enabled="true"
      no-data-text="Tidak ada data detail"
    >
      <DxGroupPanel :visible="false" />
      <DxGrouping :auto-expand-all="true" />

      <DxColumn data-field="Serialmanual" caption="No. Serial / PB" />
      <DxColumn
        data-field="sumQnt"
        caption="Qty"
        data-type="number"
        format="#,##0.##"
      />
      <DxColumn data-field="Satuan" caption="Satuan" />
      <DxColumn
        data-field="HppSatuan"
        caption="HPP Satuan"
        data-type="number"
        format="#,##0"
      />
      <DxColumn
        data-field="sumTotal"
        caption="Total"
        data-type="number"
        format="#,##0"
      />

      <DxSummary>
        <DxGroupItem
          column="sumQnt"
          summary-type="sum"
          display-format="Total Qty: {0}"
          value-format="#,##0.##"
        />
        <DxGroupItem
          column="sumTotal"
          summary-type="sum"
          display-format="Total: {0}"
          value-format="#,##0"
        />
      </DxSummary>

      <DxPaging :enabled="false" />
    </DxDataGrid>

    <!-- Loading overlay (parent or detail filtering) -->
    <div v-if="isLoading || detailLoading" class="detail-loading-overlay">
      <div class="detail-loading">
        <div class="spinner"></div>
        <span>Memuat data detail...</span>
      </div>
    </div>
  </div>
</template>

<script>
import {
  DxDataGrid,
  DxColumn,
  DxPaging,
  DxGrouping,
  DxGroupPanel,
  DxSummary,
  DxGroupItem,
} from "devextreme-vue/data-grid";

export default {
  name: "RegisterSerialDetailTemplate",
  components: {
    DxDataGrid,
    DxColumn,
    DxPaging,
    DxGrouping,
    DxGroupPanel,
    DxSummary,
    DxGroupItem,
  },
  props: {
    masterRow: {
      type: Object,
      default: () => ({}),
    },
    // seluruh response API, di-pass dari komponen induk (grid utama)
    fullResponse: {
      type: Object,
      default: () => ({}),
    },
    // true selama parent masih fetch data detail
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      detailRows: [],
      detailLoading: false,
    };
  },
  computed: {
    rowData() {
      return this.masterRow && this.masterRow.data
        ? this.masterRow.data
        : this.masterRow || {};
    },
    allDetailData() {
      return this.fullResponse?.detail?.data || [];
    },
  },
  watch: {
    rowData: {
      handler() {
        this.loadDetailData();
      },
      immediate: true,
    },
    allDetailData: {
      handler() {
        this.loadDetailData();
      },
      immediate: true,
    },
  },
  methods: {
    loadDetailData() {
      this.detailLoading = true;
      const key1 = this.rowData?.Kodebrg;
      const key2 = this.rowData?.GDG;
      const all = this.allDetailData || [];

      // Defer to allow overlay render
      setTimeout(() => {
        try {
          if (!key1) {
            this.detailRows = [];
          } else {
            this.detailRows = all.filter(
              (item) => item.Kodebrg === key1 && item.GDG === key2,
            );
          }
        } catch (e) {
          console.error("Error filtering detail rows:", e);
          this.detailRows = [];
        } finally {
          this.detailLoading = false;
        }
      }, 30);
    },
  },
};
</script>

<style scoped>
.serial-detail-wrapper {
  padding: 12px 16px;
  background: #f9fafb;
  position: relative;
}

.detail-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 0;
  color: #6b7280;
  font-size: 13px;
}

.detail-loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
  z-index: 20;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #d1d5db;
  border-top-color: #4b5563;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>