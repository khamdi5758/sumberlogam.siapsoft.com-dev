<template>
  <KartuBase
    title="Kartu Piutang"
    type="piutang"
    storeModule="kartupiutang"
    initialPerkiraan="130.01"
  />
</template>

<script setup>
import KartuBase from "./KartuBase.vue";
defineOptions({
  name: "KartuPiutang",
});
</script>
