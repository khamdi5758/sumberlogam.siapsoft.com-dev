<template>
  <HutangBase
    title="Umur"
    type="umur"
    storeModule="umurutang"
    initialPerkiraan="310.01"
  />
</template>

<script setup>
import HutangBase from "./HutangBase.vue";
defineOptions({
  name: "UmurHutang",
});
</script>
