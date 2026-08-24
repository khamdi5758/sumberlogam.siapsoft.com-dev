<template>
  <MasterBase
    title="Supplier"
    type="supplier"
    storeModule="mastersupplier"
    apiEndpoint="report"
  />
</template>

<script>
import MasterBase from "@/components/pages/master/MasterBase.vue";
export default {
  name: "MasterSupplier",
  components: { MasterBase },
};
</script>
