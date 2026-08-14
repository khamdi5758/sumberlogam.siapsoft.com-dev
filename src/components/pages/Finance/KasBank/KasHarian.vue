<template>
  <FinanceBase
    title="Kas Harian"
    popupTitle="Filter Kas Harian"
    type="kasharian"
    :dataSource="kasHarianData"
    :defaultExpandedKeys="[1]"
    :autoOpenFilter="true"
    :showContentInitially="false"
    perkiraanBrowseCode="01"
    submitButtonText="Go"
    @filter-change="handleFilterChange"
  />
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import FinanceBase from "@/components/pages/Finance/FinanceBase.vue";

defineOptions({
  name: "KasHarian",
});

const store = useStore();

const kasHarianData = computed(() => store.getters["kasharian/kasharianList"] || []);

const handleFilterChange = (filterData) => {
  store.dispatch("kasharian/getKasharian", filterData);
};
</script>
