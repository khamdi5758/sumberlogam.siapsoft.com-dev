// src/services/piutangService.js
// Service layer untuk semua endpoint dashboardpiutang piutang

import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://mhjcrmapi.siapsoft.com/web/api',
  withCredentials: true,
  headers: { 'Accept': 'application/json' },
})

// Interceptor: tampilkan error global
http.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.message || err.message
    console.error('[API Error]', msg)
    return Promise.reject(err)
  }
)

export const piutangService = {
  /**
   * KPI ringkasan (total penjualan, piutang beredar, jatuh tempo, pelunasan)
   * @param {number} bulan
   * @param {number} tahun
   */
  getKpi(bulan, tahun) {
    return http.get('/dashboardpiutang/kpi', { params: { bulan, tahun } })
  },

  /**
   * Data grafik penjualan 6 bulan
   * @param {number} bulan
   * @param {number} tahun
   */
  getGrafikPenjualan(bulan, tahun) {
    return http.get('/dashboardpiutang/grafik-penjualan', { params: { bulan, tahun } })
  },

  /**
   * Komposisi umur piutang (donut chart)
   */
  getKomposisiUmur() {
    return http.get('/dashboardpiutang/komposisi-umur')
  },

  /**
   * Tabel umur piutang per pelanggan
   */
  getTabelUmurPiutang() {
    return http.get('/dashboardpiutang/umur-piutang')
  },

  /**
   * Nota yang sudah jatuh tempo
   */
  getNotaJatuhTempo() {
    return http.get('/dashboardpiutang/jatuh-tempo')
  },

  /**
   * Pelunasan periode
   * @param {number} bulan
   * @param {number} tahun
   */
  getPelunasan(bulan, tahun) {
    return http.get('/dashboardpiutang/pelunasan', { params: { bulan, tahun } })
  },
}

export default piutangService
