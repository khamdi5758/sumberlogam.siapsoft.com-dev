<template>
  <div class="accounting-container">
    <div v-if="isLoading" class="fixed inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] z-50">
      <div class="rounded-xl bg-white/80 p-4 shadow-lg backdrop-blur-sm">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    </div>

    <!-- Grid disembunyikan sampai data pertama kali dimuat, supaya tidak
         menampilkan grid kosong di belakang popup filter saat pertama kali
         menu ini dibuka. -->
    <ReportGridBuilder
      v-show="hasLoaded"
      ref="gridBuilderRef"
      :dataSource="dataSource"
      :keyExpr="keyfield"
      :companyName="companyName"
      :companyAddress="companyAddress"
      :companyPhone="companyPhone"
      :reportTitle="title"
      :periodLabel="periodLabel"
      :userName="userName"
      :storageKey="'report-' + storageKey"
      :fileName="fileName"
      :mergeColumns="mergeColumns"
      :sumcolom="sumcolom"
      :avgcolom="avgcolom"
      :spFooterText="spFooterText"
    >
      <!-- Forward custom columns slot if provided by parent -->
      <template v-if="$slots.columns" #columns>
        <slot name="columns"></slot>
      </template>

      <template #extra-tools>
        <button class="rb-btn rb-btn--filter" title="Filter Data" @click="openFilter">
          <i class="filter-ico">&#9906;</i> Filter
        </button>
      </template>
    </ReportGridBuilder>

    <!-- AccountingPopup mengatur visibilitasnya sendiri (open()/close()
         lewat ref), berbeda dari RegisterFilterPopup/HutangFilterPopup yang
         dikendalikan lewat prop :visible dari parent. -->
    <AccountingPopup
      ref="popupRef"
      :title="popupTitle || title"
      :type="type"
      :submitButtonText="submitButtonText"
      @on-filter-apply="handleApplyFilter"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, onBeforeUnmount, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ReportGridBuilder from "@/components/pages/Registrasi/ReportGridBuilder.vue";
import AccountingPopup from "./AccountingPopup.vue";

const ACCOUNTING_PAGE_CACHE = "__accountingPageCache";

const props = defineProps({
  title: { type: String, required: true },
  // Judul popup filter (kalau beda dari title report, mis. "Buku Tambahan"
  // untuk Buku Besar). Kalau kosong, pakai title.
  popupTitle: { type: String, default: "" },
  type: { type: String, required: true },
  // Nama store module laporan ini (mis. "jurnal", "bukubesar"). Setiap
  // jenis laporan Accounting punya store module sendiri-sendiri (tidak
  // dipakai bersama seperti "produksi"), jadi tidak perlu mekanisme clear
  // store lintas menu.
  storeModule: { type: String, required: true },
  // Nama action Vuex yang dipanggil untuk memuat data, mis. "getJurnal".
  loadAction: { type: String, required: true },
  // Nama getter Vuex yang menyimpan daftar hasil laporan, mis. "jurnalList".
  // Tidak seragam antar module (contoh: "aktivaTetapList"), makanya
  // eksplisit lewat prop, bukan ditebak dari storeModule.
  listGetter: { type: String, required: true },
  submitButtonText: { type: String, default: "Go" },
  userName: { type: String, default: "admin" },
  storageKey: { type: String, required: true },
  fileName: { type: String, required: true },
  mergeColumns: { type: Array, default: () => [] },
});

const store = useStore();
const route = useRoute();
const popupRef = ref(null);

const activeFilter = ref(null);

// Snapshot data milik instance ini, supaya tampilan tidak "reset" ke popup
// filter saat tab-nya sempat tercoret dari cache keep-alive (mis. karena
// jumlah tab terbuka banyak) lalu dibuka lagi.
const localData = ref([]);
const localKeyfield = ref("Id");
const localPerusahaan = ref(null);
const localSumcolom = ref([]);
const localAvgcolom = ref([]);
const localSqlQuery = ref("");
const hasLoaded = ref(false);

const dataSource = computed(() =>
  hasLoaded.value ? localData.value : store.getters[`${props.storeModule}/${props.listGetter}`] || [],
);
const isLoading = computed(() => store.getters[`${props.storeModule}/isLoading`] || false);
const keyfield = computed(() =>
  hasLoaded.value ? localKeyfield.value : store.getters[`${props.storeModule}/keyfield`] || "Id",
);
const sumcolom = computed(() =>
  hasLoaded.value ? localSumcolom.value : store.getters[`${props.storeModule}/sumcolom`] || [],
);
const avgcolom = computed(() =>
  hasLoaded.value ? localAvgcolom.value : store.getters[`${props.storeModule}/avgcolom`] || [],
);
const spFooterText = computed(() =>
  hasLoaded.value ? localSqlQuery.value : store.getters[`${props.storeModule}/ketsp`] || "",
);

const perusahaan = computed(() => {
  if (hasLoaded.value) return localPerusahaan.value;
  return store.getters[`${props.storeModule}/perusahaan`] || null;
});
const companyName = computed(() => perusahaan.value?.namaperusahaan || "PT SIAP INTEGRASI");
const companyAddress = computed(() => {
  if (!perusahaan.value) return "";
  return [perusahaan.value.alamat1, perusahaan.value.alamat2].filter(Boolean).join(" ");
});
const companyPhone = computed(() => perusahaan.value?.telpon || "");

