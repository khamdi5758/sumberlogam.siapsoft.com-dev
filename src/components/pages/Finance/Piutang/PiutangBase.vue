<template>
  <div class="piutang-base-container">
    <div v-if="isLoading" class="fixed inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] z-50">
      <div class="rounded-xl bg-white/80 p-4 shadow-lg backdrop-blur-sm">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    </div>

    <ReportGridBuilder
      ref="gridBuilderRef"
      :dataSource="dataSource"
      :keyExpr="keyfield"
      :companyName="companyName"
      :companyAddress="companyAddress"
      :companyPhone="companyPhone"
      :reportTitle="title"
      :periodLabel="periodLabel"
      :userName="userName"
      :storageKey="'report-piutang-' + type"
      :fileName="'report-piutang-' + type"
    >
      <template #extra-tools>
        <button class="rb-btn rb-btn--filter" title="Filter Data" @click="showFilter = true">
          <span class="filter-icon-span">&#9906;</span> Filter
        </button>
      </template>
    </ReportGridBuilder>

    <PiutangFilterPopup
      v-if="showFilter"
      :visible="showFilter"
      :title="title"
      :type="type"
      :initialPerkiraan="initialPerkiraan"
      @apply="handleApplyFilter"
      @close="showFilter = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import ReportGridBuilder from "@/components/pages/Registrasi/ReportGridBuilder.vue";
import PiutangFilterPopup from "./PiutangFilterPopup.vue";

const props = defineProps({
  title: String,
  type: String, // 'kartu', 'sisa', etc.
  storeModule: String,
  initialPerkiraan: String,
});

const store = useStore();
const showFilter = ref(true);
const activeFilter = ref(null);

const dataSource = computed(() => store.getters[`${props.storeModule}/reportList`] || []);
const isLoading = computed(() => store.getters[`${props.storeModule}/isLoading`] || false);
const keyfield = computed(() => store.getters[`${props.storeModule}/keyfield`] || "id");

const perusahaan = computed(() => store.getters["finance/perusahaan"] || store.state.auth?.user?.company || null);
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

const handleApplyFilter = (payload) => {
  showFilter.value = false;
  activeFilter.value = payload;
  store.dispatch(`${props.storeModule}/getReport`, payload);
};
</script>

<style scoped>
.piutang-base-container {
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
