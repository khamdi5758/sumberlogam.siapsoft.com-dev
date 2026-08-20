<template>
  <ProduksiBase
    title="Register Transfer Barang Jadi"
    type="register-tfbarangjadi"
    endpoint="produksi/tfbarangjadi"
    storeModule="produksi"
    storageKey="produksi-register-tfbarangjadi"
    fileName="register-transfer-barang-jadi"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "RegisterTransferBrgJadi",
  components: { ProduksiBase },
};
</script>
