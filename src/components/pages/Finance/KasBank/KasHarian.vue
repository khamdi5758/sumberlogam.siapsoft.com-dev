<template>
  <FinanceBase
    title="Kas Harian"
    popupTitle="Filter Kas Harian"
    type="kasharian"
    :dataSource="kasHarianData"
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

defineOptions({
  name: "KasHarian",
});

const kasHarianData = ref([
  {
    id: 1,
    parentId: 0,
    accountName: "KAS & BANK",
    amount: 155000000,
    amountBulanLalu: 140000000,
    type: "header",
  },
  {
    id: 11,
    parentId: 1,
    accountName: "Kas Kecil",
    amount: 120000000,
    amountBulanLalu: 110000000,
    type: "detail",
  },
  {
    id: 12,
    parentId: 1,
    accountName: "Bank BCA",
    amount: 35000000,
    amountBulanLalu: 30000000,
    type: "detail",
  },
  {
    id: 13,
    parentId: 1,
    accountName: "Bank Mandiri",
    amount: 25000000,
    amountBulanLalu: 22000000,
    type: "detail",
  },
  {
    id: 19,
    parentId: 1,
    accountName: "Total Kas & Bank",
    amount: 180000000,
    amountBulanLalu: 162000000,
    type: "subtotal",
  },
]);

const handleFilterChange = (filterData) => {
  console.log("Kas Bank Harian Filter Change:", filterData);
  // Logika fetch data Kas Bank Harian berdasarkan filter
};
</script>
