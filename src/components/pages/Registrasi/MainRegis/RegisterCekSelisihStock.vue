<template>
  <RegisterBase
    title="Register Cek Selisih Stock"
    type="cekselisihstock"
    storeModule="registercekselisihstock"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterCekSelisihStock",
  components: { RegisterBase },
};
</script>
