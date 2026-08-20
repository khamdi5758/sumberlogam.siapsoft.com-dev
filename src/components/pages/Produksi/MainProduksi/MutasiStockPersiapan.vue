<template>
  <ProduksiBase
    title="Mutasi Stock Persiapan"
    type="mutstock"
    endpoint="produksi/mutstock"
    storeModule="produksi"
    storageKey="produksi-mutstock"
    fileName="mutasi-stock-persiapan"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "MutasiStockPersiapan",
  components: { ProduksiBase },
};
</script>
