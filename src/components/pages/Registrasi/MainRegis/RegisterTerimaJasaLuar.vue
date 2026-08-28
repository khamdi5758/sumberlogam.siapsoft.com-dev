<template>
  <RegisterBase
    title="Register Terima Jasa Luar"
    type="terimajasaluar"
    storeModule="registerterimajasaluar"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterTerimaJasaLuar",
  components: { RegisterBase },
};
</script>
