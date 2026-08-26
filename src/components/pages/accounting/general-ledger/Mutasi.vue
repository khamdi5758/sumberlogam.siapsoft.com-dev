<template>
  <AccountingBase
    title="Mutasi"
    type="mutasi"
    storeModule="mutasi"
    loadAction="getMutasi"
    listGetter="mutasiList"
    storageKey="accounting-mutasi"
    fileName="mutasi"
  />
</template>

<script setup>
import AccountingBase from "../AccountingBase.vue";

defineOptions({
  name: "AccountingMutasi",
});
</script>
