<template>
  <ProduksiBase
    title="Register Transfer JO"
    type="register-tfjo"
    endpoint="produksi/tfjo"
    storeModule="produksi"
    storageKey="produksi-register-tfjo"
    fileName="register-transfer-jo"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "RegisterTransferJO",
  components: { ProduksiBase },
};
</script>
