<template>
  <RegisterBase
    title="Register Bahan"
    type="bahan"
    storeModule="registerbahan"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/registerbase.vue";
export default {
  name: "RegisterBahan",
  components: { RegisterBase },
};
</script>
