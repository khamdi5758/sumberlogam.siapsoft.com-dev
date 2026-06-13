// src/services/financeService.js
import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://mhjcrmapi.siapsoft.com/web/api',
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

http.interceptors.response.use(
  res => res,
  err => {
    console.error('[FinanceAPI]', err.response?.data?.message || err.message)
    return Promise.reject(err)
  }
)

export const financeService = {
  getKpi(kuartal, tahun)              { return http.get('/finance/kpi',               { params: { kuartal, tahun } }) },
  getGrafikBulanan(kuartal, tahun)    { return http.get('/finance/grafik-bulanan',    { params: { kuartal, tahun } }) },
  getDistribusiBiaya(kuartal, tahun)  { return http.get('/finance/distribusi-biaya',  { params: { kuartal, tahun } }) },
  getArusKas(kuartal, tahun)          { return http.get('/finance/arus-kas',          { params: { kuartal, tahun } }) },
  getTrenSaldo(tahun)                 { return http.get('/finance/tren-saldo',        { params: { tahun } }) },
  getTransaksiTerbaru(kuartal, tahun) { return http.get('/finance/transaksi-terbaru', { params: { kuartal, tahun } }) },
  getRingkasanBulanan(kuartal, tahun) { return http.get('/finance/ringkasan-bulanan', { params: { kuartal, tahun } }) },
}

export default financeService
