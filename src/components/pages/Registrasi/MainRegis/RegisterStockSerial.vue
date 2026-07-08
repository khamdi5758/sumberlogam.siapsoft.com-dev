<template>
  <RegisterBase
    title="Register Stock Serial"
    type="stock-serial"
    storeModule="registerstockserial"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterStockSerial",
  components: { RegisterBase },
};
</script>
