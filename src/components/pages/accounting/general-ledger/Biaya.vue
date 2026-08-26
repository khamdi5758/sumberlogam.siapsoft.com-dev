<template>
  <AccountingBase
    title="Biaya"
    type="biaya"
    storeModule="biaya"
    loadAction="getBiaya"
    listGetter="biayaList"
    storageKey="accounting-biaya"
    fileName="biaya"
  />
</template>

<script setup>
import AccountingBase from "../AccountingBase.vue";

defineOptions({
  name: "AccountingBiaya",
});
</script>
