<template>
  <div class="dashboard-page">

    <!-- Header -->
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Dashboard Piutang</h1>
        <span class="page-sub">{{ periodeLabel }}</span>
      </div>
      <div class="page-header-right">
        <!-- Pilih periode -->
        <DxSelectBox
          :items="daftarBulan"
          display-expr="label"
          value-expr="value"
          v-model:value="filterBulan"
          :width="130"
          @value-changed="loadAll"
        />
        <DxSelectBox
          :items="daftarTahun"
          v-model:value="filterTahun"
          :width="90"
          @value-changed="loadAll"
        />
        <DxButton
          text="Refresh"
          icon="refresh"
          type="default"
          styling-mode="outlined"
          @click="loadAll"
        />
      </div>
    </div>

    <!-- KPI Cards -->
    <KpiCards :data="kpi" :loading="loadingKpi" />

    <!-- Grafik row -->
    <div class="chart-row">
      <div class="chart-col chart-col-wide">
        <GrafikPenjualan :chart-data="grafikData" />
      </div>
      <div class="chart-col chart-col-narrow">
        <DonutUmurPiutang :chart-data="komposisiUmur" @bucket-click="onBucketClick" />
      </div>
    </div>

    <!-- Tabel Umur Piutang -->
    <TabelUmurPiutang :data-source="umurPiutang" />

    <!-- Grid bawah: Jatuh Tempo + Pelunasan -->
    <div class="grid-row">
      <div class="grid-col">
        <NotaJatuhTempo :data-source="jatuhTempo" />
      </div>
      <div class="grid-col">
        <TabelPelunasan :data-source="pelunasan" :total="totalPelunasan" />
      </div>
    </div>

  </div>
</template>

<script>
import DxSelectBox from 'devextreme-vue/select-box'
import DxButton    from 'devextreme-vue/button'

import KpiCards        from '@/components/piutang/KpiCards.vue'
import GrafikPenjualan from '@/components/piutang/GrafikPenjualan.vue'
import DonutUmurPiutang from '@/components/piutang/DonutUmurPiutang.vue'
import TabelUmurPiutang from '@/components/piutang/TabelUmurPiutang.vue'
import NotaJatuhTempo  from '@/components/piutang/NotaJatuhTempo.vue'
import TabelPelunasan  from '@/components/piutang/TabelPelunasan.vue'

import piutangService from '@/services/piutangService'

const BULAN = [
  { value: 1,  label: 'Januari'  },
  { value: 2,  label: 'Februari' },
  { value: 3,  label: 'Maret'    },
  { value: 4,  label: 'April'    },
  { value: 5,  label: 'Mei'      },
  { value: 6,  label: 'Juni'     },
  { value: 7,  label: 'Juli'     },
  { value: 8,  label: 'Agustus'  },
  { value: 9,  label: 'September'},
  { value: 10, label: 'Oktober'  },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
]

export default {
  name: 'PiutangDashboardView',

  components: {
    DxSelectBox, DxButton,
    KpiCards, GrafikPenjualan, DonutUmurPiutang,
    TabelUmurPiutang, NotaJatuhTempo, TabelPelunasan,
  },

  data() {
    const now = new Date()
    return {
      filterBulan: now.getMonth() + 1,
      filterTahun: now.getFullYear(),

      daftarBulan: BULAN,
      daftarTahun: this.buildTahunList(),

      // Data state
      kpi:            {},
      grafikData:     [],
      komposisiUmur:  [],
      umurPiutang:    [],
      jatuhTempo:     [],
      pelunasan:      [],
      totalPelunasan: 0,

      loadingKpi: false,
    }
  },

  computed: {
    periodeLabel() {
      const b = BULAN.find(x => x.value === this.filterBulan)
      return `${b?.label ?? ''} ${this.filterTahun}`
    },
  },

  mounted() {
    this.loadAll()
  },

  methods: {
    buildTahunList() {
      const y = new Date().getFullYear()
      return [y - 2, y - 1, y, y + 1]
    },

    async loadAll() {
      const b = this.filterBulan
      const t = this.filterTahun
      await Promise.all([
        this.loadKpi(b, t),
        this.loadGrafik(b, t),
        this.loadKomposisi(),
        this.loadUmurPiutang(),
        this.loadJatuhTempo(),
        this.loadPelunasan(b, t),
      ])
    },

    async loadKpi(bulan, tahun) {
      try {
        this.loadingKpi = true
        const { data } = await piutangService.getKpi(bulan, tahun)
        this.kpi = data
      } catch (e) {
        console.error('loadKpi', e)
      } finally {
        this.loadingKpi = false
      }
    },

    async loadGrafik(bulan, tahun) {
      try {
        const { data } = await piutangService.getGrafikPenjualan(bulan, tahun)
        this.grafikData = data
      } catch (e) { console.error('loadGrafik', e) }
    },

    async loadKomposisi() {
      try {
        const { data } = await piutangService.getKomposisiUmur()
        this.komposisiUmur = data
      } catch (e) { console.error('loadKomposisi', e) }
    },

    async loadUmurPiutang() {
      try {
        const { data } = await piutangService.getTabelUmurPiutang()
        this.umurPiutang = data.data
      } catch (e) { console.error('loadUmurPiutang', e) }
    },

    async loadJatuhTempo() {
      try {
        const { data } = await piutangService.getNotaJatuhTempo()
        this.jatuhTempo = data.data
      } catch (e) { console.error('loadJatuhTempo', e) }
    },

    async loadPelunasan(bulan, tahun) {
      try {
        const { data } = await piutangService.getPelunasan(bulan, tahun)
        this.pelunasan     = data.data
        this.totalPelunasan = data.total
      } catch (e) { console.error('loadPelunasan', e) }
    },

    onBucketClick(label) {
      // filter tabel umur piutang berdasarkan bucket yang di-klik
      console.log('Filter bucket:', label)
    },
  },
}
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
  background: #f5f6fa;
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
  flex-wrap: wrap;
  gap: 12px;
}
.page-title {
  font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 0;
}
.page-sub {
  font-size: 13px; color: #888; margin-top: 2px; display: block;
}
.page-header-right {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}

/* Grafik row */
.chart-row {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 16px;
  margin-bottom: 20px;
}
.chart-col { min-height: 320px; }

/* Grid bawah */
.grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 20px;
}

@media (max-width: 1100px) {
  .chart-row { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .grid-row { grid-template-columns: 1fr; }
  .dashboard-page { padding: 14px; }
}
</style>
