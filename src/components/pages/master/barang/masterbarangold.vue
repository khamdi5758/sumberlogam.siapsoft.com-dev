<template>
  <div class="master-barang-page">
    <!-- Header dengan statistik -->
    <div class="page-header-card">
      <div class="header-top">
        <div class="header-title-group">
          <div class="title-icon">📦</div>
          <div>
            <h1 class="page-title">Master Barang</h1>
            <p class="page-subtitle">Kelola data inventaris barang</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-add" @click="tambahBarang">
            <span class="btn-icon">＋</span>
            Tambah Barang
          </button>
        </div>
      </div>

      <!-- Statistik ringkas -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-value">{{ products.length }}</span>
          <span class="stat-label">Total Barang</span>
        </div>
        <div class="stat-item stat-aman">
          <span class="stat-value">{{ stokAman }}</span>
          <span class="stat-label">Stok Aman</span>
        </div>
        <div class="stat-item stat-menipis">
          <span class="stat-value">{{ stokMenipis }}</span>
          <span class="stat-label">Menipis</span>
        </div>
        <div class="stat-item stat-habis">
          <span class="stat-value">{{ stokHabis }}</span>
          <span class="stat-label">Habis</span>
        </div>
      </div>
    </div>

    <!-- DataGrid - Full width -->
    <div class="grid-wrapper">
      <DataGrid
        ref="dataGrid"
        :dataSource="products"
        :keyExpr="'id'"
        :columns="columns"
        :showBorders="false"
        :rowAlternationEnabled="true"
        :columnAutoWidth="true"
        :allowColumnResizing="true"
        :allowColumnReordering="true"
        :showToolbar="true"
        :showAddButton="false"
        :showEditAction="true"
        :showDeleteAction="true"
        :showRefreshButton="true"
        :showExportButton="true"
        :showSearchPanel="true"
        :searchPlaceholder="'Cari barang...'"
        :showPager="true"
        :pageSize="10"
        :showPageSizeSelector="true"
        :allowedPageSizes="[5, 10,,0]"
        :showNavigationButtons="true"
        :showFilterRow="true"
        :wordwrap="false"
        :useBuiltInPager="true"
        :showGroupPanel="true"
        :allowGrouping="true"
        :height="'auto'"
        :columnHidingEnabled="true"
        @refresh-click="refreshData"
      />
    </div>
  </div>
</template>

<script>
import DataGrid from "@/components/widgets/DataGrid.vue";

