<template>
  <RegisterBase
    title="Register Jual"
    type="jual"
    storeModule="registerjual"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterJual",
  components: { RegisterBase },
};
</script>
