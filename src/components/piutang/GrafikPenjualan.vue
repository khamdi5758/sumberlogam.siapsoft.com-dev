<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3 class="chart-title">Grafik Penjualan Bulanan</h3>
      <div class="legend">
        <span class="leg-item" v-for="s in series" :key="s.key">
          <span class="leg-dot" :style="{ background: s.color }" />
          {{ s.label }}
        </span>
      </div>
    </div>

    <DxChart
      :data-source="chartData"
      :loading-indicator="{ enabled: true }"
      :animation="{ enabled: true }"
      palette="Soft"
      @initialized="onInit"
    >
      <DxCommonSeriesSettings argument-field="label" type="bar" />

      <DxSeries
        v-for="s in series"
        :key="s.key"
        :value-field="s.key"
        :name="s.label"
        :color="s.color"
      />

      <DxArgumentAxis>
        <DxLabel overlapping-behavior="rotate" :rotation-angle="-30" />
      </DxArgumentAxis>

      <DxValueAxis>
        <DxLabel :customize-text="formatAxisLabel" />
      </DxValueAxis>

      <DxLegend :visible="false" />

      <DxTooltip
        :enabled="true"
        :customize-tooltip="customizeTooltip"
      />

      <DxExport :enabled="true" />
    </DxChart>
  </div>
</template>

<script>
import {
  DxChart,
  DxSeries,
  DxArgumentAxis,
  DxValueAxis,
  DxLabel,
  DxLegend,
  DxTooltip,
  DxExport,
  DxCommonSeriesSettings,
} from 'devextreme-vue/chart'
import { formatRupiah, formatJuta } from '@/utils/format'

export default {
  name: 'GrafikPenjualan',

  components: {
    DxChart, DxSeries, DxArgumentAxis, DxValueAxis,
    DxLabel, DxLegend, DxTooltip, DxExport, DxCommonSeriesSettings,
  },

  props: {
    chartData: { type: Array, default: () => [] },
  },

  data() {
    return {
      series: [
        { key: 'penjualan', label: 'Penjualan', color: '#1976d2' },
        { key: 'piutang',   label: 'Piutang',   color: '#e53935' },
        { key: 'pelunasan', label: 'Pelunasan',  color: '#388e3c' },
      ],
    }
  },

  methods: {
    onInit(e) {
      this.chartInstance = e.component
    },

    formatAxisLabel(info) {
      return formatJuta(info.value)
    },

    customizeTooltip(info) {
      return {
        html: `
          <div style="padding:6px 10px;font-size:12px;">
            <strong>${info.seriesName}</strong><br/>
            <span>${formatRupiah(info.value)}</span>
          </div>
        `,
      }
    },
  },
}
</script>

<style scoped>
.chart-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  height: 100%;
}
.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 8px;
}
.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  margin: 0;
}
.legend {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}
.leg-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #666;
}
.leg-dot {
  width: 10px; height: 10px; border-radius: 2px;
}
</style>
