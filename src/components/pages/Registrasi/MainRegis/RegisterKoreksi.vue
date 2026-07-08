<template>
  <RegisterBase
    title="Register Koreksi"
    type="koreksi"
    storeModule="registerkoreksi"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterKoreksi",
  components: { RegisterBase },
};
</script>
