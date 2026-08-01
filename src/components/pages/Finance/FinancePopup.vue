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
        <h1 class="text-[18px] font-semibold text-slate-900">{{ title }}</h1>
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
          <!-- Tanggal (kecuali untuk tipe tertentu) -->
          <div
            v-if="!excludeDateFields"
            class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
          >
            <label class="text-[14px] text-slate-700">
              {{ type === "neraca" ? "Dari Tanggal" : "Mulai Tanggal" }}
            </label>
            <DxDateBox
              v-model:value="startDate"
              type="date"
              display-format="dd-MM-yyyy"
              :use-mask-behavior="true"
              styling-mode="outlined"
            />
          </div>
          <div
            v-if="!excludeDateFields"
            class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
          >
            <label class="text-[14px] text-slate-700">
              {{ type === "neraca" ? "S/d Tanggal" : "Sampai Tanggal" }}
            </label>
            <DxDateBox
              v-model:value="endDate"
              type="date"
              display-format="dd-MM-yyyy"
              :use-mask-behavior="true"
              styling-mode="outlined"
            />
          </div>

          <!-- Khusus Jurnal -->
          <template v-if="type === 'jurnal'">
            <div
              class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
            >
              <label class="text-[14px] text-slate-700">Jenis Transaksi</label>
              <DxSelectBox
                v-model:value="selectedType"
                :data-source="transactionTypes"
                placeholder="Pilih Transaksi..."
                :show-clear-button="true"
                :search-enabled="true"
                styling-mode="outlined"
              />
            </div>
          </template>

          <!-- Khusus Buku Besar -->
          <template v-if="type === 'bukubesar'">
            <PerkiraanFields
              :mode="perkiraanMode"
              v-model:dari="dariPerkiraan"
              v-model:sd="sdPerkiraan"
              v-model:tunggal="perkiraanTunggal"
              label-dari="Dari Perkiraan"
              label-sd="S/d Perkiraan"
              label-tunggal="Perkiraan"
            />
            <div
              class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
            >
              <label class="text-[14px] text-slate-700">Jurnal Penutup</label>
              <DxSelectBox
                v-model:value="jurnalPenutup"
                :data-source="jurnalPenutupOptions"
                styling-mode="outlined"
              />
            </div>
            <div
              class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
            >
              <div></div>
              <label
                class="flex items-center gap-2 text-[14px] text-slate-700 cursor-pointer"
              >
                <input
                  v-model="valas"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Valas
              </label>
            </div>
            <div
              class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
            >
              <label class="text-[14px] text-slate-700">Format</label>
              <DxSelectBox
                v-model:value="formatOption"
                :data-source="formatOptions"
                styling-mode="outlined"
              />
            </div>
          </template>

          <!-- Khusus Kas Harian / Bank Harian – browse perkiraan -->
          <template v-if="['kasharian', 'bankharian'].includes(type)">
            <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
              <label class="text-[14px] text-slate-700">Perkiraan</label>
              <DxTextBox
                v-model:value="perkiraanTunggal"
                styling-mode="outlined"
                :read-only="true"
                placeholder="Klik untuk browse"
                :buttons="browseButtons"
                @focus-in="handleBrowsePerkiraan"
              />
            </div>
          </template>

          <!-- Khusus Mutasi, Aktiva Tetap, Laba Rugi, Neraca Lajur, Arus Kas -->
          <template
            v-if="
              [
                'mutasi',
                'aktivatetap',
                'labarugi',
                'neracalajur',
                'aruskas',
              ].includes(type)
            "
          >
            <div
              class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
            >
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

          <!-- Khusus Biaya -->
          <template v-if="type === 'biaya'">
            <div
              class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]"
            >
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
            <PerkiraanFields
              :mode="perkiraanMode"
              v-model:dari="dariPerkiraan"
              v-model:sd="sdPerkiraan"
              v-model:tunggal="perkiraanTunggal"
              label-dari="Dari Perkiraan"
              label-sd="S/d Perkiraan"
              label-tunggal="Perkiraan"
            />
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
import { ref, computed } from "vue";
import { X } from "lucide-vue-next";
import { DxDateBox } from "devextreme-vue/date-box";
import { DxSelectBox } from "devextreme-vue/select-box";
import { DxTextBox } from "devextreme-vue/text-box";
import api from "@/api/index.js";
import FormBrowseDialog from "@/components/widgets/FormBrowseDialog.vue";

// Komponen bantu PerkiraanFields (tidak berubah)
const PerkiraanFields = {
  props: {
    mode: { type: String, default: "range" },
    dari: String,
    sd: String,
    tunggal: String,
    labelDari: String,
    labelSd: String,
    labelTunggal: String,
    showRange: { type: Boolean, default: true },
  },
  emits: ["update:dari", "update:sd", "update:tunggal"],
  template: `
    <template v-if="mode === 'range' && showRange">
      <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
        <label class="text-[14px] text-slate-700">{{ labelDari }}</label>
        <input
          :value="dari"
          @input="$emit('update:dari', $event.target.value)"
          type="text"
          class="w-full px-3 py-1.5 border border-slate-300 rounded-md text-[14px] outline-none focus:border-blue-500"
        />
      </div>
      <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
        <label class="text-[14px] text-slate-700">{{ labelSd }}</label>
        <input
          :value="sd"
          @input="$emit('update:sd', $event.target.value)"
          type="text"
          class="w-full px-3 py-1.5 border border-slate-300 rounded-md text-[14px] outline-none focus:border-blue-500"
        />
      </div>
    </template>
    <template v-else>
      <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
        <label class="text-[14px] text-slate-700">{{ labelTunggal }}</label>
        <input
          :value="tunggal"
          @input="$emit('update:tunggal', $event.target.value)"
          type="text"
          class="w-full px-3 py-1.5 border border-slate-300 rounded-md text-[14px] outline-none focus:border-blue-500"
        />
      </div>
    </template>
  `,
};

