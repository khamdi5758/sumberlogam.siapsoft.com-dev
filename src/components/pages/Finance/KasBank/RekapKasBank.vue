<template>
  <FinanceBase
    title="Rekap Kas Bank"
    popupTitle="Filter Rekap Kas Bank"
    type="rekapkasbank"
    :dataSource="rekapData"
    :defaultExpandedKeys="[]"
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
  name: "RekapKasBank",
});

const rekapData = ref([
  {
    id: 1,
    parentId: 0,
    accountName: "REKAP KAS BANK",
    amount: 175000000,
    amountBulanLalu: 160000000,
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
    amount: 20000000,
    amountBulanLalu: 20000000,
    type: "detail",
  },
  {
    id: 19,
    parentId: 1,
    accountName: "Total Rekap",
    amount: 175000000,
    amountBulanLalu: 160000000,
    type: "subtotal",
  },
]);

const handleFilterChange = (filterData) => {
  console.log("Rekap Kas Bank Filter Change:", filterData);
  // Logika fetch data Rekap Kas Bank
};
</script>
