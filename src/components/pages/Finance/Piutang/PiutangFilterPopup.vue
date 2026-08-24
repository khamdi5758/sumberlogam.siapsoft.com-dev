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

        <!-- Type Switch (Customer / Salesman) -->
        <div v-if="type !== 'pelunasan' && type !== 'sisa' && type !== 'saldo' && type !== 'umur'" class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
          <label class="text-[14px] text-slate-700">Tipe</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 text-[14px] text-slate-700 cursor-pointer">
              <input type="radio" value="customer" v-model="targetType" class="h-4 w-4 text-blue-600 focus:ring-blue-500" />
              Customer
            </label>
            <label class="flex items-center gap-2 text-[14px] text-slate-700 cursor-pointer">
              <input type="radio" value="salesman" v-model="targetType" class="h-4 w-4 text-blue-600 focus:ring-blue-500" />
              Salesman
            </label>
          </div>
        </div>

        <!-- Account (Perkiraan) -->
        <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
          <label class="text-[14px] text-slate-700">Perkiraan</label>
          <DxTextBox
            v-model:value="perkiraan"
            styling-mode="outlined"
            placeholder="Pilih Perkiraan"
            :read-only="true"
            :buttons="browseButtonsPerkiraan"
            @focus-in="handleBrowse('perkiraan')"
            @click="handleBrowse('perkiraan')"
          />
        </div>

        <!-- Valas -->
        <div v-if="type !== 'umur'" class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
          <label class="text-[14px] text-slate-700">Valas</label>
          <DxSelectBox v-model:value="valas" :data-source="['IDR', 'USD']" styling-mode="outlined" />
        </div>

        <!-- Record Tertentu Checkbox -->
        <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
          <div class="sm:col-start-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="record-tertentu"
              v-model="recordTertentu"
              class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label for="record-tertentu" class="text-[14px] text-slate-700 cursor-pointer">Record Tertentu</label>
          </div>
        </div>

        <template v-if="recordTertentu">
          <!-- Dari Target ID -->
          <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
            <label class="text-[14px] text-slate-700">{{ targetIdLabel.dari }}</label>
            <DxTextBox
              v-model:value="kodecust"
              styling-mode="outlined"
              :placeholder="'Pilih ' + targetIdLabel.label"
              :read-only="true"
              :buttons="browseButtonsDari"
              @focus-in="handleBrowse('dari')"
              @click="handleBrowse('dari')"
            />
          </div>

          <!-- S/d Target ID -->
          <div class="grid grid-cols-1 items-center gap-1 sm:grid-cols-[120px_1fr]">
            <label class="text-[14px] text-slate-700">{{ targetIdLabel.sd }}</label>
            <DxTextBox
              v-model:value="kodecust1"
              styling-mode="outlined"
              :placeholder="'Pilih ' + targetIdLabel.label"
              :read-only="true"
              :buttons="browseButtonsSd"
              @focus-in="handleBrowse('sd')"
              @click="handleBrowse('sd')"
            />
          </div>
        </template>

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
          <Printer :size="14" /> Go
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { X, Printer } from "lucide-vue-next";
import { DxDateBox } from "devextreme-vue/date-box";
import { DxSelectBox } from "devextreme-vue/select-box";
import { DxTextBox } from "devextreme-vue/text-box";
import api from "@/api/index.js";
import FormBrowseDialog from "@/components/widgets/FormBrowseDialog.vue";
import { alertService } from "@/services/alertService";

const props = defineProps({
  visible: Boolean,
  title: String,
  initialPerkiraan: String,
  type: {
    type: String,
    default: "kartu"
  }
});

const emit = defineEmits(["close", "apply"]);

const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const startDate = ref(startOfMonth);
const endDate = ref(today);
const targetType = ref("customer");
const perkiraan = ref(props.initialPerkiraan || "");
const valas = ref("IDR");
const kodecust = ref("");
const kodecust1 = ref("");
const laporan = ref(0);
const recordTertentu = ref(props.type === "kartu");

const laporanOptions = computed(() => {
  if (props.type === "pelunasan") {
    return [
      { value: 0, label: "Tanggal, Customer" },
      { value: 1, label: "Tanggal, Salesman" },
      { value: 2, label: "No Nota, Customer" },
      { value: 3, label: "No Nota, Salesman" }
    ];
  }
  if (props.type === "sisa") {
    return [
      { value: 0, label: "Rekap Customer" },
      { value: 1, label: "Rekap Salesman" },
      { value: 2, label: "Detail Customer" },
      { value: 3, label: "Detail Salesman" }
    ];
  }
  if (props.type === "saldo") {
    return [
      { value: 0, label: "Customer" },
      { value: 1, label: "Salesman" }
    ];
  }
  if (props.type === "umur") {
    return [
      { value: 0, label: "Rekap Customer" },
      { value: 1, label: "Rekap Salesman" },
      { value: 2, label: "Tanggal Customer" },
      { value: 3, label: "Tanggal Salesman" },
      { value: 4, label: "No. Nota Customer" },
      { value: 5, label: "No. Nota Salesman" }
    ];
  }
  return [
    { value: 0, label: "Tanggal - Detail" },
    { value: 1, label: "Tanggal - Rekap" },
    { value: 2, label: "Nota - Detail" },
    { value: 3, label: "Nota - Rekap" }
  ];
});

