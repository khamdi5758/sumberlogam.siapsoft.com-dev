<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3 class="chart-title">Komposisi Umur Piutang</h3>
    </div>

    <DxPieChart
      :data-source="chartData"
      type="doughnut"
      :inner-radius="0.6"
      :animation="{ enabled: true }"
      @point-click="onPointClick"
    >
      <DxPieSeries
        argument-field="label"
        value-field="nilai"
      >
        <DxSmallValuesGrouping mode="none" />
        <DxLabel
          :visible="true"
          :customize-text="customizeLabel"
          position="outside"
        >
          <DxConnector :visible="true" :width="1" />
        </DxLabel>
      </DxPieSeries>

      <DxPalette :custom-palette="palette" />

      <DxPieLegend
        :visible="true"
        horizontal-alignment="center"
        vertical-alignment="bottom"
        orientation="horizontal"
        item-text-position="right"
      />

      <DxPieTooltip
        :enabled="true"
        :customize-tooltip="customizeTooltip"
      />

      <DxPieExport :enabled="true" />
    </DxPieChart>

    <!-- Ringkasan nilai per bucket -->
    <div class="bucket-summary">
      <div
        class="bucket-item"
        v-for="(item, i) in chartData"
        :key="item.bucket"
      >
        <span class="bucket-dot" :style="{ background: palette[i] }" />
        <span class="bucket-label">{{ item.label }}</span>
        <span class="bucket-val">{{ formatJuta(item.nilai) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import DxPieChart, {
  DxSeries as DxPieSeries,
  DxLabel,
  DxConnector,
  DxLegend as DxPieLegend,
  DxTooltip as DxPieTooltip,
  DxExport as DxPieExport,
  DxSmallValuesGrouping,
} from 'devextreme-vue/pie-chart'
import { DxPalette } from 'devextreme-vue/chart'
import { formatRupiah, formatJuta } from '@/utils/format'

export default {
  name: 'DonutUmurPiutang',

  components: {
    DxPieChart, DxPieSeries, DxLabel, DxConnector,
    DxPieLegend, DxPieTooltip, DxPieExport,
    DxSmallValuesGrouping, DxPalette,
  },

  props: {
    chartData: { type: Array, default: () => [] },
  },

  emits: ['bucket-click'],

  data() {
    return {
      palette: ['#388e3c', '#f57c00', '#e53935', '#b71c1c'],
    }
  },

  methods: {
    formatJuta,

    customizeLabel(info) {
      const pct = info.percentText
      return `${pct}`
    },

    customizeTooltip(info) {
      return {
        html: `
          <div style="padding:6px 10px;font-size:12px;">
            <strong>${info.argument}</strong><br/>
            <span>${formatRupiah(info.value)}</span><br/>
            <span style="color:#888">${info.percentText}</span>
          </div>
        `,
      }
    },

    onPointClick(e) {
      this.$emit('bucket-click', e.target.argument)
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
  display: flex;
  flex-direction: column;
}
.chart-header { margin-bottom: 10px; }
.chart-title {
  font-size: 14px; font-weight: 600; color: #222; margin: 0;
}
.bucket-summary {
  margin-top: 12px;
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.bucket-item {
  display: flex; align-items: center; gap: 8px; font-size: 12px;
}
.bucket-dot {
  width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0;
}
.bucket-label { flex: 1; color: #555; }
.bucket-val { font-weight: 600; color: #222; }
</style>
