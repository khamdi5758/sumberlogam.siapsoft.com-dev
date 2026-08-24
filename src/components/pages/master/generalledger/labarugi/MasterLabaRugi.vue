<template>
  <MasterBase
    title="Laba Rugi"
    type="labarugi"
    storeModule="mastergeneralledgerlabarugi"
    apiEndpoint="report"
  />
</template>

<script>
import MasterBase from "@/components/pages/master/MasterBase.vue";
export default {
  name: "MasterLabaRugi",
  components: { MasterBase },
};
</script>
