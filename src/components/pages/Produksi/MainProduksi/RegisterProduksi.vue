<template>
  <ProduksiBase
    title="Register Produksi"
    type="register"
    endpoint="produksi/registerproduksi"
    storeModule="produksi"
    storageKey="produksi-register"
    fileName="register-produksi"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "RegisterProduksi",
  components: { ProduksiBase },
};
</script>
