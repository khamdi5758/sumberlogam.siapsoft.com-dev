<template>
  <div class="kpi-grid">
    <div
      v-for="card in cards"
      :key="card.key"
      class="kpi-card"
      :class="card.variant"
    >
      <div class="kpi-icon">
        <i :class="card.icon" aria-hidden="true" />
      </div>
      <div class="kpi-body">
        <span class="kpi-label">{{ card.label }}</span>
        <span class="kpi-value">{{ card.value }}</span>
        <span class="kpi-sub" v-if="card.sub">{{ card.sub }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { formatRupiah } from '@/utils/format'

export default {
  name: 'KpiCards',

  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    cards() {
      const d = this.data
      return [
        {
          key: 'penjualan',
          label: 'Total Penjualan',
          value: formatRupiah(d.total_penjualan),
          sub: d.pct_penjualan != null
            ? `${d.pct_penjualan > 0 ? '↑' : '↓'} ${Math.abs(d.pct_penjualan)}% vs bulan lalu`
            : '',
          icon: 'dx-icon-money',
          variant: 'primary',
        },
        {
          key: 'piutang',
          label: 'Piutang Beredar',
          value: formatRupiah(d.piutang_beredar),
          sub: `${d.jumlah_nota_aktif ?? 0} nota aktif`,
          icon: 'dx-icon-doc',
          variant: 'danger',
        },
        {
          key: 'jatuh_tempo',
          label: 'Jatuh Tempo',
          value: formatRupiah(d.nilai_jatuh_tempo),
          sub: `${d.jumlah_jatuh_tempo ?? 0} nota melewati jatuh tempo`,
          icon: 'dx-icon-warning',
          variant: 'warning',
        },
        {
          key: 'pelunasan',
          label: 'Pelunasan Periode',
          value: formatRupiah(d.total_pelunasan),
          sub: `${d.jumlah_nota_lunas ?? 0} nota lunas`,
          icon: 'dx-icon-check',
          variant: 'success',
        },
      ]
    },
  },
}
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

@media (max-width: 900px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 500px) {
  .kpi-grid { grid-template-columns: 1fr; }
}

.kpi-card {
  background: #fff;
  border-radius: 10px;
  padding: 18px 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  border-left: 4px solid transparent;
}

.kpi-card.primary { border-left-color: #1976d2; }
.kpi-card.danger  { border-left-color: #e53935; }
.kpi-card.warning { border-left-color: #f57c00; }
.kpi-card.success { border-left-color: #388e3c; }

.kpi-icon {
  width: 40px; height: 40px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}
.primary .kpi-icon { background: #e3f2fd; color: #1976d2; }
.danger  .kpi-icon { background: #ffebee; color: #e53935; }
.warning .kpi-icon { background: #fff3e0; color: #f57c00; }
.success .kpi-icon { background: #e8f5e9; color: #388e3c; }

.kpi-body {
  display: flex; flex-direction: column; gap: 2px;
}
.kpi-label {
  font-size: 11px; text-transform: uppercase;
  letter-spacing: .05em; color: #888; font-weight: 500;
}
.kpi-value {
  font-size: 20px; font-weight: 600; color: #222; line-height: 1.2;
}
.kpi-sub {
  font-size: 11px; color: #888; margin-top: 2px;
}
</style>
