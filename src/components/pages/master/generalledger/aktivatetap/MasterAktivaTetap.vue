<template>
  <MasterBase
    title="Aktiva Tetap"
    type="aktivatetap"
    storeModule="mastergeneralledgeraktivatetap"
    apiEndpoint="report"
  />
</template>

<script>
import MasterBase from "@/components/pages/master/MasterBase.vue";
export default {
  name: "MasterAktivaTetap",
  components: { MasterBase },
};
</script>
