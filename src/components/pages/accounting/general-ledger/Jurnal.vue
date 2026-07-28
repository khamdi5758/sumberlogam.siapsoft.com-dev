<template>
  <AccountingBase
    title="Laporan Jurnal"
    type="jurnal"
    :dataSource="plData"
    :defaultExpandedKeys="[1]"
    :autoOpenFilter="true"
    :showContentInitially="false"
    submitButtonText="Cetak"
    @filter-change="handleFilterChange"
  />
</template>

<script setup>
import { ref } from "vue";
import AccountingBase from "../AccountingBase.vue";

defineOptions({
  name: "RegisterJurnal",
});

const plData = ref([
  { id: 1, parentId: 0, accountName: "KAS & BANK", amount: 155000000, amountBulanLalu: 140000000, type: "header" },
  { id: 11, parentId: 1, accountName: "Kas Kecil", amount: 120000000, amountBulanLalu: 110000000, type: "detail" },
  { id: 12, parentId: 1, accountName: "Bank BCA", amount: 35000000, amountBulanLalu: 30000000, type: "detail" },
  { id: 19, parentId: 1, accountName: "Total Kas & Bank", amount: 155000000, amountBulanLalu: 140000000, type: "subtotal" }
]);

const handleFilterChange = (filterData) => {
  console.log("Jurnal Filter Change:", filterData);
  // Logika fetch data Jurnal berdasarkan tanggal & jenis transaksi
};
</script>
