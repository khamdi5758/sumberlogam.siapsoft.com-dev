<template>
  <AccountingBase
    title="Neraca"
    popupTitle="Neraca"
    type="neraca"
    storeModule="neraca"
    loadAction="getNeraca"
    listGetter="neracaList"
    storageKey="accounting-neraca"
    fileName="neraca"
  />
</template>

<script setup>
import AccountingBase from "../AccountingBase.vue";

defineOptions({
  name: "AccountingNeraca",
});
</script>
