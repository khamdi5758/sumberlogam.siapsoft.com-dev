<template>
  <HutangBase
    title="Kartu Hutang"
    type="kartu"
    storeModule="kartuutang"
    initialPerkiraan="310.01"
  />
</template>

<script setup>
import HutangBase from "./HutangBase.vue";
defineOptions({
  name: "KartuHutang",
});
</script>
