<template>
  <ProduksiBase
    title="Register Koreksi Produksi"
    type="register-koreksi"
    endpoint="produksi/koreksi"
    storeModule="produksi"
    storageKey="produksi-register-koreksi"
    fileName="register-koreksi-produksi"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "RegisterKoreksiProduksi",
  components: { ProduksiBase },
};
</script>
