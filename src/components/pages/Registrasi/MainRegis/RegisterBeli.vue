<template>
  <RegisterBase
    title="Register Beli"
    type="beli"
    storeModule="registerbeli"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterBeli",
  components: { RegisterBase },
};
</script>
