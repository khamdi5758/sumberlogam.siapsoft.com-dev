<template>
  <ProduksiBase
    title="Koreksi Produksi"
    type="koreksi"
    endpoint="produksi/koreksi"
    storeModule="produksi"
    storageKey="produksi-koreksi"
    fileName="koreksi-produksi"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "KoreksiProduksi",
  components: { ProduksiBase },
};
</script>
