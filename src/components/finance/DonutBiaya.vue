<template>
  <div class="chart-card">
    <h3 class="chart-title">Distribusi biaya</h3>

    <DxPieChart
      :data-source="chartData"
      type="doughnut"
      :inner-radius="0.62"
      :animation="{ enabled: true }"
    >
      <DxPieSeries argument-field="label" value-field="nilai">
        <DxPieLabel :visible="false" />
      </DxPieSeries>

      <DxPieLegend :visible="false" />

      <DxPieTooltip :enabled="true" :customize-tooltip="fmtTooltip" />
    </DxPieChart>

    <div class="donut-legend">
      <div v-for="(item, i) in chartData" :key="item.label" class="dl-row">
        <div class="dl-left">
          <span class="dl-dot" :style="{ background: palette[i % palette.length] }" />
          <span class="dl-label">{{ item.label }}</span>
        </div>
        <span class="dl-pct">{{ item.persen }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
import DxPieChart, {
  DxSeries as DxPieSeries,
  DxLabel as DxPieLabel,
  DxLegend as DxPieLegend,
  DxTooltip as DxPieTooltip,
} from 'devextreme-vue/pie-chart'
import { formatJuta } from '@/utils/format'

export default {
  name: 'DonutBiaya',
  components: { DxPieChart, DxPieSeries, DxPieLabel, DxPieLegend, DxPieTooltip },
  props: {
    chartData: { type: Array, default: () => [] },
  },
  data() {
    return {
      palette: ['#185FA5', '#1D9E75', '#EF9F27', '#B4B2A9', '#E24B4A'],
    }
  },
  methods: {
    fmtTooltip(info) {
      return { html: `<div style="padding:5px 8px;font-size:12px"><b>${info.argument}</b><br>${formatJuta(info.value)}<br>${info.percentText}</div>` }
    },
  },
}
</script>

<style scoped>
.chart-card { background: #fff; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
.chart-title { font-size: 13px; font-weight: 600; color: #1a1a2e; margin: 0 0 12px; }
.donut-legend { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.dl-row { display: flex; align-items: center; justify-content: space-between; }
.dl-left { display: flex; align-items: center; gap: 7px; }
.dl-dot { width: 8px; height: 8px; border-radius: 2px; }
.dl-label { font-size: 11px; color: #555; }
.dl-pct { font-size: 11px; font-weight: 600; color: #1a1a2e; }
</style>
