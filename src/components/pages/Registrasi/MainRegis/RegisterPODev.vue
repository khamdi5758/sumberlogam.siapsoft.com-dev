<template>
  <RegisterBase
    title="Register PO Dev"
    type="po"
    storeModule="register"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterPODev",
  components: { RegisterBase },
};
</script>
