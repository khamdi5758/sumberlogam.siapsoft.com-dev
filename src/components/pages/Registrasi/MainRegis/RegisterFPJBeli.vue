<template>
  <RegisterBase
    title="Register FPJ Beli"
    type="fpjbeli"
    storeModule="registerfpjbeli"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterFPJBeli",
  components: { RegisterBase },
};
</script>
