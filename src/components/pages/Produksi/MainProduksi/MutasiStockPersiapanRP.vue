<template>
  <ProduksiBase
    title="Mutasi Stock Persiapan (Qnt & Rupiah)"
    type="mutstockrp"
    endpoint="produksi/mutstockrp"
    storeModule="produksi"
    storageKey="produksi-mutstockrp"
    fileName="mutasi-stock-persiapan-rp"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "MutasiStockPersiapanRP",
  components: { ProduksiBase },
};
</script>
