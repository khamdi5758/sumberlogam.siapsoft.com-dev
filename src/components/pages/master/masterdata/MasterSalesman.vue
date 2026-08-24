<template>
  <MasterBase
    title="Salesman"
    type="salesman"
    storeModule="mastersalesman"
    apiEndpoint="report"
  />
</template>

<script>
import MasterBase from "@/components/pages/master/MasterBase.vue";
export default {
  name: "MasterSalesman",
  components: { MasterBase },
};
</script>
