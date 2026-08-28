<template>
  <RegisterBase
    title="Register Kirim Jasa Luar"
    type="kirimjasaluar"
    storeModule="registerkirimjasaluar"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterKirimJasaLuar",
  components: { RegisterBase },
};
</script>
