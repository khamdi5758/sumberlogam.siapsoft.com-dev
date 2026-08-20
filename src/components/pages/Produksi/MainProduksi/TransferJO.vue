<template>
  <ProduksiBase
    title="Transfer JO"
    type="tfjo"
    endpoint="produksi/tfjo"
    storeModule="produksi"
    storageKey="produksi-tfjo"
    fileName="transfer-jo"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "TransferJO",
  components: { ProduksiBase },
};
</script>
