<template>
  <ProduksiBase
    title="Register Transfer Out WIP"
    type="register-tfoutwip"
    endpoint="produksi/tfoutwip"
    storeModule="produksi"
    storageKey="produksi-register-tfoutwip"
    fileName="register-transfer-out-wip"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "RegisterTransferOutWIP",
  components: { ProduksiBase },
};
</script>
