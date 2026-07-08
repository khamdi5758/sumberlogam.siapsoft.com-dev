<template>
  <RegisterBase
    title="Register Control Hutang"
    type="controlhutang"
    storeModule="registercontrolhutang"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterControlHutang",
  components: { RegisterBase },
};
</script>
