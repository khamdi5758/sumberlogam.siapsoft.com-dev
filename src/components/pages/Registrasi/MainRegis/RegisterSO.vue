<template>
  <RegisterBase
    title="Register SO"
    type="so"
    storeModule="registerSO"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterSO",
  components: { RegisterBase },
};
</script>
