<template>
  <MasterBase
    title="Merk Stock"
    type="merk"
    storeModule="masterinventorystockmerk"
    apiEndpoint="report"
  />
</template>

<script>
import MasterBase from "@/components/pages/master/MasterBase.vue";
export default {
  name: "MasterMerk",
  components: { MasterBase },
};
</script>
