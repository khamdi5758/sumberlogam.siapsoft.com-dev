<template>
  <MasterBase
    title="Tipe Perkiraan"
    type="perkiraantipe"
    storeModule="mastergeneralledgerperkiraantipe"
    apiEndpoint="report"
  />
</template>

<script>
import MasterBase from "@/components/pages/master/MasterBase.vue";
export default {
  name: "MasterPerkiraanTipe",
  components: { MasterBase },
};
</script>
