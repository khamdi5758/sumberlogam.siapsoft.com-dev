<template>
  <RegisterBase
    title="Register PO Dev"
    type="po"
    storeModule="register"
    apiEndpoint="report"
    layoutMode="paper"
    paperOrientation="landscape"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterPODev",
  components: { RegisterBase },
};
</script>
