<template>
  <div class="kpi-grid">
    <div v-for="card in cards" :key="card.key" class="kpi-card" :class="card.variant">
      <div class="kpi-top">
        <span class="kpi-label">{{ card.label }}</span>
        <div class="kpi-icon" :style="card.iconStyle">
          <i :class="['dx-icon-' + card.icon]" aria-hidden="true" />
        </div>
      </div>
      <div class="kpi-value">{{ card.value }}</div>
      <div class="kpi-delta" :class="card.deltaClass">
        <i :class="card.deltaIcon" style="font-size:10px" aria-hidden="true" />
        {{ card.delta }}
      </div>
    </div>
  </div>
</template>

<script>
import { formatJuta, formatPersen } from '@/utils/format'

export default {
  name: 'KpiCards',
  props: {
    data: { type: Object, default: () => ({}) },
  },
  computed: {
    cards() {
      const d = this.data
      return [
        {
          key: 'revenue', label: 'Total Revenue', variant: 'blue',
          value: formatJuta(d.revenue),
          delta: formatPersen(d.pct_revenue) + ' vs periode lalu',
          deltaClass: d.pct_revenue >= 0 ? 'up' : 'dn',
          deltaIcon: d.pct_revenue >= 0 ? 'dx-icon-arrowup' : 'dx-icon-arrowdown',
          icon: 'chart', iconStyle: 'background:#E6F1FB;color:#185FA5',
        },
        {
          key: 'expense', label: 'Total Expense', variant: 'red',
          value: formatJuta(d.expense),
          delta: formatPersen(d.pct_expense) + ' vs periode lalu',
          deltaClass: d.pct_expense <= 0 ? 'up' : 'dn',
          deltaIcon: d.pct_expense >= 0 ? 'dx-icon-arrowup' : 'dx-icon-arrowdown',
          icon: 'money', iconStyle: 'background:#FCEBEB;color:#A32D2D',
        },
        {
          key: 'profit', label: 'Net Profit',  variant: 'green',
          value: formatJuta(d.profit),
          delta: formatPersen(d.pct_profit) + ' · margin ' + (d.margin ?? 0) + '%',
          deltaClass: d.pct_profit >= 0 ? 'up' : 'dn',
          deltaIcon: d.pct_profit >= 0 ? 'dx-icon-arrowup' : 'dx-icon-arrowdown',
          icon: 'check', iconStyle: 'background:#E1F5EE;color:#0F6E56',
        },
        {
          key: 'cf', label: 'Net Cash Flow', variant: 'amber',
          value: formatJuta(d.net_cf),
          delta: formatPersen(d.pct_cf) + ' vs periode lalu',
          deltaClass: d.pct_cf >= 0 ? 'up' : 'dn',
          deltaIcon: d.pct_cf >= 0 ? 'dx-icon-arrowup' : 'dx-icon-arrowdown',
          icon: 'refresh', iconStyle: 'background:#FAEEDA;color:#854F0B',
        },
      ]
    },
  },
}
</script>

<style scoped>
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
@media (max-width: 900px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
.kpi-card { background: #fff; border-radius: 10px; padding: 16px 18px; box-shadow: 0 1px 4px rgba(0,0,0,.05); border-left: 3px solid transparent; }
.kpi-card.blue  { border-left-color: #185FA5; }
.kpi-card.red   { border-left-color: #E24B4A; }
.kpi-card.green { border-left-color: #1D9E75; }
.kpi-card.amber { border-left-color: #EF9F27; }
.kpi-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.kpi-label { font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: #888; font-weight: 500; }
.kpi-icon { width: 30px; height: 30px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 15px; }
.kpi-value { font-size: 20px; font-weight: 600; color: #1a1a2e; margin-bottom: 5px; }
.kpi-delta { font-size: 11px; display: flex; align-items: center; gap: 3px; }
.up { color: #0F6E56; } .dn { color: #A32D2D; }
</style>
