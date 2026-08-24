<template>
  <PiutangBase
    title="Saldo"
    type="saldo"
    storeModule="saldopiutang"
    initialPerkiraan="130.01"
  />
</template>

<script setup>
import PiutangBase from "./PiutangBase.vue";
defineOptions({
  name: "SaldoPiutang",
});
</script>
