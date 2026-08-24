<template>
  <PiutangBase
    title="Sisa"
    type="sisa"
    storeModule="sisapiutang"
    initialPerkiraan="130.01"
  />
</template>

<script setup>
import PiutangBase from "./PiutangBase.vue";
defineOptions({
  name: "SisaPiutang",
});
</script>
