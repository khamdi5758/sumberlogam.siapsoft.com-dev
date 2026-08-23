<template>
  <KartuBase
    title="Kartu Hutang"
    type="hutang"
    storeModule="kartuutang"
    initialPerkiraan="310.01"
  />
</template>

<script setup>
import KartuBase from "./KartuBase.vue";
defineOptions({
  name: "KartuHutang",
});
</script>
