<template>
  <ProduksiBase
    title="Mutasi Barang Setengah Jadi (Qnt & Rupiah)"
    type="mutsetjadirp"
    endpoint="produksi/mutsetjadirp"
    storeModule="produksi"
    storageKey="produksi-mutsetjadirp"
    fileName="mutasi-barang-setengah-jadi-rp"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "MutasiBarangSetengahJadiRP",
  components: { ProduksiBase },
};
</script>
