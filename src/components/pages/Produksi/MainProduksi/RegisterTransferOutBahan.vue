<template>
  <ProduksiBase
    title="Register Transfer Out Bahan"
    type="register-tfoutbahan"
    endpoint="produksi/tfoutwip"
    storeModule="produksi"
    storageKey="produksi-register-tfoutbahan"
    fileName="register-transfer-out-bahan"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "RegisterTransferOutBahan",
  components: { ProduksiBase },
};
</script>
