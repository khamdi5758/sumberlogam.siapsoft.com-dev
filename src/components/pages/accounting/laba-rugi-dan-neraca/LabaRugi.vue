<template>
  <AccountingBase
    title="Laba Rugi"
    popupTitle="Laba Rugi"
    type="labarugi"
    storeModule="labarugi"
    loadAction="getLabarugi"
    listGetter="labarugiList"
    storageKey="accounting-labarugi"
    fileName="laba-rugi"
  />
</template>

<script setup>
import AccountingBase from "../AccountingBase.vue";

defineOptions({
  name: "AccountingLabaRugi",
});
</script>
