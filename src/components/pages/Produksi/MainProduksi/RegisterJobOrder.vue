<template>
  <ProduksiBase
    title="JOB Order"
    type="joborder"
    endpoint="produksi/registerproduksi"
    storeModule="produksi"
    storageKey="produksi-register-joborder"
    fileName="job-order"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "RegisterJobOrder",
  components: { ProduksiBase },
};
</script>
