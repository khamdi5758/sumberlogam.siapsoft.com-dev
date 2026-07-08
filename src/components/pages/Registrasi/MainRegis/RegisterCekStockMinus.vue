<template>
  <RegisterBase
    title="Register Cek Stock Minus"
    type="cekstockminus"
    storeModule="registercekstockminus"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterCekStockMinus",
  components: { RegisterBase },
};
</script>
