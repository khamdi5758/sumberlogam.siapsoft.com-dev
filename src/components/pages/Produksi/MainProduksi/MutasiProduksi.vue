<template>
  <ProduksiBase
    title="Mutasi Produksi"
    type="mutasi"
    endpoint="produksi/mutasi"
    storeModule="produksi"
    storageKey="produksi-mutasi"
    fileName="mutasi-produksi"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "MutasiProduksi",
  components: { ProduksiBase },
};
</script>
