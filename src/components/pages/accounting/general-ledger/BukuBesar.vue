<template>
  <AccountingBase
    title="Buku Besar"
    popupTitle="Buku Tambahan"
    type="bukubesar"
    storeModule="bukubesar"
    loadAction="getBukuBesar"
    listGetter="bukubesarList"
    storageKey="accounting-bukubesar"
    fileName="buku-besar"
  />
</template>

<script setup>
import AccountingBase from "../AccountingBase.vue";

defineOptions({
  name: "AccountingBukuBesar",
});
</script>
