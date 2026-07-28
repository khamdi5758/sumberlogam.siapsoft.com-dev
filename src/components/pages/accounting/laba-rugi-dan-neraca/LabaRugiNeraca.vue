<template>
  <AccountingBase
    title="Laporan Laba Rugi dan Neraca"
    type="laba-rugi-neraca"
    :dataSource="plData"
    :defaultExpandedKeys="[1, 2, 4]"
    @filter-change="handleFilterChange"
  />
</template>

<script setup>
import { ref } from "vue";
import AccountingBase from "../AccountingBase.vue";

defineOptions({
  name: "LabaRugiNeraca",
});

const plData = ref([
  { id: 1, parentId: 0, accountName: "PENDAPATAN", amount: 155000000, type: "header" },
  { id: 11, parentId: 1, accountName: "Pendapatan Jasa Web", amount: 120000000, type: "detail" },
  { id: 12, parentId: 1, accountName: "Pendapatan Server/Hosting", amount: 35000000, type: "detail" },
  { id: 19, parentId: 1, accountName: "Total Pendapatan", amount: 155000000, type: "subtotal" },
  { id: 2, parentId: 0, accountName: "HARGA POKOK PENJUALAN (HPP)", amount: 25000000, type: "header" },
  { id: 21, parentId: 2, accountName: "Biaya Server AWS", amount: 20000000, type: "detail" },
  { id: 22, parentId: 2, accountName: "Lisensi Software", amount: 5000000, type: "detail" },
  { id: 29, parentId: 2, accountName: "Total HPP", amount: 25000000, type: "subtotal" },
  { id: 3, parentId: 0, accountName: "LABA KOTOR", amount: 130000000, type: "grandtotal" },
  { id: 4, parentId: 0, accountName: "BEBAN OPERASIONAL", amount: 70000000, type: "header" },
  { id: 41, parentId: 4, accountName: "Gaji Karyawan", amount: 45000000, type: "detail" },
  { id: 42, parentId: 4, accountName: "Sewa Kantor", amount: 10000000, type: "detail" },
  { id: 43, parentId: 4, accountName: "Biaya Marketing", amount: 15000000, type: "detail" },
  { id: 49, parentId: 4, accountName: "Total Beban Operasional", amount: 70000000, type: "subtotal" },
  { id: 5, parentId: 0, accountName: "LABA BERSIH", amount: 60000000, type: "netprofit" }
]);

const handleFilterChange = (filterData) => {
  console.log("PL Filter Change:", filterData);
  // Logika fetch data PL sesuai filter
};
</script>
