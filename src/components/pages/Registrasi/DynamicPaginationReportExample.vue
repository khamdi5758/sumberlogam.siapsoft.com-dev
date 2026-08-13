<template>
  <div class="min-h-screen bg-slate-100 p-6 font-sans">
    <!-- Action Bar -->
    <div class="max-w-4xl mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
      <div>
        <h1 class="text-xl font-bold text-slate-800">Demo Paginasi Dinamis (DOM Measurement)</h1>
        <p class="text-xs text-slate-500">Mencegah overflow footer dengan menghitung tinggi baris secara real-time</p>
      </div>
      <button 
        @click="runPagination" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm active:scale-95"
      >
        Recalculate Pages
      </button>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isCalculating" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center max-w-xs text-center">
        <svg class="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="font-bold text-slate-700">Mengkalkulasi Halaman...</span>
        <span class="text-xs text-slate-400 mt-2">Mengukur tinggi elemen baris pada DOM agar tidak meluap dari batas A4</span>
      </div>
    </div>

    <!-- Pages Container (Print View Simulation) -->
    <div ref="reportContainer" class="flex flex-col gap-8 items-center">
      <!-- Rendering each page sheet -->
      <div 
        v-for="(pageData, pageIdx) in pages" 
        :key="'page-' + pageIdx"
        class="page-sheet w-[210mm] h-[297mm] bg-white p-[20mm] shadow-xl border border-slate-200 flex flex-col justify-between box-border overflow-hidden relative"
      >
        <!-- Content Area -->
        <div>
          <!-- Header Section -->
          <div class="border-b border-slate-300 pb-4 mb-4 flex justify-between items-start">
            <div>
              <h2 class="text-lg font-bold text-slate-900 uppercase">Laporan Pengiriman Barang</h2>
              <p class="text-xs text-slate-500">PT. SUMBER LOGAM SEJAHTERA</p>
            </div>
            <div class="text-right text-xs text-slate-500">
              <p>Tanggal: 13 Agustus 2026</p>
              <p>Nomor: LP-00293/SL/26</p>
            </div>
          </div>

          <!-- Table Container -->
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="border-y border-slate-800 text-slate-950 font-bold bg-slate-50">
                <th class="py-2 px-2 w-[40px] text-center">No</th>
                <th class="py-2 px-2">Nama Barang</th>
                <th class="py-2 px-2 w-[60px] text-center">Qty</th>
                <th class="py-2 px-2 w-[100px] text-right">Harga</th>
                <th class="py-2 px-2 w-[120px] text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <!-- Render real items -->
              <tr 
                v-for="(item, rowIdx) in pageData" 
                :key="'row-' + rowIdx"
                class="border-b border-dashed border-slate-200 hover:bg-slate-50/50"
              >
                <td class="py-2 px-2 text-center text-slate-600 align-top">{{ item.no }}</td>
                <!-- Long wrapping text -->
                <td class="py-2 px-2 font-medium text-slate-800 align-top break-words">{{ item.namaBarang }}</td>
                <td class="py-2 px-2 text-center text-slate-600 align-top">{{ item.qty }}</td>
                <td class="py-2 px-2 text-right text-slate-600 align-top">{{ formatCurrency(item.harga) }}</td>
                <td class="py-2 px-2 text-right font-semibold text-slate-900 align-top">{{ formatCurrency(item.qty * item.harga) }}</td>
              </tr>

              <!-- Fill blank rows to align footer at the bottom if it's the last page -->
              <tr 
                v-for="blankIdx in getBlankRowsCount(pageData, pageIdx)" 
                :key="'blank-' + blankIdx"
                class="border-b border-dashed border-slate-200"
              >
                <td class="py-2 px-2 text-center align-top">&nbsp;</td>
                <td class="py-2 px-2 align-top">&nbsp;</td>
                <td class="py-2 px-2 text-center align-top">&nbsp;</td>
                <td class="py-2 px-2 text-right align-top">&nbsp;</td>
                <td class="py-2 px-2 text-right align-top">&nbsp;</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Section (Fixed Bottom Position) -->
        <div class="border-t border-slate-300 pt-4 mt-4 flex justify-between items-end text-xs text-slate-500">
          <div>
            <p>Dicetak secara otomatis oleh sistem accounting</p>
            <p class="text-[10px] text-slate-400">Verifikasi tanda tangan sah jika dilampirkan stampel asli.</p>
          </div>
          <div>
            <span>Halaman {{ pageIdx + 1 }} dari {{ pages.length }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

// 1. Definisikan interface data barang
interface Item {
  no: number;
  namaBarang: string;
  qty: number;
  harga: number;
}

// 2. Simulasi data mentah (beberapa data sengaja dibuat sangat panjang untuk memicu wrap 2-3 baris)
const rawData = ref<Item[]>([
  { no: 1, namaBarang: 'Besi Beton Polos 6mm SNI', qty: 150, harga: 42000 },
  { no: 2, namaBarang: 'Semen Gresik Portland Composite Cement 50kg (Original Super Quality)', qty: 80, harga: 68000 },
  { no: 3, namaBarang: 'Baja Ringan Truss C75 tebal 0.75mm panjang 6 meter SNI sertifikasi KAN', qty: 200, harga: 95000 },
  { no: 4, namaBarang: 'Kawat Las Nikko Steel RD-260 ukuran 2.6mm dus 5kg', qty: 10, harga: 145000 },
  { no: 5, namaBarang: 'Triplek Semi Meranti UTY tebal 9mm ukuran 122 x 244 cm', qty: 45, harga: 110000 },
  { no: 6, namaBarang: 'Paku Kayu Ukuran 3 inch / 7cm (kemasan box isi 20kg)', qty: 5, harga: 320000 },
  { no: 7, namaBarang: 'Besi Beton Polos 8mm SNI', qty: 100, harga: 61000 },
  { no: 8, namaBarang: 'Pasir Putih Bangka Extra Super Cargo Truck (Kapasitas 8 Kubik Pasir Kasar Pilihan)', qty: 3, harga: 2350000 },
  { no: 9, namaBarang: 'Cat Tembok Dulux Weathershield Exterior Brilliant White 20 Liter Galon Besar', qty: 6, harga: 1850000 },
  { no: 10, namaBarang: 'Besi UNP 100 panjang 6 meter SNI Krakatau Steel original', qty: 25, harga: 345000 },
  { no: 11, namaBarang: 'Pipa PVC Wavin AW 3 inch panjang 4 meter tebal standart abu-abu', qty: 30, harga: 125000 },
  { no: 12, namaBarang: 'Semen Tiga Roda 40kg', qty: 120, harga: 53000 },
  { no: 13, namaBarang: 'Besi Beton Ulir 12mm SNI', qty: 80, height: 138000 } as any, // casting to fit demo
  { no: 14, namaBarang: 'Genteng Keramik Kanmuri Milenio Espanica Natural Terracotta (Dilengkapi Double Interlocking System)', qty: 800, harga: 12500 },
  { no: 15, namaBarang: 'Besi WF 150 Krakatau Steel tebal standar SNI panjang 12 meter original pabrik', qty: 8, harga: 4850000 },
  { no: 16, namaBarang: 'Papan Kayu Borneo tebal 3cm lebar 20cm panjang 4 meter', qty: 50, harga: 75000 },
  { no: 17, namaBarang: 'Kunci Pintu Handle Dekson Stainless Steel SUS 304 anti karat', qty: 12, harga: 450000 },
  { no: 18, namaBarang: 'Keramik Lantai Milan 40x40 Bianco Super White Glossy dus isi 6 keping', qty: 90, harga: 85000 },
  { no: 19, namaBarang: 'Paku Seng Ulir Galvanis 2 inch (kemasan pak isi 100 pcs)', qty: 15, harga: 18000 },
  { no: 20, namaBarang: 'Pipa Galvanis Medium B 2 inch tebal 2.8mm panjang 6 meter bakrie steel', qty: 14, harga: 485000 }
]);

// 3. State reaktif untuk halaman dan loading
const pages = ref<Item[][]>([]);
const isCalculating = ref(false);
const reportContainer = ref<HTMLElement | null>(null);

// Tinggi maksimum printable area di kertas A4 portrait (sekitar 920px untuk border-box)
// Kita gunakan 920px sebagai batas aman sebelum meluap ke bawah kertas
const MAX_CONTENT_HEIGHT = 920; 

// 4. Algoritma Pembagian Halaman Berbasis DOM Measurement
const runPagination = async () => {
  isCalculating.value = true;
  
  // Reset halaman menjadi 1 halaman kosong sebagai inisialisasi awal
  pages.value = [[]];
  await nextTick(); // Tunggu Vue merender halaman kosong di DOM

  // Iterasi baris per baris data
  for (const item of rawData.value) {
    const currentPageIdx = pages.value.length - 1;
    
    // 1. Coba masukkan barang ke halaman aktif saat ini
    pages.value[currentPageIdx].push(item);
    
    // 2. Biarkan Vue merender baris baru tersebut di DOM
    await nextTick();
    
    // 3. Ukur tinggi halaman aktif di DOM
    const pageSheets = reportContainer.value?.querySelectorAll('.page-sheet');
    if (pageSheets && pageSheets[currentPageIdx]) {
      const activeSheet = pageSheets[currentPageIdx] as HTMLElement;
      
      // Ukur tinggi total konten di dalam kertas
      const currentHeight = activeSheet.scrollHeight;
      
      // 4. Jika melebihi batas maksimal tinggi halaman
      if (currentHeight > MAX_CONTENT_HEIGHT) {
        // Batalkan pemasukan baris terakhir dari halaman saat ini
        pages.value[currentPageIdx].pop();
        
        // Pindahkan baris tersebut sebagai baris pertama di halaman baru berikutnya
        pages.value.push([item]);
        
        // Tunggu rendering halaman baru selesai
        await nextTick();
      }
    }
  }

  isCalculating.value = false;
};

// 5. Fungsi untuk mengisi baris kosong (blank rows) agar footer berada rapi di dasar halaman
const getBlankRowsCount = (pageData: Item[], pageIdx: number): number => {
  // Hitung berapa baris ideal yang tersisa untuk halaman terakhir
  // Jika ini bukan halaman terakhir, kita tidak perlu mengisi baris kosong
  if (pageIdx !== pages.value.length - 1) return 0;
  
  const totalRowsOnPage = pageData.length;
  const maxRowsPerNormalPage = 15; // Estimasi baris per halaman
  const remaining = maxRowsPerNormalPage - totalRowsOnPage;
  
  return remaining > 0 ? remaining : 0;
};

// Helper format mata uang rupiah
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

onMounted(() => {
  runPagination();
});
</script>

<style scoped>
/* Simulasi CSS cetak A4 */
.page-sheet {
  /* Memaksa ukuran kertas A4 presisi */
  width: 210mm;
  height: 297mm;
  max-height: 297mm;
}

@media print {
  body {
    background: none;
    padding: 0;
  }
  .page-sheet {
    box-shadow: none;
    border: none;
    margin: 0;
    page-break-after: always;
    break-after: page;
  }
}
</style>
