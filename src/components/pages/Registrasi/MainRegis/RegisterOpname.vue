<template>
  <RegisterBase
    title="Register Opname"
    type="opname"
    storeModule="registeropname"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterOpname",
  components: { RegisterBase },
};
</script>
