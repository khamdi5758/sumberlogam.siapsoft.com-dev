<template>
  <div class="master-barang-page">
    <!-- Header halaman -->
    <div class="page-header">
      <h1 class="page-title">📦 Master Barang</h1>
      <span class="total-barang">{{ products.length }} barang</span>
    </div>

    <!-- DataGrid -->
    <DataGrid
      ref="dataGrid"
      :dataSource="products"
      :keyExpr="'id'"
      :columns="columns"
      :showToolbar="true"
      :showAddButton="true"
      :addButtonText="'Tambah Barang'"
      :showEditAction="true"
      :showDeleteAction="true"
      :allowUpdating="true"
      :allowDeleting="true"
      :allowAdding="true"
      :showRefreshButton="true"
      :showExportButton="true"
      :showSearchPanel="true"
      :searchPlaceholder="'Cari barang...'"
      :useBuiltInPager="true"
      :pageSize="10"
      :allowedPageSizes="[5, 10, 20, 50]"
      :height="'calc(100vh - 180px)'"
      :columnAutoWidth="true"
      :columnHidingEnabled="true"
      :allowColumnResizing="true"
      :rowAlternationEnabled="true"
      :showBorders="true"
      @add-click="tambahBarang"
      @refresh-click="refreshData"
    />
  </div>
</template>

<script>
import DataGrid from "@/components/widgets/DataGrid.vue";

export default {
  name: "MasterBarang",
  components: {
    DataGrid,
  },
  data() {
    return {
      products: [
        {
          id: 1,
          nama: "Baut M8 x 25mm",
          kategori: "Komponen Mesin",
          hargaBeli: 2500,
          stok: 120,
          satuan: "pcs",
          lokasi: "Gudang A - Rak 3",
        },
        {
          id: 2,
          nama: "Oli Mesin SAE 10W-40",
          kategori: "Pelumas",
          hargaBeli: 45000,
          stok: 18,
          satuan: "liter",
          lokasi: "Gudang B - Rak 1",
        },
        {
          id: 3,
          nama: "Kabel Listrik NYA 2.5mm²",
          kategori: "Elektrikal",
          hargaBeli: 35000,
          stok: 0,
          satuan: "meter",
          lokasi: "Gudang C - Rak 5",
        },
        {
          id: 4,
          nama: "Mur M10",
          kategori: "Komponen Mesin",
          hargaBeli: 3000,
          stok: 75,
          satuan: "pcs",
          lokasi: "Gudang A - Rak 4",
        },
        {
          id: 5,
          nama: "Filter Udara",
          kategori: "Suku Cadang",
          hargaBeli: 125000,
          stok: 8,
          satuan: "pcs",
          lokasi: "Gudang B - Rak 2",
        },
        {
          id: 6,
          nama: "Roda Gigi Baja",
          kategori: "Komponen Mesin",
          hargaBeli: 75000,
          stok: 3,
          satuan: "pcs",
          lokasi: "Gudang A - Rak 1",
        },
        {
          id: 7,
          nama: "Pompa Air 1 HP",
          kategori: "Peralatan",
          hargaBeli: 850000,
          stok: 2,
          satuan: "unit",
          lokasi: "Gudang C - Rak 2",
        },
        {
          id: 8,
          nama: "Bearing 6205ZZ",
          kategori: "Komponen Mesin",
          hargaBeli: 22000,
          stok: 45,
          satuan: "pcs",
          lokasi: "Gudang A - Rak 2",
        },
      ],
      columns: [
        {
          dataField: "nama",
          caption: "Nama Barang",
          dataType: "string",
          width: 200,
          minWidth: 120,
        },
        {
          dataField: "kategori",
          caption: "Kategori",
          dataType: "string",
          width: 150,
          minWidth: 100,
        },
        {
          dataField: "hargaBeli",
          caption: "Harga Beli",
          dataType: "number",
          format: { type: "currency", currency: "IDR" },
          alignment: "right",
          width: 150,
          minWidth: 100,
        },
        {
          dataField: "stok",
          caption: "Stok",
          dataType: "number",
          alignment: "right",
          width: 100,
          minWidth: 70,
          // Custom cell template via cellTemplate
          cellTemplate: (container, options) => {
            const stok = options.value;
            let className = "status-aman";
            let label = "Aman";
            if (stok === 0) {
              className = "status-habis";
              label = "Habis";
            } else if (stok <= 5) {
              className = "status-menipis";
              label = "Menipis";
            }
            container.innerHTML = `
              <span class="stock-cell">
                <strong>${stok}</strong>
                <span class="status-badge ${className}">${label}</span>
              </span>
            `;
          },
        },
        {
          dataField: "satuan",
          caption: "Satuan",
          dataType: "string",
          width: 100,
          minWidth: 70,
        },
        {
          dataField: "lokasi",
          caption: "Lokasi",
          dataType: "string",
          width: 180,
          minWidth: 120,
        },
      ],
    };
  },
  methods: {
    tambahBarang() {
      // Simulasi tambah data (nanti diganti modal)
      const nama = prompt("Nama Barang:");
      if (!nama) return;
      const kategori = prompt("Kategori:") || "";
      const hargaBeli = parseFloat(prompt("Harga Beli:")) || 0;
      const stok = parseInt(prompt("Stok:"), 10) || 0;
      const satuan = prompt("Satuan:") || "";
      const lokasi = prompt("Lokasi Gudang:") || "";

      const newId =
        this.products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
      this.products.push({
        id: newId,
        nama,
        kategori,
        hargaBeli,
        stok,
        satuan,
        lokasi,
      });

      this.$refs.dataGrid.refreshGrid();
    },

    refreshData() {
      this.$refs.dataGrid.refreshGrid();
    },
  },
};
</script>

