<template>
  <MasterBase
    title="Golongan Stock"
    type="golongan"
    storeModule="masterinventorystockgolongan"
    apiEndpoint="report"
  />
</template>

<script>
import MasterBase from "@/components/pages/master/MasterBase.vue";
export default {
  name: "MasterGolongan",
  components: { MasterBase },
};
</script>
