<template>
  <ProduksiBase
    title="Hasil Produksi"
    type="hasil"
    endpoint="produksi/hasil"
    storeModule="produksi"
    storageKey="produksi-hasil"
    fileName="hasil-produksi"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "HasilProduksi",
  components: { ProduksiBase },
};
</script>
