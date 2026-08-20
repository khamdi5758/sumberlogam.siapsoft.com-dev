<template>
  <ProduksiBase
    title="Pemakaian Bahan"
    type="pemakaianbahan"
    endpoint="produksi/pemakaianbahan"
    storeModule="produksi"
    storageKey="produksi-pemakaianbahan"
    fileName="pemakaian-bahan"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "PemakaianBahan",
  components: { ProduksiBase },
};
</script>
