<template>
  <RegisterBase
    title="Register Pemakaian Hasil Produksi"
    type="pemakaianhasilproduksi"
    storeModule="registerpemakaianhasilproduksi"
    apiEndpoint="report"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterPemakaianHasilProduksi",
  components: { RegisterBase },
};
</script>
