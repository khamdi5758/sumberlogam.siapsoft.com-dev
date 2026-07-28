<template>
  <AccountingBase
    title="Neraca"
    popupTitle="Neraca"
    type="neraca"
    :dataSource="plData"
    :defaultExpandedKeys="[1, 2]"
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
  name: "RegisterNeraca",
});

const plData = ref([
  { id: 1, parentId: 0, accountName: "AKTIVA (ASET)", amount: 350000000, amountBulanLalu: 310000000, type: "header" },
  { id: 11, parentId: 1, accountName: "Kas & Bank", amount: 155000000, amountBulanLalu: 140000000, type: "detail" },
  { id: 12, parentId: 1, accountName: "Piutang Usaha", amount: 120000000, amountBulanLalu: 110000000, type: "detail" },
  { id: 13, parentId: 1, accountName: "Persediaan Barang", amount: 75000000, amountBulanLalu: 60000000, type: "detail" },
  { id: 19, parentId: 1, accountName: "Total Aktiva", amount: 350000000, amountBulanLalu: 310000000, type: "subtotal" },
  { id: 2, parentId: 0, accountName: "PASIVA (KEWAJIBAN & MODAL)", amount: 350000000, amountBulanLalu: 310000000, type: "header" },
  { id: 21, parentId: 2, accountName: "Hutang Usaha", amount: 90000000, amountBulanLalu: 80000000, type: "detail" },
  { id: 22, parentId: 2, accountName: "Modal Saham", amount: 200000000, amountBulanLalu: 200000000, type: "detail" },
  { id: 23, parentId: 2, accountName: "Laba Ditahan", amount: 60000000, amountBulanLalu: 30000000, type: "detail" },
  { id: 29, parentId: 2, accountName: "Total Pasiva", amount: 350000000, amountBulanLalu: 310000000, type: "subtotal" }
]);

const handleFilterChange = (filterData) => {
  console.log("Neraca Filter Change:", filterData);
  // Logika fetch data Neraca
};
</script>
