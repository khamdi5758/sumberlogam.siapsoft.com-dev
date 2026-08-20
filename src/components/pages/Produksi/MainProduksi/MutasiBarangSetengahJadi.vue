<template>
  <ProduksiBase
    title="Mutasi Barang Setengah Jadi"
    type="mutsetjadi"
    endpoint="produksi/mutsetjadi"
    storeModule="produksi"
    storageKey="produksi-mutsetjadi"
    fileName="mutasi-barang-setengah-jadi"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "MutasiBarangSetengahJadi",
  components: { ProduksiBase },
};
</script>
