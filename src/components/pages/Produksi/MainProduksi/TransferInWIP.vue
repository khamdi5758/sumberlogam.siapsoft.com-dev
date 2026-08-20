<template>
  <ProduksiBase
    title="Transfer In WIP"
    type="tfinwip"
    endpoint="produksi/tfinwip"
    storeModule="produksi"
    storageKey="produksi-tfinwip"
    fileName="transfer-in-wip"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "TransferInWIP",
  components: { ProduksiBase },
};
</script>
