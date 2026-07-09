<template>
  <RegisterBase
    title="Register SO"
    type="so"
    storeModule="registerso"
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
