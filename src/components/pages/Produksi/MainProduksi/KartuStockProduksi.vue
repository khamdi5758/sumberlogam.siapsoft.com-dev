<template>
  <ProduksiBase
    title="Kartu Stock Produksi"
    type="kartustock"
    endpoint="produksi/kartustock"
    storeModule="produksi"
    storageKey="produksi-kartustock"
    fileName="kartu-stock-produksi"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "KartuStockProduksi",
  components: { ProduksiBase },
};
</script>
