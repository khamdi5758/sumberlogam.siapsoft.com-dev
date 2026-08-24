<template>
  <MasterBase
    title="Giro Diterima"
    type="giroditerima"
    storeModule="mastergeneralledgergiroditerima"
    apiEndpoint="report"
  />
</template>

<script>
import MasterBase from "@/components/pages/master/MasterBase.vue";
export default {
  name: "MasterGiroDiterima",
  components: { MasterBase },
};
</script>
