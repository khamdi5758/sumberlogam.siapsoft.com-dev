<template>
  <AccountingBase
    title="Aktiva Tetap"
    popupTitle="Aktiva"
    type="aktivatetap"
    storeModule="aktivatetap"
    loadAction="getAktivaTetap"
    listGetter="aktivaTetapList"
    storageKey="accounting-aktivatetap"
    fileName="aktiva-tetap"
  />
</template>

<script setup>
import AccountingBase from "../AccountingBase.vue";

defineOptions({
  name: "AccountingAktivaTetap",
});
</script>
