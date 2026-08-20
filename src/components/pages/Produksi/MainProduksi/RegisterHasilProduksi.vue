<template>
  <ProduksiBase
    title="Register Hasil Produksi"
    type="register-hasil"
    endpoint="produksi/hasil"
    storeModule="produksi"
    storageKey="produksi-register-hasil"
    fileName="register-hasil-produksi"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "RegisterHasilProduksi",
  components: { ProduksiBase },
};
</script>
