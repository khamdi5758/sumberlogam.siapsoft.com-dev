<template>
  <RegisterBase
    title="Register Outstanding PO"
    type="outstanding-po"
    storeModule="registeroutstandingpo"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterOutstandingPO",
  components: { RegisterBase },
};
</script>
