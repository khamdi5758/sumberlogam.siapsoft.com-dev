<template>
  <RegisterBase
    title="Register Jurnal"
    type="jurnal"
    storeModule="registerjurnal"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterJurnal",
  components: { RegisterBase },
};
</script>
