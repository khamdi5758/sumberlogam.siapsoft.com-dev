<template>
  <FinanceBase
    title="Rekap Kas Bank"
    popupTitle="Filter Rekap Kas Bank"
    type="rekapkasbank"
    :dataSource="rekapData"
    :defaultExpandedKeys="[]"
    :autoOpenFilter="true"
    :showContentInitially="false"
    submitButtonText="Go"
    @filter-change="handleFilterChange"
  />
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import FinanceBase from "@/components/pages/Finance/FinanceBase.vue";

defineOptions({
  name: "RekapKasBank",
});

const store = useStore();

const rekapData = computed(() => store.getters["rekapkasbank/rekapkasbankList"] || []);

const handleFilterChange = (filterData) => {
  store.dispatch("rekapkasbank/getRekapkasbank", filterData);
};
</script>
