<template>
  <AccountingBase
    title="Laporan Jurnal"
    type="jurnal"
    storeModule="jurnal"
    loadAction="getJurnal"
    listGetter="jurnalList"
    storageKey="accounting-jurnal"
    fileName="laporan-jurnal"
  />
</template>

<script setup>
import AccountingBase from "../AccountingBase.vue";

defineOptions({
  name: "AccountingJurnal",
});
</script>