<style scoped>
.master-barang-page {
  padding: 20px;
  background: var(--layout-content-bg);
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-main-text);
  margin: 0;
  border-left: 5px solid var(--color-good-green);
  padding-left: 16px;
}

.total-barang {
  font-size: 0.9rem;
  color: var(--color-sub-text);
  background: var(--color-light-base);
  padding: 4px 14px;
  border-radius: 20px;
  font-weight: 600;
}

/* --- Styling untuk badge stok di dalam grid --- */
:deep(.stock-cell) {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

:deep(.stock-cell strong) {
  font-weight: 700;
}

:deep(.status-badge) {
  display: inline-block;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 30px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

:deep(.status-aman) {
  color: var(--color-good-green);
  background: #d1fae5;
}

:deep(.status-menipis) {
  color: var(--color-yellow);
  background: #fef3c7;
}

:deep(.status-habis) {
  color: var(--color-red);
  background: #fee2e2;
}

/* --- Responsif mobile --- */
@media (max-width: 768px) {
  .master-barang-page {
    padding: 12px;
  }

  .page-title {
    font-size: 1.4rem;
    padding-left: 12px;
  }

  .page-header {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .total-barang {
    font-size: 0.8rem;
    padding: 2px 10px;
  }

  /* Grid lebih ramping di mobile */
  :deep(.dx-datagrid) {
    font-size: 12px !important;
  }

  :deep(.dx-datagrid-headers .dx-datagrid-table .dx-header-row td) {
    font-size: 11px !important;
    padding: 8px 10px !important;
  }

  :deep(.dx-datagrid-rowsview .dx-row td) {
    padding: 8px 10px !important;
    font-size: 12px !important;
  }

  :deep(.status-badge) {
    font-size: 0.5rem !important;
    padding: 1px 6px !important;
  }
}

@media (max-width: 480px) {
  .master-barang-page {
    padding: 8px;
  }

  .page-title {
    font-size: 1.2rem;
  }

  /* Pastikan grid bisa di-scroll horizontal di HP */
  :deep(.dx-datagrid-rowsview),
  :deep(.dx-datagrid-content),
  :deep(.dx-scrollable-container) {
    touch-action: pan-x pan-y !important;
    -webkit-overflow-scrolling: touch !important;
  }

  /* Toolbar lebih kecil */
  :deep(.dx-toolbar) {
    min-height: 28px !important;
  }
  :deep(.dx-toolbar-items-container) {
    height: 28px !important;
  }
  :deep(.dx-toolbar .dx-button) {
    height: 24px !important;
    min-width: 24px !important;
  }
  :deep(.dx-toolbar .dx-button .dx-icon) {
    font-size: 12px !important;
    width: 12px !important;
    height: 12px !important;
  }
  :deep(.dx-toolbar .dx-button-content) {
    padding: 2px 4px !important;
  }
  :deep(.dx-toolbar-item) {
    margin-right: 2px !important;
  }
}
</style>
