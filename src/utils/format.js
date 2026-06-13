// src/utils/format.js
const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

export const formatRupiah = v => (v == null ? 'Rp 0' : idr.format(v))
export const formatAngka  = v => (v == null ? '0'    : num.format(v))
export const formatJuta   = v => {
  if (v == null) return '0'
  const a = Math.abs(v)
  const s = v < 0 ? '-' : ''
  if (a >= 1_000_000_000) return s + 'Rp ' + (a / 1_000_000_000).toFixed(2) + ' M'
  if (a >= 1_000_000)     return s + 'Rp ' + (a / 1_000_000).toFixed(0) + ' jt'
  return s + 'Rp ' + num.format(a)
}
export const formatPersen = v => (v == null ? '0%' : (v > 0 ? '+' : '') + v.toFixed(1) + '%')

export const BULAN_NAMA = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']
