<template>
  <AccountingBase
    title="Neraca Lajur"
    popupTitle="Neraca Lajur"
    type="neracalajur"
    storeModule="neracalajur"
    loadAction="getNeracalajur"
    listGetter="neracalajurList"
    storageKey="accounting-neracalajur"
    fileName="neraca-lajur"
  />
</template>

<script setup>
import AccountingBase from "../AccountingBase.vue";

defineOptions({
  name: "AccountingNeracaLajur",
});
</script>
