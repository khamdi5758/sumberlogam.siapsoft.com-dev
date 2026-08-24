<template>
  <MasterBase
    title="Stock Barang"
    type="stockbarang"
    storeModule="masterinventorystockbarang"
    apiEndpoint="report"
  />
</template>

<script>
import MasterBase from "@/components/pages/master/MasterBase.vue";
export default {
  name: "MasterStockBarang",
  components: { MasterBase },
};
</script>
