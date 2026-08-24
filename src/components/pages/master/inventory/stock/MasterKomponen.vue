<template>
  <MasterBase
    title="Komponen Stock"
    type="komponen"
    storeModule="masterinventorystockkomponen"
    apiEndpoint="report"
  />
</template>

<script>
import MasterBase from "@/components/pages/master/MasterBase.vue";
export default {
  name: "MasterKomponen",
  components: { MasterBase },
};
</script>
