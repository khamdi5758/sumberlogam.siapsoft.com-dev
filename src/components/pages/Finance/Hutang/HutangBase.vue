<template>
  <div class="hutang-base-container">
    <div v-if="isLoading" class="fixed inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] z-50">
      <div class="rounded-xl bg-white/80 p-4 shadow-lg backdrop-blur-sm">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    </div>

    <!-- Jangan render report grid saat popup filter terbuka, agar background
         di belakang popup tidak menampilkan data lama/kosong. -->
    <ReportGridBuilder
      v-show="!showFilter"
      ref="gridBuilderRef"
      :dataSource="dataSource"
      :keyExpr="keyfield"
      :companyName="companyName"
      :companyAddress="companyAddress"
      :companyPhone="companyPhone"
      :reportTitle="title"
      :periodLabel="periodLabel"
      :userName="userName"
      :storageKey="'report-hutang-' + type"
      :fileName="'report-hutang-' + type"
      :mergeColumns="mergeColumns"
      :sumcolom="sumcolom"
      :avgcolom="avgcolom"
      :spFooterText="spFooterText"
    >
      <template #extra-tools>
        <button class="rb-btn rb-btn--filter" title="Filter Data" @click="openFilter">
          <span class="filter-icon-span">&#9906;</span> Filter
        </button>
      </template>
    </ReportGridBuilder>

    <HutangFilterPopup
      v-if="showFilter"
      :visible="showFilter"
      :title="title"
      :type="type"
      :initialPerkiraan="initialPerkiraan"
      @apply="handleApplyFilter"
      @close="handleClosePopup"
    />
  </div>
</template>

<script setup>
import { ref, computed, onActivated, onBeforeUnmount, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ReportGridBuilder from "@/components/pages/Registrasi/ReportGridBuilder.vue";
import HutangFilterPopup from "./HutangFilterPopup.vue";

const HUTANG_PAGE_CACHE = "__hutangPageCache";

const props = defineProps({
  title: String,
  type: String, // 'kartu', 'sisa', etc.
  storeModule: String,
  initialPerkiraan: String,
  mergeColumns: { type: Array, default: () => [] },
});

const store = useStore();
const route = useRoute();

const showFilter = ref(false);
const activeFilter = ref(null);

// Snapshot data milik instance ini. Store per jenis laporan Hutang
// ("kartuutang", "sisautang", dst.) memang sudah terpisah satu sama lain,
// tapi snapshot lokal tetap dipakai supaya tampilan tidak "reset" ke popup
// filter saat tab-nya sempat tercoret dari cache keep-alive (mis. karena
// jumlah tab terbuka banyak) lalu dibuka lagi.
const localData = ref([]);
const localKeyfield = ref("id");
const localPerusahaan = ref(null);
const localSumcolom = ref([]);
const localAvgcolom = ref([]);
const localSqlQuery = ref("");
const hasLoaded = ref(false);

const dataSource = computed(() =>
  hasLoaded.value ? localData.value : store.getters[`${props.storeModule}/reportList`] || [],
);
const isLoading = computed(() => store.getters[`${props.storeModule}/isLoading`] || false);
const keyfield = computed(() =>
  hasLoaded.value ? localKeyfield.value : store.getters[`${props.storeModule}/keyfield`] || "id",
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
  return (
    store.getters[`${props.storeModule}/perusahaan`] ||
    store.getters["finance/perusahaan"] ||
    store.state.auth?.user?.company ||
    null
  );
});
const companyName = computed(() => perusahaan.value?.namaperusahaan || "PT SUMBER LOGAM");
const companyAddress = computed(() => [perusahaan.value?.alamat1, perusahaan.value?.alamat2].filter(Boolean).join(" "));
const companyPhone = computed(() => perusahaan.value?.telpon || "");
const userName = computed(() => store.state.auth?.user?.name || "admin");

const periodLabel = computed(() => {
  if (!activeFilter.value) return "Semua Periode";
  const options = { day: "numeric", month: "short", year: "numeric" };
  const start = new Date(activeFilter.value.mulaitgl);
  const end = new Date(activeFilter.value.sampaitgl);
  return `${start.toLocaleDateString("id-ID", options)} - ${end.toLocaleDateString("id-ID", options)}`;
});

function loadData(payload) {
  activeFilter.value = payload;
  return store.dispatch(`${props.storeModule}/getReport`, payload).then(() => {
    localData.value = store.getters[`${props.storeModule}/reportList`] || [];
    localKeyfield.value = store.getters[`${props.storeModule}/keyfield`] || "id";
    localPerusahaan.value = store.getters[`${props.storeModule}/perusahaan`] || null;
    localSumcolom.value = store.getters[`${props.storeModule}/sumcolom`] || [];
    localAvgcolom.value = store.getters[`${props.storeModule}/avgcolom`] || [];
    localSqlQuery.value = store.getters[`${props.storeModule}/ketsp`] || "";
    hasLoaded.value = true;
  });
}

function handleApplyFilter(payload) {
  showFilter.value = false;
  loadData(payload);
}
function handleClosePopup() {
  showFilter.value = false;
}
function openFilter() {
  showFilter.value = true;
}

function savePageSnapshot() {
  if (!hasLoaded.value) return;
  window[HUTANG_PAGE_CACHE] = window[HUTANG_PAGE_CACHE] || {};
  window[HUTANG_PAGE_CACHE][props.storeModule] = {
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
  localKeyfield.value = snapshot.localKeyfield || "id";
  localPerusahaan.value = snapshot.localPerusahaan || null;
  localSumcolom.value = snapshot.localSumcolom || [];
  localAvgcolom.value = snapshot.localAvgcolom || [];
  localSqlQuery.value = snapshot.localSqlQuery || "";
  activeFilter.value = snapshot.activeFilter || null;
  hasLoaded.value = true;
}

// Inisialisasi: kalau ada snapshot tersisa milik storeModule ini, pulihkan
// tanpa menampilkan popup filter lagi. Kalau tidak ada, ini pembukaan
// pertama (atau instance baru setelah keep-alive miss tanpa data) sehingga
// popup filter perlu tampil.
const myRoutePath = route.path;
window[HUTANG_PAGE_CACHE] = window[HUTANG_PAGE_CACHE] || {};
const cachedPage = window[HUTANG_PAGE_CACHE][props.storeModule];
if (cachedPage) {
  restorePageSnapshot(cachedPage);
} else {
  showFilter.value = true;
}

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
  if (!isTabStillOpen && window[HUTANG_PAGE_CACHE]) {
    delete window[HUTANG_PAGE_CACHE][props.storeModule];
  }
});
</script>

<style scoped>
.hutang-base-container {
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
  height: 27px;
  border: 1px solid var(--layout-sidebar-accent);
  transition: all 0.2s ease;
}
.rb-btn--filter:hover {
  background-color: #ffffff !important;
  border-color: #ffffff;
  color: var(--layout-sidebar-bg) !important;
  transform: translateY(-1px);
}
.rb-btn--filter:active {
  transform: scale(0.97);
}
.filter-icon-span {
  font-size: 16px;
  line-height: 1;
}
</style>
