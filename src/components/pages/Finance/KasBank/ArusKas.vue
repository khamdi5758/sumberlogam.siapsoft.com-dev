<template>
  <FinanceBase
    title="Arus Kas"
    popupTitle="Filter Arus Kas"
    type="aruskas"
    :dataSource="arusKasData"
    :defaultExpandedKeys="[1]"
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

defineOptions({ name: "ArusKas" });

const store = useStore();

const arusKasData = computed(() => store.getters["kasbankaruskas/aruskasList"] || []);

const handleFilterChange = (filterData) => {
  store.dispatch("kasbankaruskas/getAruskas", filterData);
};
</script>
