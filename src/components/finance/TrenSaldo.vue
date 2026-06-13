<template>
  <div class="chart-card">
    <div class="chart-head">
      <div>
        <h3 class="chart-title">Tren saldo kas</h3>
        <p class="chart-sub">Bulanan YTD {{ tahun }}</p>
      </div>
      <div class="legend">
        <span class="leg-item"><span class="leg-dot" style="background:#185FA5" />Saldo</span>
        <span class="leg-item"><span class="leg-dot" style="background:#1D9E75;border-radius:50%" />Net CF positif</span>
        <span class="leg-item"><span class="leg-dot" style="background:#E24B4A;border-radius:50%" />Net CF negatif</span>
      </div>
    </div>

    <DxChart :data-source="chartData" :animation="{ enabled: true }">
      <DxCommonSeriesSettings argument-field="label" />

      <DxSeries
        type="bar"
        value-field="net"
        name="Net CF"
        :customize-point="customizeNetBar"
        :corner-radius="3"
      />
      <DxSeries
        type="spline"
        value-field="saldo"
        name="Saldo"
        color="#185FA5"
        :width="2"
        pane="saldo"
      >
        <DxPoint symbol="circle" :size="5" color="#185FA5" />
      </DxSeries>

      <DxPane name="default" :height="120" />
      <DxPane name="saldo"   :height="100" />

      <DxArgumentAxis>
        <DxGrid :visible="false" />
      </DxArgumentAxis>

      <DxValueAxis pane="default">
        <DxLabel :customize-text="fmtAxisJt" />
        <DxGrid :color="'rgba(0,0,0,0.04)'" />
      </DxValueAxis>
      <DxValueAxis pane="saldo" :position="'right'">
        <DxLabel :customize-text="fmtAxisM" />
        <DxGrid :color="'rgba(0,0,0,0.04)'" />
      </DxValueAxis>

      <DxLegend :visible="false" />
      <DxTooltip :enabled="true" :customize-tooltip="fmtTooltip" />
      <DxExport :enabled="true" />
    </DxChart>

    <!-- Saldo awal/akhir -->
    <div class="saldo-row">
      <div class="saldo-box">
        <span class="saldo-lbl">Saldo awal tahun</span>
        <span class="saldo-val">{{ fmtJuta(saldoAwal) }}</span>
      </div>
      <div class="saldo-arrow"><i class="dx-icon-arrowright" aria-hidden="true" /></div>
      <div class="saldo-box green">
        <span class="saldo-lbl">Saldo terakhir</span>
        <span class="saldo-val">{{ fmtJuta(saldoAkhir) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import DxChart, {
  DxSeries, DxCommonSeriesSettings, DxArgumentAxis, DxValueAxis,
  DxLabel, DxGrid, DxPane, DxLegend, DxTooltip, DxExport, DxPoint,
} from 'devextreme-vue/chart'
import { formatJuta } from '@/utils/format'

export default {
  name: 'TrenSaldo',
  components: { DxChart, DxSeries, DxCommonSeriesSettings, DxArgumentAxis, DxValueAxis, DxLabel, DxGrid, DxPane, DxLegend, DxTooltip, DxExport, DxPoint },
  props: {
    chartData: { type: Array,  default: () => [] },
    tahun:     { type: Number, default: () => new Date().getFullYear() },
  },
  computed: {
    saldoAwal()  { return this.chartData[0]?.saldo ?? 0 },
    saldoAkhir() { return this.chartData[this.chartData.length - 1]?.saldo ?? 0 },
  },
  methods: {
    fmtJuta: formatJuta,
    customizeNetBar(pt) {
      return { color: pt.value >= 0 ? '#1D9E75' : '#E24B4A' }
    },
    fmtAxisJt(i) {
      const v = i.value
      if (!v) return '0'
      return (v >= 0 ? '+' : '') + (v / 1_000_000).toFixed(0) + 'jt'
    },
    fmtAxisM(i) {
      const v = i.value
      return v >= 1_000_000_000 ? 'Rp ' + (v / 1_000_000_000).toFixed(1) + 'M'
           : v >= 1_000_000     ? 'Rp ' + (v / 1_000_000).toFixed(0) + 'jt'
           : ''
    },
    fmtTooltip(info) {
      return { html: `<div style="padding:5px 8px;font-size:12px"><b>${info.seriesName}</b><br>${formatJuta(info.value)}</div>` }
    },
  },
}
</script>

<style scoped>
.chart-card { background: #fff; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
.chart-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
.chart-title { font-size: 13px; font-weight: 600; color: #1a1a2e; margin: 0 0 2px; }
.chart-sub { font-size: 11px; color: #888; margin: 0; }
.legend { display: flex; gap: 12px; flex-wrap: wrap; }
.leg-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #666; }
.leg-dot { width: 9px; height: 9px; border-radius: 2px; }
.saldo-row { display: flex; align-items: center; gap: 10px; margin-top: 14px; padding-top: 12px; border-top: 1px solid #f0f0f0; }
.saldo-box { flex: 1; background: #f7f8fa; border-radius: 8px; padding: 10px 14px; }
.saldo-box.green { background: #E1F5EE; }
.saldo-lbl { display: block; font-size: 10px; color: #888; margin-bottom: 4px; }
.saldo-val { font-size: 15px; font-weight: 600; color: #1a1a2e; }
.saldo-arrow { font-size: 18px; color: #bbb; }
</style>
