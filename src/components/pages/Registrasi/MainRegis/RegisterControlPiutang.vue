<template>
  <RegisterBase
    title="Register Control Piutang"
    type="controlpiutang"
    storeModule="registercontrolpiutang"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterControlPiutang",
  components: { RegisterBase },
};
</script>
