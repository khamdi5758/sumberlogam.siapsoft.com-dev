<template>
  <div class="chart-card">
    <div class="chart-head">
      <div>
        <h3 class="chart-title">Revenue vs Expense vs Profit</h3>
        <p class="chart-sub">Bulanan dalam periode {{ periodeLabel }}</p>
      </div>
      <div class="legend">
        <span v-for="s in series" :key="s.key" class="leg-item">
          <span class="leg-dot" :style="{ background: s.color, borderRadius: s.round ? '50%' : '2px' }" />
          {{ s.label }}
        </span>
      </div>
    </div>

    <DxChart
      :data-source="chartData"
      :animation="{ enabled: true, duration: 600 }"
      @initialized="e => chartInst = e.component"
    >
      <DxCommonSeriesSettings argument-field="label" />

      <DxSeries type="bar"  value-field="revenue"  name="Revenue" color="#185FA5" :corner-radius="4" />
      <DxSeries type="bar"  value-field="expense"  name="Expense" color="#E24B4A" :corner-radius="4" />
      <DxSeries type="spline" value-field="profit" name="Profit"  color="#1D9E75" :width="2">
        <DxPoint symbol="circle" :size="6" color="#1D9E75" />
      </DxSeries>

      <DxArgumentAxis>
        <DxLabel :overlapping-behavior="'none'" />
        <DxGrid :visible="false" />
      </DxArgumentAxis>

      <DxValueAxis>
        <DxLabel :customize-text="fmtAxis" />
        <DxGrid :color="'rgba(0,0,0,0.05)'" />
      </DxValueAxis>

      <DxLegend :visible="false" />

      <DxTooltip :enabled="true" :customize-tooltip="fmtTooltip" />
      <DxExport :enabled="true" />
      <DxLoadingIndicator :enabled="true" />
    </DxChart>
  </div>
</template>

<script>
import DxChart, {
  DxSeries, DxCommonSeriesSettings, DxArgumentAxis, DxValueAxis,
  DxLabel, DxGrid, DxLegend, DxTooltip, DxExport, DxLoadingIndicator, DxPoint,
} from 'devextreme-vue/chart'
import { formatJuta } from '@/utils/format'

export default {
  name: 'GrafikBulanan',
  components: { DxChart, DxSeries, DxCommonSeriesSettings, DxArgumentAxis, DxValueAxis, DxLabel, DxGrid, DxLegend, DxTooltip, DxExport, DxLoadingIndicator, DxPoint },
  props: {
    chartData:   { type: Array,  default: () => [] },
    periodeLabel:{ type: String, default: '' },
  },
  data() {
    return {
      chartInst: null,
      series: [
        { key: 'revenue', label: 'Revenue', color: '#185FA5', round: false },
        { key: 'expense', label: 'Expense', color: '#E24B4A', round: false },
        { key: 'profit',  label: 'Profit',  color: '#1D9E75', round: true  },
      ],
    }
  },
  methods: {
    fmtAxis(info) {
      const v = info.value
      if (v >= 1_000_000_000) return 'Rp ' + (v / 1_000_000_000).toFixed(1) + 'M'
      if (v >= 1_000_000)     return 'Rp ' + (v / 1_000_000).toFixed(0) + 'jt'
      return ''
    },
    fmtTooltip(info) {
      return { html: `<div style="padding:5px 8px;font-size:12px"><strong>${info.seriesName}</strong><br>${formatJuta(info.value)}</div>` }
    },
  },
}
</script>

<style scoped>
.chart-card { background: #fff; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
.chart-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; flex-wrap: wrap; gap: 8px; }
.chart-title { font-size: 13px; font-weight: 600; color: #1a1a2e; margin: 0 0 2px; }
.chart-sub { font-size: 11px; color: #888; margin: 0; }
.legend { display: flex; gap: 12px; flex-wrap: wrap; }
.leg-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #666; }
.leg-dot { width: 9px; height: 9px; }
</style>
