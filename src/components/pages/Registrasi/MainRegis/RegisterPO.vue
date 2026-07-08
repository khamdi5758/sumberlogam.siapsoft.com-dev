<template>
  <RegisterBase
    title="Register PO"
    type="po"
    storeModule="register"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterPO",
  components: { RegisterBase },
};
</script>
