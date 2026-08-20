<template>
  <ProduksiBase
    title="Transfer Out WIP"
    type="tfoutwip"
    endpoint="produksi/tfoutwip"
    storeModule="produksi"
    storageKey="produksi-tfoutwip"
    fileName="transfer-out-wip"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "TransferOutWIP",
  components: { ProduksiBase },
};
</script>
