<template>
  <FinanceBase
    title="Kas Bank Harian"
    popupTitle="Filter Kas Bank Harian"
    type="bankharian"
    :dataSource="bankHarianData"
    :defaultExpandedKeys="[1]"
    :autoOpenFilter="true"
    :showContentInitially="false"
    submitButtonText="Cetak"
    perkiraanMode="single"
    perkiraanBrowseCode="02"
    @filter-change="handleFilterChange"
  />
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import FinanceBase from "@/components/pages/Finance/FinanceBase.vue";

defineOptions({
  name: "KasBankHarian",
});

const store = useStore();

const bankHarianData = computed(() => store.getters["bankharian/bankharianList"] || []);

const handleFilterChange = (filterData) => {
  store.dispatch("bankharian/getBankharian", filterData);
};
</script>
