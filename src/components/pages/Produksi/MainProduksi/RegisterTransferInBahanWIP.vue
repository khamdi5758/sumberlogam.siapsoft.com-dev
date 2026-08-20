<template>
  <ProduksiBase
    title="Register Transfer In Bahan WIP"
    type="register-tfinbahanwip"
    endpoint="produksi/tfinwip"
    storeModule="produksi"
    storageKey="produksi-register-tfinbahanwip"
    fileName="register-transfer-in-bahan-wip"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "RegisterTransferInBahanWIP",
  components: { ProduksiBase },
};
</script>
