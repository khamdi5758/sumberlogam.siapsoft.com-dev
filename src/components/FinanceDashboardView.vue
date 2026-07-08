<template>
  <div class="page">

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="brand-icon"><i class="dx-icon-chart" aria-hidden="true" /></div>
        <div>
          <h1 class="page-title">Finance Dashboard</h1>
          <p class="page-sub">PT Artha Nusantara · {{ periodeLabel }}</p>
        </div>
      </div>
      <div class="header-right">
        <DxSelectBox
          :items="daftarKuartal"
          display-expr="label"
          value-expr="value"
          v-model:value="filterKuartal"
          :width="90"
          @value-changed="loadAll"
        />
        <DxSelectBox
          :items="daftarTahun"
          v-model:value="filterTahun"
          :width="80"
          @value-changed="loadAll"
        />
        <DxButton
          text="Refresh"
          icon="refresh"
          type="default"
          styling-mode="outlined"
          @click="loadAll"
        />
        <DxButton
          text="Ekspor"
          icon="download"
          type="normal"
          styling-mode="outlined"
        />
      </div>
    </div>

    <!-- KPI -->
    <KpiCards :data="kpi" />

    <!-- Grafik + Donut -->
    <div class="row-grafik">
      <div class="col-wide">
        <GrafikBulanan :chart-data="grafikBulanan" :periode-label="periodeLabel" />
      </div>
      <div class="col-narrow">
        <DonutBiaya :chart-data="distribusiBiaya" />
      </div>
    </div>

    <!-- Divider seksi arus kas -->
    <div class="section-divider">
      <i class="dx-icon-money" aria-hidden="true" style="font-size:16px;color:#185FA5" />
      <span>Laporan arus kas langsung · {{ periodeLabel }}</span>
    </div>

    <!-- Arus Kas Langsung -->
    <ArusKasLangsung
      :arus-kas="arusKas"
      :transaksi="transaksi"
      :kuartal="filterKuartal"
    />

    <!-- Tren Saldo -->
    <div class="row-tren">
      <TrenSaldo :chart-data="trenSaldo" :tahun="filterTahun" />
    </div>

    <!-- Loading overlay -->
    <DxLoadPanel
      :visible="loading"
      :show-indicator="true"
      :show-pane="true"
      message="Memuat data..."
    />

  </div>
</template>

<script>
import DxSelectBox from 'devextreme-vue/select-box'
import DxButton    from 'devextreme-vue/button'
import { DxLoadPanel } from 'devextreme-vue/load-panel'

import KpiCards       from '@/components/finance/KpiCards.vue'
import GrafikBulanan  from '@/components/finance/GrafikBulanan.vue'
import DonutBiaya     from '@/components/finance/DonutBiaya.vue'
import ArusKasLangsung from '@/components/finance/ArusKasLangsung.vue'
import TrenSaldo      from '@/components/finance/TrenSaldo.vue'

import financeService from '@/services/financeService'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'FinanceDashboardView',

  components: {
    DxSelectBox, DxButton, DxLoadPanel,
    KpiCards, GrafikBulanan, DonutBiaya, ArusKasLangsung, TrenSaldo,
  },

  data() {
    const now = new Date()
    const kuartalSaatIni = Math.ceil((now.getMonth() + 1) / 3)
    return {
      filterKuartal: kuartalSaatIni,
      filterTahun:   now.getFullYear(),
      daftarKuartal: [
        { value: 1, label: 'Q1' },
        { value: 2, label: 'Q2' },
        { value: 3, label: 'Q3' },
        { value: 4, label: 'Q4' },
      ],
      daftarTahun: [2023, 2024, 2025, 2026],

      loading:        false,
    }
  },

  computed: {
    ...mapGetters("finance", [
      "getKpi",
      "getGrafikBulanan",
      "getDistribusiBiaya",
      "getArusKas",
      "getTrenSaldo",
      "getTransaksiTerbaru",
    ]),
    kpi() { return this.getKpi || {}; },
    grafikBulanan() { return this.getGrafikBulanan || []; },
    distribusiBiaya() { return this.getDistribusiBiaya || []; },
    arusKas() { return this.getArusKas || {}; },
    trenSaldo() { return this.getTrenSaldo || []; },
    transaksi() { return this.getTransaksiTerbaru?.data || this.getTransaksiTerbaru || []; },

    periodeLabel() {
      const map = { 1: 'Jan–Mar', 2: 'Apr–Jun', 3: 'Jul–Sep', 4: 'Okt–Des' }
      return `Q${this.filterKuartal} · ${map[this.filterKuartal]} ${this.filterTahun}`
    },
  },

  mounted() {
    this.loadAll()
  },

  methods: {
    // ...mapActions('finance', ['actFetchfinancedashAll']),
    ...mapActions({"actFetchfinancedashAll": "finance/actFetchfinancedashAll"}),


    async loadAll() {
      this.loading = true
      try {
        await this.actFetchfinancedashAll({
          kuartal: this.filterKuartal,
          tahun: this.filterTahun,
        })
      } finally {
        this.loading = false
      }
    },

  },
}
</script>

<style scoped>
.page {
  padding: 24px;
  background: #f5f6fa;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, sans-serif;
  position: relative;
}

.page-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 22px; flex-wrap: wrap; gap: 12px;
}
.header-left  { display: flex; align-items: center; gap: 12px; }
.brand-icon {
  width: 40px; height: 40px; background: #185FA5; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px;
}
.page-title { font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 0 0 2px; }
.page-sub   { font-size: 12px; color: #888; margin: 0; }
.header-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.row-grafik {
  display: grid; grid-template-columns: 1fr 280px; gap: 14px; margin-bottom: 20px;
}
.section-divider {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em;
  color: #888; margin-bottom: 14px; padding-bottom: 10px;
  border-bottom: 0.5px dashed #ddd;
}
.row-tren { margin-top: 16px; }

@media (max-width: 1100px) {
  .row-grafik { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .page { padding: 14px; }
}
</style>