export default {
  name: "MasterBarangold",
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
          hargaJual: 2500,
          stok: 120,
          satuan: "pcs",
          lokasi: "Gudang A - Rak 3",
        },
        {
          id: 2,
          nama: "Oli Mesin SAE 10W-40",
          kategori: "Pelumas",
          hargaJual: 45000,
          stok: 18,
          satuan: "liter",
          lokasi: "Gudang B - Rak 1",
        },
        {
          id: 3,
          nama: "Kabel Listrik NYA 2.5mm²",
          kategori: "Elektrikal",
          hargaJual: 35000,
          stok: 0,
          satuan: "meter",
          lokasi: "Gudang C - Rak 5",
        },
        {
          id: 4,
          nama: "Mur M10",
          kategori: "Komponen Mesin",
          hargaJual: 3000,
          stok: 75,
          satuan: "pcs",
          lokasi: "Gudang A - Rak 4",
        },
        {
          id: 5,
          nama: "Filter Udara",
          kategori: "Suku Cadang",
          hargaJual: 125000,
          stok: 8,
          satuan: "pcs",
          lokasi: "Gudang B - Rak 2",
        },
        {
          id: 6,
          nama: "Roda Gigi Baja",
          kategori: "Komponen Mesin",
          hargaJual: 75000,
          stok: 3,
          satuan: "pcs",
          lokasi: "Gudang A - Rak 1",
        },
        {
          id: 7,
          nama: "Pompa Air 1 HP",
          kategori: "Peralatan",
          hargaJual: 850000,
          stok: 2,
          satuan: "unit",
          lokasi: "Gudang C - Rak 2",
        },
        {
          id: 8,
          nama: "Bearing 6205ZZ",
          kategori: "Komponen Mesin",
          hargaJual: 22000,
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
          minWidth: 120,
        },
        {
          dataField: "kategori",
          caption: "Kategori",
          dataType: "string",
          minWidth: 100,
        },
        {
          dataField: "hargaJual",
          caption: "Harga Jual",
          dataType: "number",
          format: { type: "currency", currency: "IDR" },
          alignment: "right",
          minWidth: 100,
        },
        {
          dataField: "stok",
          caption: "Stok",
          dataType: "number",
          alignment: "right",
          minWidth: 100,
          cellTemplate: (container, options) => {
            const stok = options.value;
            let status = "aman";
            let label = "Aman";
            if (stok === 0) {
              status = "habis";
              label = "Habis";
            } else if (stok <= 5) {
              status = "menipis";
              label = "Menipis";
            }
            container.innerHTML = `
                            <div class="stock-cell">
                                <span class="stock-number">${stok}</span>
                                <span class="stock-badge badge-${status}">${label}</span>
                            </div>
                        `;
          },
        },
        {
          dataField: "satuan",
          caption: "Satuan",
          dataType: "string",
          minWidth: 70,
        },
        {
          dataField: "lokasi",
          caption: "Lokasi",
          dataType: "string",
          minWidth: 120,
        },
      ],
    };
  },
  computed: {
    stokAman() {
      return this.products.filter((p) => p.stok > 5).length;
    },
    stokMenipis() {
      return this.products.filter((p) => p.stok > 0 && p.stok <= 5).length;
    },
    stokHabis() {
      return this.products.filter((p) => p.stok === 0).length;
    },
  },
  methods: {
    tambahBarang() {
      const nama = prompt("Nama Barang:");
      if (!nama) return;
      const kategori = prompt("Kategori:") || "";
      const hargaJual = parseFloat(prompt("Harga Jual:")) || 0;
      const stok = parseInt(prompt("Stok:"), 10) || 0;
      const satuan = prompt("Satuan:") || "";
      const lokasi = prompt("Lokasi Gudang:") || "";

      const newId =
        this.products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
      this.products.push({
        id: newId,
        nama,
        kategori,
        hargaJual,
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
/* ===== Menggunakan variabel dari welcome.css ===== */
.master-barang-page {
  --primary: #2a7de1;
  --primary-dark: #1a5fb4;
  --primary-light: #e8f0fe;
  --success: var(--color-good-green);
  --success-bg: #e6f7ed;
  --warning: #e8a830;
  --warning-bg: #fef7e6;
  --danger: var(--color-red);
  --danger-bg: #fdeaea;
  --radius: 12px;
  --radius-sm: 8px;
  --transition: 0.25s ease;

  padding: 24px;
  background: var(--layout-content-bg);
  min-height: 100vh;
  font-family: var(--font-sans);
  color: var(--color-main-text);
}

/* ===== HEADER CARD ===== */
.page-header-card {
  background: var(--color-white);
  border-radius: var(--radius);
  padding: 24px 28px;
  margin-bottom: 24px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--layout-content-border);
  transition: box-shadow var(--transition);
}

.page-header-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.title-icon {
  font-size: 2rem;
  line-height: 1;
  background: var(--primary-light);
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-main-text);
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--color-sub-text);
  margin: 2px 0 0 0;
  font-weight: 400;
}

.header-actions {
  flex-shrink: 0;
}

.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 10px 22px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background var(--transition),
    transform var(--transition),
    box-shadow var(--transition);
  box-shadow: 0 2px 8px rgba(42, 125, 225, 0.3);
  font-family: inherit;
}

.btn-add:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(42, 125, 225, 0.35);
}

.btn-add:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(42, 125, 225, 0.25);
}

.btn-icon {
  font-size: 1.1rem;
  font-weight: 300;
  line-height: 1;
}

/* ===== STATS ROW ===== */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  border-top: 1px solid var(--layout-content-border);
  padding-top: 20px;
}

.stat-item {
  background: var(--color-light-base);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  text-align: center;
  border: 1px solid var(--layout-content-border);
  transition:
    border-color var(--transition),
    background var(--transition);
}

.stat-item:hover {
  border-color: var(--color-outline);
  background: var(--color-white);
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-main-text);
  line-height: 1.2;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-sub-text);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 2px;
}

.stat-aman .stat-value {
  color: var(--color-good-green);
}
.stat-menipis .stat-value {
  color: var(--warning);
}
.stat-habis .stat-value {
  color: var(--color-red);
}

/* ===== GRID WRAPPER - FULL WIDTH ===== */
.grid-wrapper {
  width: 100%;
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--layout-content-border);
  overflow: hidden;
  transition: box-shadow var(--transition);
}

.grid-wrapper:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}


