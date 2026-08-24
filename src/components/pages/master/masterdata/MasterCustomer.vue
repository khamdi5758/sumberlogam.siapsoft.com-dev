<template>
  <MasterBase
    title="Customer"
    type="customer"
    storeModule="mastercustomer"
    apiEndpoint="report"
  />
</template>

<script>
import MasterBase from "@/components/pages/master/MasterBase.vue";
export default {
  name: "MasterCustomer",
  components: { MasterBase },
};
</script>
