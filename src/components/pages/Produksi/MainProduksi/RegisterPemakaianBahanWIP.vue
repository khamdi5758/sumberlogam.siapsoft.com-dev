<template>
  <ProduksiBase
    title="Register Pemakaian Bahan WIP"
    type="register-pemakaianbahanwip"
    endpoint="produksi/pemakaianbahan"
    storeModule="produksi"
    storageKey="produksi-register-pemakaianbahanwip"
    fileName="register-pemakaian-bahan-wip"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "RegisterPemakaianBahanWIP",
  components: { ProduksiBase },
};
</script>