/* ===== STOCK CELL ===== */
.stock-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
  padding: 2px 0;
}

.stock-number {
  font-weight: 600;
  color: var(--color-main-text);
  font-size: 0.95rem;
  min-width: 28px;
  text-align: right;
}

.stock-badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.6;
  white-space: nowrap;
}

.badge-aman {
  background: var(--success-bg);
  color: var(--color-good-green);
}

.badge-menipis {
  background: var(--warning-bg);
  color: var(--warning);
}

.badge-habis {
  background: var(--danger-bg);
  color: var(--color-red);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 992px) {
  .master-barang-page {
    padding: 16px;
  }

  .page-header-card {
    padding: 20px;
  }

  .stats-row {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .stat-item {
    padding: 10px 12px;
  }

  .stat-value {
    font-size: 1.3rem;
  }
}

@media (max-width: 768px) {
  .master-barang-page {
    padding: 12px;
  }

  .page-header-card {
    padding: 16px 18px;
    border-radius: var(--radius-sm);
  }

  .header-top {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 16px;
  }

  .header-title-group {
    gap: 12px;
  }

  .title-icon {
    width: 44px;
    height: 44px;
    font-size: 1.5rem;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .page-subtitle {
    font-size: 0.8rem;
  }

  .header-actions {
    width: 100%;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
    padding: 10px 16px;
    font-size: 0.85rem;
  }

  .stats-row {
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    padding-top: 14px;
  }

  .stat-item {
    padding: 8px 6px;
    border-radius: 6px;
  }

  .stat-value {
    font-size: 1.1rem;
  }

  .stat-label {
    font-size: 0.6rem;
  }

  .grid-wrapper {
    border-radius: var(--radius-sm);
  }

  .stock-cell {
    gap: 6px;
  }

  .stock-number {
    font-size: 0.85rem;
    min-width: 20px;
  }

  .stock-badge {
    font-size: 0.55rem !important;
    padding: 1px 8px !important;
  }
}

@media (max-width: 480px) {
  .master-barang-page {
    padding: 8px;
  }

  .page-header-card {
    padding: 12px 14px;
  }

  .header-title-group {
    gap: 10px;
  }

  .title-icon {
    width: 38px;
    height: 38px;
    font-size: 1.2rem;
  }

  .page-title {
    font-size: 1.1rem;
  }

  .page-subtitle {
    font-size: 0.7rem;
  }

  .btn-add {
    font-size: 0.8rem;
    padding: 8px 12px;
  }

  .stats-row {
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    padding-top: 12px;
  }

  .stat-item {
    padding: 6px 4px;
  }

  .stat-value {
    font-size: 0.95rem;
  }

  .stat-label {
    font-size: 0.5rem;
    letter-spacing: 0.02em;
  }

  .master-barang-page :deep(.dx-datagrid-headers .dx-header-row td) {
    font-size: 0.6rem !important;
    padding: 4px 6px !important;
  }

  .master-barang-page :deep(.dx-datagrid-rowsview .dx-row td) {
    padding: 6px 6px !important;
    font-size: 0.7rem !important;
  }

  .stock-number {
    font-size: 0.75rem;
    min-width: 16px;
  }

  .stock-badge {
    font-size: 0.45rem !important;
    padding: 1px 6px !important;
    letter-spacing: 0.02em;
  }

  .master-barang-page :deep(.dx-datagrid-toolbar) {
    padding: 4px 6px !important;
  }

  .master-barang-page :deep(.dx-toolbar .dx-button) {
    font-size: 0.6rem !important;
    padding: 2px 6px !important;
    min-height: 24px !important;
    min-width: 24px !important;
  }

  .master-barang-page :deep(.dx-toolbar .dx-button .dx-icon) {
    font-size: 0.8rem !important;
  }

  .master-barang-page :deep(.dx-toolbar-item) {
    margin-right: 2px !important;
  }

  .master-barang-page :deep(.dx-datagrid-pager) {
    padding: 4px 6px !important;
  }

  .master-barang-page :deep(.dx-page) {
    font-size: 0.65rem !important;
    padding: 0 6px !important;
    min-width: 22px !important;
    height: 22px !important;
  }

  .master-barang-page :deep(.dx-datagrid-rowsview),
  .master-barang-page :deep(.dx-datagrid-content),
  .master-barang-page :deep(.dx-scrollable-container) {
    touch-action: pan-x pan-y !important;
    -webkit-overflow-scrolling: touch !important;
  }
}
</style>
