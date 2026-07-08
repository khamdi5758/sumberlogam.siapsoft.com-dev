<template>
  <RegisterBase
    title="Register Outstanding SO"
    type="outstanding-so"
    storeModule="registeroutstandingso"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterOutstandingSO",
  components: { RegisterBase },
};
</script>
