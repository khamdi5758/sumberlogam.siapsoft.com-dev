<template>
  <RegisterBasePoDev
    title="Register PO Dev"
    type="po"
    storeModule="register"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBasePoDev from "@/components/pages/Registrasi/RegisterBasePoDev.vue";
export default {
  name: "RegisterPoDev",
  components: { RegisterBasePoDev },
};
</script>
