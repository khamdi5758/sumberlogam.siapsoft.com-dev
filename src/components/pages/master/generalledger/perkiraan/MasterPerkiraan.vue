<template>
  <MasterBase
    title="Perkiraan"
    type="perkiraan"
    storeModule="mastergeneralledgerperkiraan"
    apiEndpoint="report"
  />
</template>

<script>
import MasterBase from "@/components/pages/master/MasterBase.vue";
export default {
  name: "MasterPerkiraan",
  components: { MasterBase },
};
</script>
