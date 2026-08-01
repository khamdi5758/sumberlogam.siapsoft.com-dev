<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    @click.self="close"
  >
    <section
      class="w-full max-w-[380px] rounded-xl bg-white p-5 shadow-2xl"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between border-b border-slate-200 pb-3"
      >
        <h1
          class="text-[18px] font-semibold text-slate-900"
        >
          {{ title }}
        </h1>
        <button
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Tutup"
          @click="close"
        >
          <X :size="16" />
        </button>
      </div>

      <!-- Form -->
      <div class="pt-4">
        <div class="space-y-4">
          <!-- Mulai Tanggal / Dari Tanggal (Hanya jika bukan Mutasi, Biaya, Aktiva Tetap, Laba Rugi, Neraca Lajur, atau Neraca) -->
          <div v-if="type !== 'mutasi' && type !== 'biaya' && type !== 'aktivatetap' && type !== 'labarugi' && type !== 'neracalajur' && type !== 'neraca'" class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
            <label class="text-[14px] text-slate-700">
              {{ type === 'neraca' ? 'Dari Tanggal' : 'Mulai Tanggal' }}
            </label>
            <DxDateBox
              v-model:value="startDate"
              type="date"
              display-format="dd-MM-yyyy"
              :use-mask-behavior="true"
              styling-mode="outlined"
            />
          </div>

          <!-- Sampai Tanggal / S/d Tanggal (Hanya jika bukan Mutasi, Biaya, Aktiva Tetap, Laba Rugi, Neraca Lajur, atau Neraca) -->
          <div v-if="type !== 'mutasi' && type !== 'biaya' && type !== 'aktivatetap' && type !== 'labarugi' && type !== 'neracalajur' && type !== 'neraca'" class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
            <label class="text-[14px] text-slate-700">
              {{ type === 'neraca' ? 'S/d Tanggal' : 'Sampai Tanggal' }}
            </label>
            <DxDateBox
              v-model:value="endDate"
              type="date"
              display-format="dd-MM-yyyy"
              :use-mask-behavior="true"
              styling-mode="outlined"
            />
          </div>

          <!-- Kondisi Type: Jurnal -->
          <template v-if="type === 'jurnal'">
            <!-- Jenis Transaksi -->
            <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
              <label class="text-[14px] text-slate-700">Jenis Transaksi</label>
              <DxSelectBox
                v-model:value="selectedType"
                :data-source="transactionTypes"
                display-expr="name"
                value-expr="id"
                placeholder="Pilih Transaksi..."
                :show-clear-button="true"
                :search-enabled="true"
                styling-mode="outlined"
              />
            </div>
          </template>

          <!-- Kondisi Type: Buku Besar (Buku Tambahan) -->
          <template v-else-if="type === 'bukubesar'">
            <!-- Dari Perkiraan -->
            <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
              <label class="text-[14px] text-slate-700">Dari Perkiraan</label>
              <div class="relative flex items-center">
                <input
                  v-model="dariPerkiraan"
                  type="text"
                  class="w-full pr-10 pl-3 py-1.5 border border-slate-300 rounded-md text-[14px] outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  class="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-slate-500 hover:text-slate-800 border-l border-slate-300 bg-slate-50 rounded-r-md hover:bg-slate-100 transition"
                  @click="handleBrowsePerkiraan('dari')"
                >
                  <MoreHorizontal :size="16" />
                </button>
              </div>
            </div>

            <!-- S/d Perkiraan -->
            <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
              <label class="text-[14px] text-slate-700">S/d Perkiraan</label>
              <div class="relative flex items-center">
                <input
                  v-model="sdPerkiraan"
                  type="text"
                  class="w-full pr-10 pl-3 py-1.5 border border-slate-300 rounded-md text-[14px] outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  class="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-slate-500 hover:text-slate-800 border-l border-slate-300 bg-slate-50 rounded-r-md hover:bg-slate-100 transition"
                  @click="handleBrowsePerkiraan('sd')"
                >
                  <MoreHorizontal :size="16" />
                </button>
              </div>
            </div>

            <!-- Jurnal Penutup Option -->
            <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
              <label class="text-[14px] text-slate-700">Jurnal Penutup</label>
              <DxSelectBox
                v-model:value="jurnalPenutup"
                :data-source="jurnalPenutupOptions"
                styling-mode="outlined"
              />
            </div>

            <!-- Valas -->
            <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
              <div></div>
              <label class="flex items-center gap-2 text-[14px] text-slate-700 cursor-pointer">
                <input
                  v-model="valas"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Valas
              </label>
            </div>

            <!-- Detail / Rekap Option -->
            <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
              <label class="text-[14px] text-slate-700">Format</label>
              <DxSelectBox
                v-model:value="formatOption"
                :data-source="formatOptions"
                styling-mode="outlined"
              />
            </div>
          </template>

          <!-- Kondisi Type: Mutasi, Aktiva Tetap, Laba Rugi, Neraca Lajur, atau Neraca -->
          <template v-else-if="type === 'mutasi' || type === 'aktivatetap' || type === 'labarugi' || type === 'neracalajur' || type === 'neraca'">
            <!-- Periode -->
            <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
              <label class="text-[14px] text-slate-700">Periode :</label>
              <div class="flex gap-2">
                <input
                  v-model.number="selectedMonth"
                  type="number"
                  min="1"
                  max="12"
                  class="w-[60px] px-2 py-1.5 border border-slate-300 rounded-md text-[14px] text-center outline-none focus:border-blue-500"
                />
                <input
                  v-model.number="selectedYear"
                  type="number"
                  min="2000"
                  max="2100"
                  class="w-[100px] px-2 py-1.5 border border-slate-300 rounded-md text-[14px] text-center outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </template>

          <!-- Kondisi Type: Biaya -->
          <template v-else-if="type === 'biaya'">
            <!-- Periode -->
            <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
              <label class="text-[14px] text-slate-700">Periode :</label>
              <div class="flex gap-2">
                <input
                  v-model.number="selectedMonth"
                  type="number"
                  min="1"
                  max="12"
                  class="w-[60px] px-2 py-1.5 border border-slate-300 rounded-md text-[14px] text-center outline-none focus:border-blue-500"
                />
                <input
                  v-model.number="selectedYear"
                  type="number"
                  min="2000"
                  max="2100"
                  class="w-[100px] px-2 py-1.5 border border-slate-300 rounded-md text-[14px] text-center outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Dari Perkiraan -->
            <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
              <label class="text-[14px] text-slate-700">Dari Perkiraan</label>
              <div class="relative flex items-center">
                <input
                  v-model="dariPerkiraan"
                  type="text"
                  class="w-full pr-10 pl-3 py-1.5 border border-slate-300 rounded-md text-[14px] outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  class="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-slate-500 hover:text-slate-800 border-l border-slate-300 bg-slate-50 rounded-r-md hover:bg-slate-100 transition"
                  @click="handleBrowsePerkiraan('dari')"
                >
                  <MoreHorizontal :size="16" />
                </button>
              </div>
            </div>

            <!-- S/d Perkiraan -->
            <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
              <label class="text-[14px] text-slate-700">S/d Perkiraan</label>
              <div class="relative flex items-center">
                <input
                  v-model="sdPerkiraan"
                  type="text"
                  class="w-full pr-10 pl-3 py-1.5 border border-slate-300 rounded-md text-[14px] outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  class="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-slate-500 hover:text-slate-800 border-l border-slate-300 bg-slate-50 rounded-r-md hover:bg-slate-100 transition"
                  @click="handleBrowsePerkiraan('sd')"
                >
                  <MoreHorizontal :size="16" />
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Tombol -->
      <div class="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          class="min-w-[80px] rounded-lg bg-[#e12b2b] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#c61f1f] active:translate-y-px"
          @click="close"
        >
          Batal
        </button>
        <button
          type="button"
          class="min-w-[80px] rounded-lg bg-[#0f3d7a] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0b2f5f] active:translate-y-px"
          @click="applyFilter"
        >
          {{ submitButtonText }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { X, MoreHorizontal } from "lucide-vue-next";
import { DxDateBox } from "devextreme-vue/date-box";
import { DxSelectBox } from "devextreme-vue/select-box";
import api from "@/api";
import FormBrowseDialog from "@/components/widgets/FormBrowseDialog.vue";

const props = defineProps({
  title: {
    type: String,
    default: "Filter Laporan",
  },
  submitButtonText: {
    type: String,
    default: "Terapkan Filter",
  },
  type: {
    type: String,
    default: "jurnal",
  },
});

const emit = defineEmits(["on-filter-apply"]);

const visible = ref(false);
const startDate = ref(new Date());
const endDate = ref(new Date());

// For 'jurnal'
const selectedType = ref(null);
const transactionTypes = [
  { id: 0, name: "Penerimaan Kas" },
  { id: 1, name: "Pengeluaran Kas" },
  { id: 2, name: "Penerimaan Bank" },
  { id: 3, name: "Pengeluaran Bank" },
  { id: 4, name: "Memorial" },
  { id: 5, name: "Koreksi" },
  { id: 6, name: "Penutup" },
];

// For 'bukubesar' & 'biaya'
const dariPerkiraan = ref("");
const sdPerkiraan = ref("");
const jurnalPenutup = ref("Tanpa Jurnal Penutup");
const valas = ref(false);
const formatOption = ref("Detail");

const jurnalPenutupOptions = [
  "Tanpa Jurnal Penutup",
  "Dengan Jurnal Penutup",
];

const formatOptions = [
  "Detail",
  "Rekap",
];

// For 'mutasi', 'biaya', 'aktivatetap', 'labarugi', & 'neracalajur'
const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());

const applyFilter = () => {
  let payload = {};

  if (props.type === "jurnal") {
    payload = {
      startDate: startDate.value,
      endDate: endDate.value,
      type: selectedType.value,
    };
  } else if (props.type === "bukubesar") {
    payload = {
      startDate: startDate.value,
      endDate: endDate.value,
      dariPerkiraan: dariPerkiraan.value,
      sdPerkiraan: sdPerkiraan.value,
      jurnalPenutup: jurnalPenutup.value,
      valas: valas.value,
      formatOption: formatOption.value,
    };
  } else if (props.type === "mutasi" || props.type === "aktivatetap" || props.type === "labarugi" || props.type === "neracalajur" || props.type === "neraca") {
    const start = new Date(selectedYear.value, selectedMonth.value - 1, 1);
    const end = new Date(selectedYear.value, selectedMonth.value, 0);

    payload = {
      startDate: start,
      endDate: end,
      month: selectedMonth.value,
      year: selectedYear.value,
    };
  } else if (props.type === "biaya") {
    const start = new Date(selectedYear.value, selectedMonth.value - 1, 1);
    const end = new Date(selectedYear.value, selectedMonth.value, 0);

    payload = {
      startDate: start,
      endDate: end,
      month: selectedMonth.value,
      year: selectedYear.value,
      dariPerkiraan: dariPerkiraan.value,
      sdPerkiraan: sdPerkiraan.value,
    };
  }

  emit("on-filter-apply", payload);
  visible.value = false;
};

async function handleBrowsePerkiraan(target) {
  try {
    const response = await api.get("labarugineraca/getperkiraan");
    const responseData = response.data?.datafrbrowse || (Array.isArray(response.data) ? response.data : []);
    
    // Add a unique key field for devxtreme grid
    const data = responseData.map((item, index) => ({
      ...item,
      __browseKey: index,
    }));
    
    const selected = await FormBrowseDialog.show({
      title: "Pilih Perkiraan",
      dataSource: data,
      keyField: "__browseKey",
      disablecol: [
        ...(response.data?.disablecol || ["id", "ket"]),
        "__browseKey",
      ],
    });
    
    if (selected) {
      const firstColumn = Object.keys(selected).find(k => k !== "__browseKey" && k !== "id" && k !== "ket");
      const codeVal = selected.perkiraan || selected.Kode || selected.kode || selected.KodePerk || selected[firstColumn] || "";
      
      if (target === "dari") {
        dariPerkiraan.value = codeVal;
      } else if (target === "sd") {
        sdPerkiraan.value = codeVal;
      }
    }
  } catch (error) {
    if (error !== "cancelled") {
      console.error("Browse perkiraan error:", error);
    }
  }
}

const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
};

defineExpose({
  open,
  close,
});
</script>

<style scoped>
:deep(.dx-texteditor.dx-editor-outlined) {
  border-radius: 6px;
  border-color: #cbd5e1;
}
</style>
