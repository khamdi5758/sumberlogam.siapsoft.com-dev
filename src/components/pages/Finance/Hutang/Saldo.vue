<template>
  <HutangBase
    title="Saldo"
    type="saldo"
    storeModule="saldoutang"
    initialPerkiraan="310.01"
  />
</template>

<script setup>
import HutangBase from "./HutangBase.vue";
defineOptions({
  name: "SaldoHutang",
});
</script>
