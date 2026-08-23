<template>
  <PiutangBase
    title="Kartu Piutang"
    type="kartu"
    storeModule="kartupiutang"
    initialPerkiraan="130.01"
  />
</template>

<script setup>
import PiutangBase from "./PiutangBase.vue";
defineOptions({
  name: "KartuPiutang",
});
</script>
