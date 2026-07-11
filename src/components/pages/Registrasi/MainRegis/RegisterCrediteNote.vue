<template>
  <RegisterBase
    title="Register Credite Note"
    type="creditenote"
    storeModule="registercreditenote"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/registerbase.vue";
export default {
  name: "RegisterCrediteNote",
  components: { RegisterBase },
};
</script>
