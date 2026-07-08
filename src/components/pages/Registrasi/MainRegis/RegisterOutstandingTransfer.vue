<template>
  <RegisterBase
    title="Register Outstanding Transfer"
    type="outstanding-transfer"
    storeModule="registeroutstandingtransfer"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterOutstandingTransfer",
  components: { RegisterBase },
};
</script>
