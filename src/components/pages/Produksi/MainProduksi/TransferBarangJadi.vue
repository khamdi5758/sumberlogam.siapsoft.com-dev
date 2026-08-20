<template>
  <ProduksiBase
    title="Transfer Barang Jadi"
    type="tfbarangjadi"
    endpoint="produksi/tfbarangjadi"
    storeModule="produksi"
    storageKey="produksi-tfbarangjadi"
    fileName="transfer-barang-jadi"
  />
</template>

<script>
import ProduksiBase from "@/components/pages/Produksi/ProduksiBase.vue";
export default {
  name: "TransferBarangJadi",
  components: { ProduksiBase },
};
</script>
