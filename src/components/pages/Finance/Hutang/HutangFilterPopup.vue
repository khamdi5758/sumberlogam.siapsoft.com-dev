<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    @click.self="$emit('close')"
  >
    <section class="w-full max-w-[420px] rounded-xl bg-white p-5 shadow-2xl" role="dialog" aria-modal="true">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-200 pb-3">
        <h1 class="text-[18px] font-semibold text-slate-900">{{ title }}</h1>
        <button
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          @click="$emit('close')"
        >
          <X :size="16" />
        </button>
      </div>

      <!-- Form Fields -->
      <div class="pt-4 space-y-4">
        <!-- Date Ranges -->
        <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
          <label class="text-[14px] text-slate-700">Dari Tanggal</label>
          <DxDateBox v-model:value="startDate" type="date" display-format="dd-MM-yyyy" :use-mask-behavior="true" styling-mode="outlined" />
        </div>
        <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
          <label class="text-[14px] text-slate-700">S/d Tanggal</label>
          <DxDateBox v-model:value="endDate" type="date" display-format="dd-MM-yyyy" :use-mask-behavior="true" styling-mode="outlined" />
        </div>

        <!-- Account (Perkiraan) -->
        <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
          <label class="text-[14px] text-slate-700">Perkiraan</label>
          <DxTextBox v-model:value="perkiraan" styling-mode="outlined" placeholder="Pilih Perkiraan" :read-only="true" :buttons="browseButtons('perkiraan')" @focus-in="handleBrowse('perkiraan')" />
        </div>

        <!-- Valas -->
        <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
          <label class="text-[14px] text-slate-700">Valas</label>
          <DxSelectBox v-model:value="valas" :data-source="['IDR', 'USD']" styling-mode="outlined" />
        </div>

        <!-- Supplier -->
        <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
          <label class="text-[14px] text-slate-700">Supplier</label>
          <DxTextBox v-model:value="kodecust" styling-mode="outlined" placeholder="Pilih Supplier" :read-only="true" :buttons="browseButtons('supplier')" @focus-in="handleBrowse('supplier')" />
        </div>

        <!-- Laporan Selection -->
        <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
          <label class="text-[14px] text-slate-700">Laporan</label>
          <DxSelectBox
            v-model:value="laporan"
            :data-source="laporanOptions"
            value-expr="value"
            display-expr="label"
            styling-mode="outlined"
          />
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button type="button" class="min-w-[80px] rounded-lg bg-red-600 px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-red-700" @click="$emit('close')">
          Batal
        </button>
        <button type="button" class="min-w-[85px] flex items-center justify-center gap-1 rounded-lg bg-[#0f3d7a] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0b2f5f]" @click="submitFilter">
          <Printer :size="14" /> Cetak
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { X, Printer } from "lucide-vue-next";
import { DxDateBox } from "devextreme-vue/date-box";
import { DxSelectBox } from "devextreme-vue/select-box";
import { DxTextBox } from "devextreme-vue/text-box";
import api from "@/api/index.js";
import FormBrowseDialog from "@/components/widgets/FormBrowseDialog.vue";

const props = defineProps({
  visible: Boolean,
  title: String,
  initialPerkiraan: String,
});

const emit = defineEmits(["close", "apply"]);

const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const startDate = ref(startOfMonth);
const endDate = ref(today);
const perkiraan = ref(props.initialPerkiraan || "");
const valas = ref("IDR");
const kodecust = ref("");
const laporan = ref(0);

const laporanOptions = [
  { value: 0, label: "Tanggal - Detail" },
  { value: 1, label: "Tanggal - Rekap" },
  { value: 2, label: "Nota - Detail" },
  { value: 3, label: "Nota - Rekap" }
];

const browseButtons = (field) => [
  {
    name: "browse",
    location: "after",
    options: {
      text: "...",
      stylingMode: "outlined",
      onClick: () => handleBrowse(field),
    },
  },
];

async function handleBrowse(field) {
  let endpoint = "";
  let dialogTitle = "";

  if (field === "perkiraan") {
    endpoint = "utangpiutang/perkiraan";
    dialogTitle = "Pilih Perkiraan";
  } else {
    endpoint = "utangpiutang/browsutang";
    dialogTitle = "Pilih Supplier";
  }

  try {
    const response = await api.get(endpoint);
    const dataRaw = response.data?.data || response.data?.datafrbrowse || (Array.isArray(response.data) ? response.data : []);
    const formattedData = dataRaw.map((item, index) => ({
      ...item,
      __browseKey: index,
    }));

    const selected = await FormBrowseDialog.show({
      title: dialogTitle,
      dataSource: formattedData,
      keyField: "__browseKey",
      disablecol: ["__browseKey"],
    });

    if (selected) {
      const code = selected.Kode || selected.kode || selected.KodePerkiraan || selected.kodeperkiraan || "";
      if (field === "perkiraan") {
        perkiraan.value = code;
      } else {
        kodecust.value = code;
      }
    }
  } catch (error) {
    if (error !== "cancelled") {
      console.error("Lookup error:", error);
    }
  }
}

const formatDate = (d) => {
  if (!d) return "";
  const dateObj = new Date(d);
  return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
};

const submitFilter = () => {
  const payload = {
    mulaitgl: formatDate(startDate.value),
    sampaitgl: formatDate(endDate.value),
    perkiraan: perkiraan.value,
    kodecust: kodecust.value,
    tipelaporan: laporan.value,
  };

  emit("apply", payload);
};
</script>