const periodLabel = computed(() => {
  const start = activeFilter.value?.startDate ? new Date(activeFilter.value.startDate) : null;
  const end = activeFilter.value?.endDate ? new Date(activeFilter.value.endDate) : null;
  if (!start || !end) return "";
  const options = { day: "numeric", month: "short", year: "numeric" };
  return `${start.toLocaleDateString("id-ID", options)} - ${end.toLocaleDateString("id-ID", options)}`;
});

function loadData(payload) {
  activeFilter.value = payload;
  return store.dispatch(`${props.storeModule}/${props.loadAction}`, payload).then(() => {
    localData.value = store.getters[`${props.storeModule}/${props.listGetter}`] || [];
    localKeyfield.value = store.getters[`${props.storeModule}/keyfield`] || "Id";
    localPerusahaan.value = store.getters[`${props.storeModule}/perusahaan`] || null;
    localSumcolom.value = store.getters[`${props.storeModule}/sumcolom`] || [];
    localAvgcolom.value = store.getters[`${props.storeModule}/avgcolom`] || [];
    localSqlQuery.value = store.getters[`${props.storeModule}/ketsp`] || "";
    hasLoaded.value = true;
  });
}

// AccountingPopup sudah membangun payload sesuai bentuk yang dibutuhkan
// masing-masing store module (lihat AccountingPopup.vue -> applyFilter()),
// jadi di sini tinggal diteruskan langsung, tanpa perlu dibentuk ulang.
function handleApplyFilter(payload) {
  loadData(payload);
}

function openFilter() {
  popupRef.value?.open();
}

function savePageSnapshot() {
  if (!hasLoaded.value) return;
  window[ACCOUNTING_PAGE_CACHE] = window[ACCOUNTING_PAGE_CACHE] || {};
  window[ACCOUNTING_PAGE_CACHE][props.storeModule] = {
    localData: localData.value,
    localKeyfield: localKeyfield.value,
    localPerusahaan: localPerusahaan.value,
    localSumcolom: localSumcolom.value,
    localAvgcolom: localAvgcolom.value,
    localSqlQuery: localSqlQuery.value,
    activeFilter: activeFilter.value,
  };
}
function restorePageSnapshot(snapshot) {
  localData.value = snapshot.localData || [];
  localKeyfield.value = snapshot.localKeyfield || "Id";
  localPerusahaan.value = snapshot.localPerusahaan || null;
  localSumcolom.value = snapshot.localSumcolom || [];
  localAvgcolom.value = snapshot.localAvgcolom || [];
  localSqlQuery.value = snapshot.localSqlQuery || "";
  activeFilter.value = snapshot.activeFilter || null;
  hasLoaded.value = true;
}

const myRoutePath = route.path;
window[ACCOUNTING_PAGE_CACHE] = window[ACCOUNTING_PAGE_CACHE] || {};
const cachedPage = window[ACCOUNTING_PAGE_CACHE][props.storeModule];
if (cachedPage) {
  restorePageSnapshot(cachedPage);
}

onMounted(() => {
  // Pembukaan pertama (atau instance baru setelah keep-alive miss tanpa
  // data tersimpan): buka popup filter otomatis, sama seperti perilaku
  // autoOpenFilter pada implementasi sebelumnya.
  if (!hasLoaded.value) {
    popupRef.value?.open();
  }
});

onActivated(() => {
  // Instance lama diaktifkan kembali dari cache keep-alive. Jangan reset
  // state apa pun: biarkan snapshot lokal + hasLoaded tetap seperti
  // terakhir kali dilihat.
});

onBeforeUnmount(() => {
  savePageSnapshot();
});

onUnmounted(() => {
  // Bersihkan snapshot HANYA jika tab untuk path ini benar-benar sudah
  // ditutup, bukan sekadar di-deactivate oleh keep-alive.
  const activeTabs = store.getters["tabs/getTabs"] || [];
  const isTabStillOpen = activeTabs.some(
    (path) => String(path).toLowerCase() === myRoutePath.toLowerCase(),
  );
  if (!isTabStillOpen && window[ACCOUNTING_PAGE_CACHE]) {
    delete window[ACCOUNTING_PAGE_CACHE][props.storeModule];
  }
});
</script>

<style scoped>
.accounting-container {
  min-height: 100vh;
  background-color: #f1f5f9;
  padding: 20px;
}

.rb-btn--filter {
  background-color: var(--layout-sidebar-accent) !important;
  color: var(--layout-sidebar-bg) !important;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 4px;
  padding: 0 12px;
  height: 20px;
  border: 1px solid var(--layout-sidebar-accent);
  transition: all 0.2s ease;
}

.rb-btn--filter:hover {
  background-color: #ffffff !important;
  border-color: #ffffff;
  color: var(--layout-sidebar-bg) !important;
  transform: translateY(-1px);
}

.rb-btn--filter:focus-visible {
  outline: 2px solid var(--layout-sidebar-accent);
  outline-offset: 2px;
}

.rb-btn--filter:active {
  transform: scale(0.97);
}
</style>
