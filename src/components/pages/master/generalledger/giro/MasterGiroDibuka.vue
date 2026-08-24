<template>
  <MasterBase
    title="Giro Dibuka"
    type="girodibuka"
    storeModule="mastergeneralledgergirodibuka"
    apiEndpoint="report"
  />
</template>

<script>
import MasterBase from "@/components/pages/master/MasterBase.vue";
export default {
  name: "MasterGiroDibuka",
  components: { MasterBase },
};
</script>
