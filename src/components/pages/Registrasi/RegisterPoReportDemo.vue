<template>
  <div style="padding: 20px; background-color: #f3f4f6; min-height: 100vh;">
    <div style="margin-bottom: 20px; text-align: center;">
      <h2 style="font-size: 1.5rem; font-weight: bold; color: #1e293b; margin-bottom: 10px;">
        Register Purchase Order Report Preview (Demo Mode)
      </h2>
      <p style="color: #64748b; font-size: 0.875rem;">
        This page renders <code>RegisterBasePoDev.vue</code> using <code>ReportGridBuilder.vue</code> with mock data to showcase the design.
      </p>
    </div>
    <RegisterBasePoDev :dataSource="mockData" userName="Demo User" />
  </div>
</template>

<script setup>
import RegisterBasePoDev from './RegisterBasePoDev.vue'

const mockData = [
  {
    Id: 1,
    NoBukti: 'PO-2608-001',
    Tanggal: '2026-08-01',
    KodeSupp: 'SPL-001',
    NamaSupp: 'PT Baja Semesta Utama',
    PPN: 'Y',
    KodeBrg: 'BRG-001',
    NamaBrg: 'Besi Beton Polos 10mm x 12m',
    Satuan: 'BATANG',
    Qnt: 100,
    Harga: 85000,
    Diskon: 5000,
    Jumlah: 8000000
  },
  {
    Id: 2,
    NoBukti: 'PO-2608-001',
    Tanggal: '2026-08-01',
    KodeSupp: 'SPL-001',
    NamaSupp: 'PT Baja Semesta Utama',
    PPN: 'Y',
    KodeBrg: 'BRG-002',
    NamaBrg: 'Besi Beton Ulir 12mm x 12m',
    Satuan: 'BATANG',
    Qnt: 50,
    Harga: 120000,
    Diskon: 0,
    Jumlah: 6000000
  },
  {
    Id: 3,
    NoBukti: 'PO-2608-002',
    Tanggal: '2026-08-05',
    KodeSupp: 'SPL-002',
    NamaSupp: 'CV Sinar Jaya Logam',
    PPN: 'N',
    KodeBrg: 'BRG-003',
    NamaBrg: 'Plat Besi Hot Rolled 2.0mm',
    Satuan: 'LEMBAR',
    Qnt: 10,
    Harga: 450000,
    Diskon: 15000,
    Jumlah: 4350000
  },
  {
    Id: 4,
    NoBukti: 'PO-2608-003',
    Tanggal: '2026-08-10',
    KodeSupp: 'SPL-003',
    NamaSupp: 'PT Krakatau Steelindo',
    PPN: 'Y',
    KodeBrg: 'BRG-004',
    NamaBrg: 'Pipa Galvanis 2 Inch Medium A',
    Satuan: 'BATANG',
    Qnt: 30,
    Harga: 230000,
    Diskon: 10000,
    Jumlah: 6600000
  }
]
</script>
