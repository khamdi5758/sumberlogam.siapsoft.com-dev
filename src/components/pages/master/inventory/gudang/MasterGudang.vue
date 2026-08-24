<template>
  <MasterBase
    title="Gudang"
    type="gudang"
    storeModule="masterinventorygudang"
    apiEndpoint="report"
  />
</template>

<script>
import MasterBase from "@/components/pages/master/MasterBase.vue";
export default {
  name: "MasterGudang",
  components: { MasterBase },
};
</script>
