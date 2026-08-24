<template>
  <RegisterBase
    title="Register Stock Serial"
    type="stock-serial"
    storeModule="registerstockserial"
    apiEndpoint="report"
    scrollingMode="virtual"
    rowRenderingMode="virtual"
    :showPager="false"
    :useBuiltInPager="false"
  />
</template>

<script>
import RegisterBase from "@/components/pages/Registrasi/RegisterBase.vue";
export default {
  name: "RegisterStockSerial",
  components: { RegisterBase },
};
</script>
