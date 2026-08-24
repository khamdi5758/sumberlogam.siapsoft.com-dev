<template>
  <PiutangBase
    title="Pelunasan"
    type="pelunasan"
    storeModule="pelunasanpiutang"
    initialPerkiraan="130.01"
  />
</template>

<script setup>
import PiutangBase from "./PiutangBase.vue";
defineOptions({
  name: "PelunasanPiutang",
});
</script>
