<template>
  <PiutangBase
    title="Umur"
    type="umur"
    storeModule="umurpiutang"
    initialPerkiraan="130.01"
  />
</template>

<script setup>
import PiutangBase from "./PiutangBase.vue";
defineOptions({
  name: "UmurPiutang",
});
</script>