watch(laporan, (newVal) => {
  if (props.type === "pelunasan" || props.type === "sisa") {
    if (newVal === 0 || newVal === 2) {
      targetType.value = "customer";
    } else {
      targetType.value = "salesman";
    }
  } else if (props.type === "saldo") {
    if (newVal === 0) {
      targetType.value = "customer";
    } else {
      targetType.value = "salesman";
    }
  } else if (props.type === "umur") {
    if (newVal === 0 || newVal === 2 || newVal === 4) {
      targetType.value = "customer";
    } else {
      targetType.value = "salesman";
    }
  }
});

const targetIdLabel = computed(() => {
  const isCust = targetType.value === "customer";
  return {
    label: isCust ? "Customer" : "Salesman",
    dari: isCust ? "Dari Cust ID" : "Dari Sales ID",
    sd: isCust ? "S/d Cust ID" : "S/d Sales ID"
  };
});

watch(targetType, () => {
  kodecust.value = "";
  kodecust1.value = "";
});

const browseButtonsPerkiraan = [
  {
    name: "browse",
    location: "after",
    options: {
      text: "...",
      stylingMode: "outlined",
      onClick: () => handleBrowse("perkiraan"),
    },
  },
];

const browseButtonsDari = [
  {
    name: "browse",
    location: "after",
    options: {
      text: "...",
      stylingMode: "outlined",
      onClick: () => handleBrowse("dari"),
    },
  },
];

const browseButtonsSd = [
  {
    name: "browse",
    location: "after",
    options: {
      text: "...",
      stylingMode: "outlined",
      onClick: () => handleBrowse("sd"),
    },
  },
];

async function handleBrowse(field) {
  let endpoint = "";
  let dialogTitle = "";
  let response;

  try {
    if (field === "perkiraan") {
      endpoint = "utangpiutang/perkiraan";
      dialogTitle = "Pilih Perkiraan";
      response = await api.getbydata(endpoint, { kode: "11" });
    } else {
      endpoint = targetType.value === "customer" ? "utangpiutang/customer" : "utangpiutang/salesman";
      dialogTitle = targetType.value === "customer" ? "Pilih Customer" : "Pilih Salesman";
      response = await api.get(endpoint);
    }

    const dataRaw = response.data?.data || response.data?.datafrbrowse || (Array.isArray(response.data) ? response.data : []);
    const formattedData = dataRaw.map((item, index) => ({
      ...item,
      __browseKey: index,
    }));

    const selected = await FormBrowseDialog.show({
      title: dialogTitle,
      dataSource: formattedData,
      keyField: "__browseKey",
      disablecol: [...(response.data?.disablecol || []), "__browseKey"],
    });

    if (selected) {
      console.log("PiutangFilterPopup selected browse row:", selected);
      let code = "";
      if (field === "perkiraan") {
        code = selected.id || selected.Perkiraan || selected.perkiraan || selected.KodePerkiraan || selected.kodeperkiraan || selected.Kode || selected.kode || "";
      } else {
        if (targetType.value === "salesman") {
          code = selected.KodeSales || selected.kodesales || selected.KodeSls || selected.kodesls || selected.KodeSalesman || selected.kodesalesman || selected.SalesID || selected.salesid || selected.SlsID || selected.slsid || selected.kode_sales || selected.kode_salesman || selected.Kode || selected.kode || selected.id || "";
        } else {
          code = selected.KodeCust || selected.kodecust || selected.Kode || selected.kode || selected.id || "";
        }
      }

      if (field === "perkiraan") {
        perkiraan.value = code;
      } else if (field === "dari") {
        kodecust.value = code;
      } else if (field === "sd") {
        kodecust1.value = code;
      }
    }
  } catch (error) {
    if (error !== "cancelled") {
      console.error("Lookup error:", error);
      alertService.error(`Gagal memuat data lookup: ${error.message || error}`);
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
    kodecust: recordTertentu.value ? kodecust.value : "",
    kodecust1: recordTertentu.value ? kodecust1.value : "",
    tipelaporan: laporan.value,
    record_tertentu: recordTertentu.value,
  };

  emit("apply", payload);
};
</script>
