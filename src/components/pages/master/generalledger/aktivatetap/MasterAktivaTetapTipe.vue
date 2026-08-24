<template>
  <MasterBase
    title="Tipe Aktiva Tetap"
    type="tipeaktivatetap"
    storeModule="mastergeneralledgeraktivatetaptipe"
    apiEndpoint="report"
  />
</template>

<script>
import MasterBase from "@/components/pages/master/MasterBase.vue";
export default {
  name: "MasterAktivaTetapTipe",
  components: { MasterBase },
};
</script>
