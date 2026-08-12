<template>
  <RegisterBase
    title="Register Serial Rekap"
    type="stock-serial-rekap"
    storeModule="registerstockserialrekap"
    apiEndpoint="report"
    :masterDetailEnabled="true"
  >
    <template #master-detail="{ data }">
      <RegisterSerialDetailTemplate :master-row="data" />
    </template>
  </RegisterBase>
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
import RegisterSerialDetailTemplate from "@/components/pages/Registrasi/RegisterSerialDetailTemplate.vue";

export default {
  name: "RegisterStockSerialRekap",
  components: { RegisterBase, RegisterSerialDetailTemplate },
};
</script>
