<template>
  <FinanceBase
    title="Arus Kas"
    popupTitle="Filter Arus Kas"
    type="aruskas"
    :dataSource="arusKasData"
    :defaultExpandedKeys="[1]"
    :autoOpenFilter="true"
    :showContentInitially="false"
    submitButtonText="Cetak"
    @filter-change="handleFilterChange"
  />
</template>

<script setup>
import { ref } from "vue";
import FinanceBase from "@/components/pages/Finance/FinanceBase.vue";

defineOptions({ name: "ArusKas" });

const arusKasData = ref([
  // data contoh sesuai struktur yang dibutuhkan
]);

const handleFilterChange = (filterData) => {
  console.log("Arus Kas Filter:", filterData);
  // Panggil API dengan filterData (startDate, endDate, month, year)
};
</script>
