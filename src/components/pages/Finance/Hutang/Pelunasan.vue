<template>
  <HutangBase
    title="Pelunasan"
    type="pelunasan"
    storeModule="pelunasanutang"
    initialPerkiraan="310.01"
  />
</template>

<script setup>
import HutangBase from "./HutangBase.vue";
defineOptions({
  name: "PelunasanHutang",
});
</script>
