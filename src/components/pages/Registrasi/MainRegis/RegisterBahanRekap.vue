<template>
  <RegisterBase
    title="Register Bahan Rekap"
    type="bahanrekap"
    storeModule="registerbahanrekap"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterBahanRekap",
  components: { RegisterBase },
};
</script>
