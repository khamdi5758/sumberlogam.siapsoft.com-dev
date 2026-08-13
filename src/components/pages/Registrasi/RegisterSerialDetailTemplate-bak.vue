<template>
  <div class="serial-detail-wrapper">
    <DxDataGrid
      :data-source="detailData"
      :show-borders="true"
      :column-auto-width="true"
      :row-alternation-enabled="true"
      no-data-text="Tidak ada data detail"
    >
      <DxColumn
        v-for="col in detailColumns"
        :key="col.dataField"
        :data-field="col.dataField"
        :caption="col.caption"
      />
      <DxPaging :enabled="false" />
    </DxDataGrid>
  </div>
</template>

<script>
import { DxDataGrid, DxColumn, DxPaging } from "devextreme-vue/data-grid";

export default {
  name: "RegisterSerialDetailTemplate",
  components: { DxDataGrid, DxColumn, DxPaging },
  props: {
    // Baris master yang di-expand (dari template master-detail DxDataGrid)
    masterRow: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    // Data baris master apa adanya (tidak diubah)
    rowData() {
      return this.masterRow && this.masterRow.data
        ? this.masterRow.data
        : this.masterRow || {};
    },
    // Tampilkan data row yang sedang tampil di grid sebagai detail (1 baris)
    detailData() {
      return this.rowData && Object.keys(this.rowData).length
        ? [this.rowData]
        : [];
    },
    detailColumns() {
      if (!this.detailData.length) return [];
      return Object.keys(this.detailData[0]).map((k) => ({
        dataField: k,
        caption: this.formatCaption(k),
      }));
    },
  },
  methods: {
    formatCaption(key) {
      return key
        .replace(/[_]+/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    },
  },
};
</script>

<style scoped>
.serial-detail-wrapper {
  padding: 12px 16px;
  background: #f9fafb;
}
</style>