// ========== KOMPONEN UTAMA ==========
const props = defineProps({
  title: { type: String, default: "Filter Laporan" },
  submitButtonText: { type: String, default: "Terapkan Filter" },
  type: { type: String, default: "jurnal" },
  perkiraanBrowseCode: { type: String, default: "" },
  perkiraanMode: {
    type: String,
    default: "range",
    validator: (val) => ["range", "single"].includes(val),
  },
});

const emit = defineEmits(["on-filter-apply"]);

const visible = ref(false);
const startDate = ref(new Date());
const endDate = ref(new Date());

// Jurnal
const selectedType = ref(null);
const transactionTypes = [
  "Penerimaan Kas",
  "Pengeluaran Kas",
  "Penerimaan Bank",
  "Pengeluaran Bank",
  "Memorial",
  "Koreksi",
  "Penutup",
];

// Perkiraan
const dariPerkiraan = ref("");
const sdPerkiraan = ref("");
const perkiraanTunggal = ref("");
const jurnalPenutup = ref("Tanpa Jurnal Penutup");
const valas = ref(false);
const formatOption = ref("Detail");

const jurnalPenutupOptions = ["Tanpa Jurnal Penutup", "Dengan Jurnal Penutup"];
const formatOptions = ["Detail", "Rekap"];

// Periode bulan/tahun
const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());

// Tipe yang tidak menampilkan tanggal (termasuk 'aruskas')
const excludeDateFields = computed(() =>
  [
    "mutasi",
    "biaya",
    "aktivatetap",
    "labarugi",
    "neracalajur",
    "aruskas",
  ].includes(props.type),
);

const applyFilter = () => {
  let payload = {};

  if (props.type === "jurnal") {
    payload = {
      startDate: startDate.value,
      endDate: endDate.value,
      type: selectedType.value,
    };
  } else if (props.type === "neraca") {
    payload = { startDate: startDate.value, endDate: endDate.value };
  } else if (props.type === "bukubesar") {
    payload = {
      startDate: startDate.value,
      endDate: endDate.value,
      dariPerkiraan:
        props.perkiraanMode === "range"
          ? dariPerkiraan.value
          : perkiraanTunggal.value,
      sdPerkiraan:
        props.perkiraanMode === "range"
          ? sdPerkiraan.value
          : perkiraanTunggal.value,
      jurnalPenutup: jurnalPenutup.value,
      valas: valas.value,
      formatOption: formatOption.value,
    };
  } else if (props.type === "rekapkasbank") {
    payload = {
      startDate: startDate.value,
      endDate: endDate.value,
    };
  } else if (["kasharian", "bankharian"].includes(props.type)) {
    payload = {
      startDate: startDate.value,
      endDate: endDate.value,
      perkiraan: perkiraanTunggal.value,
    };
  } else if (
    ["mutasi", "aktivatetap", "labarugi", "neracalajur", "aruskas"].includes(
      props.type,
    )
  ) {
    // Untuk aruskas, kita kirim bulan & tahun serta start/end date
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
      dariPerkiraan:
        props.perkiraanMode === "range"
          ? dariPerkiraan.value
          : perkiraanTunggal.value,
      sdPerkiraan:
        props.perkiraanMode === "range"
          ? sdPerkiraan.value
          : perkiraanTunggal.value,
    };
  }

  emit("on-filter-apply", payload);
  visible.value = false;
};

const open = () => {
  visible.value = true;
};
const close = () => {
  visible.value = false;
};

const browseButtons = computed(() => [
  {
    name: "browse",
    location: "after",
    options: {
      text: "...",
      onClick: handleBrowsePerkiraan,
      stylingMode: "outlined",
    },
  },
]);

async function handleBrowsePerkiraan() {
  try {
    const response = await api.getbydata(
      "formbrowse",
      props.perkiraanBrowseCode ? { kode: props.perkiraanBrowseCode } : {},
    );
    const responseData =
      response.data?.datafrbrowse ||
      (Array.isArray(response.data) ? response.data : []);
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
      perkiraanTunggal.value =
        selected.id ||
        selected.kode ||
        selected.Kode ||
        selected.kodeperkiraan ||
        selected.KodePerkiraan ||
        "";
    }
  } catch (error) {
    if (error !== "cancelled") {
      console.error("Browse perkiraan error:", error);
    }
  }
}

defineExpose({ open, close });
</script>

<style scoped>
:deep(.dx-texteditor.dx-editor-outlined) {
  border-radius: 6px;
  border-color: #cbd5e1;
}
</style>
