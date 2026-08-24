<template>
  <MasterBase
    title="Karyawan"
    type="karyawan"
    storeModule="masterkaryawan"
    apiEndpoint="report"
  />
</template>

<script>
import MasterBase from "@/components/pages/master/MasterBase.vue";
export default {
  name: "MasterKaryawan",
  components: { MasterBase },
};
</script>
