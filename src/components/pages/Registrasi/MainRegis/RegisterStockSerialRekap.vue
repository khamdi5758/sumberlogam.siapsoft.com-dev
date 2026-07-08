<template>
  <RegisterBase
    title="Register Serial Rekap"
    type="stock-serial-rekap"
    storeModule="registerstockserialrekap"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterStockSerialRekap",
  components: { RegisterBase },
};
</script>
